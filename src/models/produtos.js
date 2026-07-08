const { pool } = require('../config/database');
const inventoryRules = require('../utils/inventoryRules');
const { HttpError } = require('../utils/httpError');

const colunas = `id, nome, categoria, preco_venda::float AS preco_venda, custo_unitario::float AS custo_unitario,
    estoque_atual, estoque_minimo, controla_estoque, ativo, observacoes, criado_em, atualizado_em`;

function withAlerta(produto) {
    return {
        ...produto,
        estoque_baixo: inventoryRules.estoqueBaixo(produto)
    };
}

async function listar({ incluirInativos = false, estoqueBaixo = false } = {}) {
    const filtros = [];
    if (!incluirInativos) filtros.push('ativo = TRUE');
    if (estoqueBaixo) filtros.push('controla_estoque = TRUE AND estoque_atual <= estoque_minimo');
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${colunas} FROM produtos ${where} ORDER BY estoque_atual <= estoque_minimo DESC, nome`);
    return result.rows.map(withAlerta);
}

async function buscarPorId(id, db = pool) {
    const result = await db.query(`SELECT ${colunas} FROM produtos WHERE id = $1`, [id]);
    return result.rows[0] ? withAlerta(result.rows[0]) : null;
}

async function criar(campos) {
    const result = await pool.query(
        `INSERT INTO produtos
         (nome, categoria, preco_venda, custo_unitario, estoque_atual, estoque_minimo, controla_estoque, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${colunas}`,
        [
            campos.nome,
            campos.categoria || 'Retail',
            campos.preco_venda,
            campos.custo_unitario,
            campos.estoque_atual,
            campos.estoque_minimo,
            campos.controla_estoque,
            campos.observacoes
        ]
    );
    return withAlerta(result.rows[0]);
}

async function atualizar(id, campos) {
    const entries = Object.entries(campos).filter(([, value]) => value !== undefined);
    if (!entries.length) return buscarPorId(id);
    const sets = entries.map(([campo], index) => `${campo} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await pool.query(
        `UPDATE produtos SET ${sets.join(', ')}, atualizado_em = NOW()
         WHERE id = $${values.length} RETURNING ${colunas}`,
        values
    );
    return result.rows[0] ? withAlerta(result.rows[0]) : null;
}

async function desativar(id) {
    const result = await pool.query(
        `UPDATE produtos SET ativo = FALSE, atualizado_em = NOW()
         WHERE id = $1 AND ativo = TRUE RETURNING ${colunas}`,
        [id]
    );
    return result.rows[0] ? withAlerta(result.rows[0]) : null;
}

async function movimentar(id, campos) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const produto = await buscarPorId(id, client);
        if (!produto || !produto.ativo) throw new HttpError(404, 'Produto ativo nao encontrado.');
        const tipo = inventoryRules.normalizarTipoMovimentacao(campos.tipo);
        const novoEstoque = inventoryRules.calcularNovoEstoque(produto.estoque_atual, {
            tipo,
            quantidade: campos.quantidade
        });
        await client.query(
            `INSERT INTO produto_movimentacoes
             (produto_id, tipo, quantidade, valor_unitario, agendamento_id, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, tipo, campos.quantidade, campos.valor_unitario, campos.agendamento_id || null, campos.observacoes]
        );
        await client.query(
            `UPDATE produtos SET estoque_atual = $1, atualizado_em = NOW() WHERE id = $2`,
            [novoEstoque, id]
        );
        await client.query('COMMIT');
        return buscarPorId(id);
    } catch (error) {
        await client.query('ROLLBACK');
        if (error instanceof HttpError) throw error;
        if (error.message.includes('Estoque') || error.message.includes('Quantidade') || error.message.includes('Tipo')) {
            throw new HttpError(400, error.message);
        }
        throw error;
    } finally {
        client.release();
    }
}

async function historico(id, limite = 20) {
    const result = await pool.query(
        `SELECT pm.id, pm.tipo, pm.quantidade, pm.valor_unitario::float AS valor_unitario,
                pm.agendamento_id, pm.observacoes, pm.criado_em
         FROM produto_movimentacoes pm
         WHERE pm.produto_id = $1
         ORDER BY pm.criado_em DESC
         LIMIT $2`,
        [id, limite]
    );
    return result.rows;
}

module.exports = { listar, buscarPorId, criar, atualizar, desativar, movimentar, historico };
