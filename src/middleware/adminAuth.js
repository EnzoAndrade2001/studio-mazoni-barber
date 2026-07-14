const crypto = require('crypto');
const { HttpError } = require('../utils/httpError');
const { pool } = require('../config/database');

const COOKIE_NAME = 'agenda_admin_session';
const SESSION_SECONDS = 8 * 60 * 60;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const SCRYPT_KEY_LENGTH = 64;
const attempts = new Map();

function producao() { return process.env.NODE_ENV === 'production'; }

function authDesabilitadaParaTeste() {
    return process.env.DISABLE_ADMIN_AUTH === 'true' && !producao();
}

function temBancoConfigurado() {
    return Boolean(process.env.DATABASE_URL || (process.env.DB_USER && process.env.DB_PASSWORD));
}

// In local demo mode, we mock the users to allow testing the UI without a Postgres database
const demoUsers = [
    { id: 1, usuario: 'leo', nome: 'Léo', dono: true, senha_hash: 'mock' },
    { id: 2, usuario: 'gustavo', nome: 'Gustavo', dono: false, senha_hash: 'mock' },
    { id: 3, usuario: 'derick', nome: 'Derick', dono: false, senha_hash: 'mock' }
];

function cookieSeguro() {
    return producao() || (process.env.PUBLIC_BASE_URL || '').startsWith('https://');
}

function parseCookies(header = '') {
    return Object.fromEntries(header.split(';').map((item) => {
        const [key, ...value] = item.trim().split('=');
        return [key, decodeURIComponent(value.join('='))];
    }).filter(([key]) => key));
}

function sessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || 'chave-secreta-padrao-fallback';
}

function assinar(payload) {
    return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function safeEqualText(a = '', b = '') {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

function validarSenhaHash(senha, hashConfig) {
    if (hashConfig === 'mock') return true; // Accept any password in demo mode
    const [algoritmo, salt, hash] = String(hashConfig || '').split('$');
    if (algoritmo !== 'scrypt' || !salt || !hash) return false;
    const senhaHash = crypto.scryptSync(String(senha || ''), salt, SCRYPT_KEY_LENGTH).toString('base64url');
    return safeEqualText(senhaHash, hash);
}

function criarSessao(userId, role, nome) {
    const payload = Buffer.from(JSON.stringify({
        iat: Date.now(),
        exp: Date.now() + SESSION_SECONDS * 1000,
        userId,
        role,
        nome
    })).toString('base64url');
    return `${payload}.${assinar(payload)}`;
}

function obterSessaoToken(req) {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (!token || !token.includes('.')) return null;
    const [payload, signature] = token.split('.');
    const expected = assinar(payload);
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (Number(data.exp) < Date.now()) return null;
        return data; // { userId, role, nome }
    } catch (error) {
        return null;
    }
}

function sessaoValida(req) {
    // Se o auth esta totalmente desabilitado para teste automatizado (bypass total)
    if (authDesabilitadaParaTeste()) {
        req.admin = { userId: 1, role: 'admin', nome: 'Léo (Demo)' };
        return true;
    }

    const data = obterSessaoToken(req);
    if (data) {
        req.admin = data;
        return true;
    }
    return false;
}

function setSessionCookie(res, userId, role, nome) {
    const secure = cookieSeguro() ? '; Secure' : '';
    res.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${encodeURIComponent(criarSessao(userId, role, nome))}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${secure}`
    );
}

function clearSessionCookie(res) {
    const secure = cookieSeguro() ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

function clientKey(req) { return req.ip || req.socket.remoteAddress || 'unknown'; }

function registrarFalha(req) {
    const key = clientKey(req);
    const now = Date.now();
    const current = attempts.get(key);
    if (!current || current.resetAt < now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return;
    }
    current.count += 1;
}

function muitasTentativas(req) {
    const current = attempts.get(clientKey(req));
    return Boolean(current && current.resetAt > Date.now() && current.count >= MAX_ATTEMPTS);
}

function limparTentativas(req) {
    attempts.delete(clientKey(req));
}

// Middleware: Qualquer login valido serve (agenda)
function exigirAdmin(req, res, next) {
    if (sessaoValida(req)) return next();
    return next(new HttpError(401, 'Acesso administrativo nao autorizado.'));
}

// Middleware: Apenas dono pode (financeiro, produtos, config)
function exigirDono(req, res, next) {
    if (sessaoValida(req) && req.admin && req.admin.role === 'admin') return next();
    return next(new HttpError(403, 'Acesso restrito apenas ao dono.'));
}

function statusAdmin(req, res) {
    const isLogado = sessaoValida(req);
    res.json({
        protegido: !authDesabilitadaParaTeste(),
        autenticado: isLogado,
        role: isLogado ? req.admin.role : null,
        nome: isLogado ? req.admin.nome : null,
        usuario_obrigatorio: true
    });
}

async function loginAdmin(req, res, next) {
    if (muitasTentativas(req)) {
        return next(new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'));
    }
    
    const usuario = String(req.body.usuario || '').trim().toLowerCase();
    const token = req.body.token;

    // Modo Demonstracao (Local Sem Banco)
    if (!temBancoConfigurado()) {
        const mockUser = demoUsers.find(u => u.usuario === usuario);
        if (!mockUser) {
            registrarFalha(req);
            return next(new HttpError(401, 'Usuario de demonstracao nao encontrado. Tente: leo, gustavo ou derick.'));
        }
        // Em modo local demo sem banco, aceitamos qualquer senha (mock)
        const role = mockUser.dono ? 'admin' : 'barber';
        setSessionCookie(res, mockUser.id, role, mockUser.nome);
        limparTentativas(req);
        return res.json({ autenticado: true, role, nome: mockUser.nome });
    }

    // Modo Producao (Com Banco PostgreSQL)
    try {
        const { rows } = await pool.query('SELECT id, nome, dono, senha_hash FROM profissionais WHERE usuario = $1', [usuario]);
        if (rows.length === 0 || !rows[0].senha_hash) {
            registrarFalha(req);
            return next(new HttpError(401, 'Usuario ou senha invalida.'));
        }
        
        const profissional = rows[0];
        if (!validarSenhaHash(token, profissional.senha_hash)) {
            registrarFalha(req);
            return next(new HttpError(401, 'Usuario ou senha invalida.'));
        }
        
        limparTentativas(req);
        const role = profissional.dono ? 'admin' : 'barber';
        setSessionCookie(res, profissional.id, role, profissional.nome);
        res.json({ autenticado: true, role, nome: profissional.nome });
    } catch (e) {
        return next(new HttpError(500, 'Erro interno ao validar login.'));
    }
}

function logoutAdmin(req, res) {
    clearSessionCookie(res);
    res.status(204).end();
}

module.exports = {
    exigirAdmin,
    exigirDono,
    statusAdmin,
    loginAdmin,
    logoutAdmin
};
