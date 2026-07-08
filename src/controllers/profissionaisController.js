const profissionais = require('../models/profissionais');
const validacao = require('../utils/validation');
const { HttpError } = require('../utils/httpError');

async function listar(req, res) {
    res.json(await profissionais.listar(req.query.incluir_inativos === 'true'));
}

async function buscar(req, res) {
    const profissional = await profissionais.buscarPorId(validacao.id(req.params.id));
    if (!profissional) throw new HttpError(404, 'Profissional nao encontrado.');
    res.json(profissional);
}

function payload(req) {
    const campos = {};
    if (req.body.nome !== undefined) campos.nome = validacao.texto(req.body.nome, 'nome', { min: 2, max: 120 });
    if (req.body.apelido !== undefined) campos.apelido = req.body.apelido
        ? validacao.texto(req.body.apelido, 'apelido', { max: 80 })
        : null;
    if (req.body.bio !== undefined) campos.bio = req.body.bio
        ? validacao.texto(req.body.bio, 'bio', { max: 240 })
        : null;
    if (req.body.dono !== undefined) campos.dono = validacao.booleano(req.body.dono, 'dono');
    if (req.body.comissao_percentual !== undefined) {
        campos.comissao_percentual = validacao.dinheiro(req.body.comissao_percentual, 'comissao_percentual');
        if (campos.comissao_percentual > 100) throw new HttpError(400, 'comissao_percentual deve estar entre 0 e 100.');
    }
    if (req.body.ordem !== undefined) campos.ordem = validacao.inteiro(req.body.ordem, 'ordem', 0, 999);
    if (req.body.ativo !== undefined) campos.ativo = validacao.booleano(req.body.ativo, 'ativo');
    return campos;
}

async function criar(req, res) {
    const campos = payload(req);
    if (!campos.nome) throw new HttpError(400, 'Nome do profissional e obrigatorio.');
    res.status(201).json(await profissionais.criar(campos));
}

async function atualizar(req, res) {
    const campos = payload(req);
    if (!Object.keys(campos).length) throw new HttpError(400, 'Nenhum campo valido foi enviado.');
    const profissional = await profissionais.atualizar(validacao.id(req.params.id), campos);
    if (!profissional) throw new HttpError(404, 'Profissional nao encontrado.');
    res.json(profissional);
}

async function remover(req, res) {
    const removido = await profissionais.desativar(validacao.id(req.params.id));
    if (!removido) throw new HttpError(404, 'Profissional nao encontrado.');
    res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, remover };
