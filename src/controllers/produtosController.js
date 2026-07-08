const produtos = require('../models/produtos');
const validacao = require('../utils/validation');
const inventoryRules = require('../utils/inventoryRules');
const { HttpError } = require('../utils/httpError');

function produtoBody(body, parcial = false) {
    const campos = {};
    if (!parcial || body.nome !== undefined) campos.nome = validacao.texto(body.nome, 'nome', { max: 120 });
    if (!parcial || body.categoria !== undefined) {
        campos.categoria = validacao.texto(body.categoria || 'Retail', 'categoria', { max: 60 });
    }
    if (!parcial || body.preco_venda !== undefined) campos.preco_venda = validacao.dinheiro(body.preco_venda || 0, 'preco_venda');
    if (!parcial || body.custo_unitario !== undefined) campos.custo_unitario = validacao.dinheiro(body.custo_unitario || 0, 'custo_unitario');
    if (!parcial || body.estoque_atual !== undefined) campos.estoque_atual = validacao.inteiro(body.estoque_atual || 0, 'estoque_atual', 0, 99999);
    if (!parcial || body.estoque_minimo !== undefined) campos.estoque_minimo = validacao.inteiro(body.estoque_minimo || 0, 'estoque_minimo', 0, 99999);
    if (!parcial || body.controla_estoque !== undefined) {
        campos.controla_estoque = body.controla_estoque === undefined ? true : validacao.booleano(body.controla_estoque, 'controla_estoque');
    }
    if (body.observacoes !== undefined) {
        campos.observacoes = validacao.texto(body.observacoes, 'observacoes', { obrigatorio: false, max: 1000 });
    }
    return campos;
}

async function listar(req, res) {
    res.json(await produtos.listar({
        incluirInativos: req.query.incluir_inativos === 'true',
        estoqueBaixo: req.query.estoque_baixo === 'true'
    }));
}

async function buscar(req, res) {
    const produto = await produtos.buscarPorId(validacao.id(req.params.id));
    if (!produto) throw new HttpError(404, 'Produto nao encontrado.');
    res.json({ ...produto, historico: await produtos.historico(produto.id) });
}

async function criar(req, res) {
    const produto = await produtos.criar(produtoBody(req.body));
    res.status(201).json(produto);
}

async function atualizar(req, res) {
    const campos = produtoBody(req.body, true);
    if (!Object.keys(campos).length) throw new HttpError(400, 'Nenhum campo valido foi enviado.');
    const produto = await produtos.atualizar(validacao.id(req.params.id), campos);
    if (!produto) throw new HttpError(404, 'Produto nao encontrado.');
    res.json(produto);
}

async function remover(req, res) {
    const produto = await produtos.desativar(validacao.id(req.params.id));
    if (!produto) throw new HttpError(404, 'Produto ativo nao encontrado.');
    res.status(204).end();
}

async function movimentar(req, res) {
    const tipo = validacao.texto(req.body.tipo, 'tipo', { max: 20 });
    try {
        inventoryRules.normalizarTipoMovimentacao(tipo);
    } catch (error) {
        throw new HttpError(400, error.message);
    }
    const produto = await produtos.movimentar(validacao.id(req.params.id), {
        tipo,
        quantidade: validacao.inteiro(req.body.quantidade, 'quantidade', 1, 99999),
        valor_unitario: req.body.valor_unitario !== undefined
            ? validacao.dinheiro(req.body.valor_unitario, 'valor_unitario')
            : 0,
        agendamento_id: req.body.agendamento_id ? validacao.id(req.body.agendamento_id, 'agendamento_id') : null,
        observacoes: validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 1000 })
    });
    res.json(produto);
}

module.exports = { listar, buscar, criar, atualizar, remover, movimentar };
