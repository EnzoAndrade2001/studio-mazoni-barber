const crypto = require('crypto');
const { HttpError } = require('./httpError');

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64url(value) {
    return Buffer.from(value).toString('base64url');
}

function jsonBase64url(value) {
    return base64url(JSON.stringify(value));
}

function secret() {
    const value = process.env.PUBLIC_ACTION_SECRET
        || process.env.ADMIN_SESSION_SECRET
        || process.env.ADMIN_PASSWORD_HASH
        || process.env.ADMIN_TOKEN;
    if (!value) throw new HttpError(500, 'PUBLIC_ACTION_SECRET ou segredo admin nao configurado.');
    return value;
}

function sign(payloadPart) {
    return crypto
        .createHmac('sha256', secret())
        .update(payloadPart)
        .digest('base64url');
}

function createToken({ agendamentoId, action, ttlSeconds = DEFAULT_TTL_SECONDS, now = Date.now() }) {
    const payload = {
        agendamento_id: Number(agendamentoId),
        action,
        exp: Math.floor(now / 1000) + ttlSeconds
    };
    const payloadPart = jsonBase64url(payload);
    return `${payloadPart}.${sign(payloadPart)}`;
}

function verifyToken(token, { now = Date.now() } = {}) {
    const [payloadPart, signature] = String(token || '').split('.');
    if (!payloadPart || !signature) throw new HttpError(400, 'Token invalido.');
    const expected = sign(payloadPart);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    const valid = signatureBuffer.length === expectedBuffer.length
        && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    if (!valid) throw new HttpError(403, 'Token invalido.');
    let payload;
    try {
        payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    } catch {
        throw new HttpError(400, 'Token invalido.');
    }
    if (!payload.exp || payload.exp < Math.floor(now / 1000)) {
        throw new HttpError(410, 'Token expirado.');
    }
    return payload;
}

function publicBaseUrl(req) {
    return (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function actionUrl({ req, agendamentoId, action }) {
    const token = createToken({ agendamentoId, action });
    return `${publicBaseUrl(req)}/agendamento/${action}?token=${encodeURIComponent(token)}`;
}

function actionUrls(req, agendamentoId) {
    return {
        confirmar: actionUrl({ req, agendamentoId, action: 'confirmar' }),
        cancelar: actionUrl({ req, agendamentoId, action: 'cancelar' }),
        reagendar: actionUrl({ req, agendamentoId, action: 'reagendar' })
    };
}

module.exports = {
    createToken,
    verifyToken,
    actionUrl,
    actionUrls,
    publicBaseUrl
};
