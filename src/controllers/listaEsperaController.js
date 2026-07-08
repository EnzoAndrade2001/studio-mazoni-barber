const listaEspera = require('../models/listaEspera');
const clientes = require('../models/clientes');
const validacao = require('../utils/validation');
const { HttpError } = require('../utils/httpError');

const statuses = ['aguardando', 'avisado', 'convertido', 'cancelado'];

function status(value = 'aguardando') {
    if (!statuses.includes(value)) throw new HttpError(400, `Status invalido. Use: ${statuses.join(', ')}.`);
    return value;
}

function dataOpcional(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new HttpError(400, 'data_preferida deve estar no formato AAAA-MM-DD.');
    }
    return value;
}

async function listar(req, res) {
    res.json(await listaEspera.listar({
        status: req.query.status ? status(req.query.status) : undefined,
        data: req.query.data ? dataOpcional(req.query.data) : undefined
    }));
}

async function inteligente(req, res) {
    res.json(await listaEspera.listarComVagas({
        limite: req.query.limite ? validacao.inteiro(req.query.limite, 'limite', 1, 100) : 30,
        dias: req.query.dias ? validacao.inteiro(req.query.dias, 'dias', 1, 60) : 14
    }));
}

async function criarPublico(req, res) {
    const telefone = validacao.telefone(req.body.telefone);
    const cliente = await clientes.buscarPorTelefone(telefone);
    const item = await listaEspera.criar({
        cliente_id: cliente ? cliente.id : null,
        nome: validacao.texto(req.body.nome || (cliente && cliente.nome), 'nome', { max: 120 }),
        telefone,
        servico_id: req.body.servico_id ? validacao.id(req.body.servico_id, 'servico_id') : null,
        profissional_id: req.body.profissional_id ? validacao.id(req.body.profissional_id, 'profissional_id') : null,
        data_preferida: dataOpcional(req.body.data_preferida),
        periodo: validacao.texto(req.body.periodo, 'periodo', { obrigatorio: false, max: 30 }),
        observacoes: validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 500 })
    });
    res.status(201).json(item);
}

async function atualizar(req, res) {
    const campos = {};
    if (req.body.status !== undefined) campos.status = status(req.body.status);
    if (req.body.observacoes !== undefined) {
        campos.observacoes = validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 500 });
    }
    const item = await listaEspera.atualizar(validacao.id(req.params.id), campos);
    if (!item) throw new HttpError(404, 'Item da lista de espera nao encontrado.');
    res.json(item);
}

module.exports = { listar, inteligente, criarPublico, atualizar };
