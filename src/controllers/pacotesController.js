const pacotes = require('../models/pacotes');
const validacao = require('../utils/validation');
const { HttpError } = require('../utils/httpError');

async function listar(req, res) {
    const apenasAtivos = req.query.incluir_inativos !== 'true';
    res.json(await pacotes.listar(apenasAtivos));
}

async function buscar(req, res) {
    const id = validacao.id(req.params.id);
    const item = await pacotes.buscarPorId(id);
    if (!item) throw new HttpError(404, 'Plano/Pacote nao encontrado.');
    res.json(item);
}

async function criar(req, res) {
    const nome = validacao.texto(req.body.nome, 'nome', { max: 120 });
    const descricao = validacao.texto(req.body.descricao, 'descricao', { obrigatorio: false });
    const valor = validacao.dinheiro(req.body.valor, 'valor');
    const quantidade_sessoes = validacao.inteiro(req.body.quantidade_sessoes, 'quantidade_sessoes', 1, 100);
    const servico_id = req.body.servico_id ? validacao.id(req.body.servico_id, 'servico_id') : null;
    const validade_dias = req.body.validade_dias ? validacao.inteiro(req.body.validade_dias, 'validade_dias', 1, 365) : 30;

    const criado = await pacotes.criar({
        nome,
        descricao,
        valor,
        quantidade_sessoes,
        servico_id,
        validade_dias
    });
    res.status(201).json(criado);
}

async function atualizar(req, res) {
    const id = validacao.id(req.params.id);
    const campos = {};
    if (req.body.nome !== undefined) campos.nome = validacao.texto(req.body.nome, 'nome', { max: 120 });
    if (req.body.descricao !== undefined) campos.descricao = validacao.texto(req.body.descricao, 'descricao', { obrigatorio: false });
    if (req.body.valor !== undefined) campos.valor = validacao.dinheiro(req.body.valor, 'valor');
    if (req.body.quantidade_sessoes !== undefined) campos.quantidade_sessoes = validacao.inteiro(req.body.quantidade_sessoes, 'quantidade_sessoes', 1, 100);
    if (req.body.servico_id !== undefined) campos.servico_id = req.body.servico_id ? validacao.id(req.body.servico_id, 'servico_id') : null;
    if (req.body.validade_dias !== undefined) campos.validade_dias = validacao.inteiro(req.body.validade_dias, 'validade_dias', 1, 365);
    if (req.body.ativo !== undefined) campos.ativo = validacao.booleano(req.body.ativo, 'ativo');

    if (!Object.keys(campos).length) throw new HttpError(400, 'Nenhum campo valido foi enviado.');

    const atualizado = await pacotes.atualizar(id, campos);
    if (!atualizado) throw new HttpError(404, 'Plano/Pacote nao encontrado.');
    res.json(atualizado);
}

async function remover(req, res) {
    const id = validacao.id(req.params.id);
    const desativado = await pacotes.desativar(id);
    if (!desativado) throw new HttpError(404, 'Plano/Pacote nao encontrado.');
    res.status(204).end();
}

// Associações de Clientes

async function listarDoCliente(req, res) {
    const clienteId = validacao.id(req.params.clienteId);
    res.json(await pacotes.listarPacotesDoCliente(clienteId));
}

async function adquirir(req, res) {
    const cliente_id = validacao.id(req.body.cliente_id, 'cliente_id');
    const pacote_id = validacao.id(req.body.pacote_id, 'pacote_id');
    const pago = req.body.pago !== undefined ? validacao.booleano(req.body.pago, 'pago') : false;

    const adquirido = await pacotes.adquirirPacote({
        cliente_id,
        pacote_id,
        pago
    });
    res.status(201).json(adquirido);
}

async function atualizarPagamento(req, res) {
    const id = validacao.id(req.params.id);
    const pago = validacao.booleano(req.body.pago, 'pago');

    const atualizado = await pacotes.atualizarPagamento(id, pago);
    if (!atualizado) throw new HttpError(404, 'Plano do cliente nao encontrado.');
    res.json(atualizado);
}

module.exports = {
    listar,
    buscar,
    criar,
    atualizar,
    remover,
    listarDoCliente,
    adquirir,
    atualizarPagamento
};
