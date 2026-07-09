const { pool } = require('../config/database');

async function listar(apenasAtivos = true) {
    const query = apenasAtivos
        ? 'SELECT p.*, s.nome AS servico_nome FROM pacotes p LEFT JOIN servicos s ON s.id = p.servico_id WHERE p.ativo = TRUE ORDER BY p.nome'
        : 'SELECT p.*, s.nome AS servico_nome FROM pacotes p LEFT JOIN servicos s ON s.id = p.servico_id ORDER BY p.nome';
    
    const result = await pool.query(query);
    return result.rows;
}

async function buscarPorId(id) {
    const result = await pool.query(
        'SELECT p.*, s.nome AS servico_nome FROM pacotes p LEFT JOIN servicos s ON s.id = p.servico_id WHERE p.id = $1',
        [id]
    );
    return result.rows[0] || null;
}

async function criar({ nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias }) {
    const result = await pool.query(
        `INSERT INTO pacotes (nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias]
    );
    return result.rows[0];
}

async function atualizar(id, campos) {
    const entries = Object.entries(campos);
    const sets = entries.map(([chave], index) => `${chave} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await pool.query(
        `UPDATE pacotes SET ${sets.join(', ')}, atualizado_em = NOW()
         WHERE id = $${values.length} RETURNING *`,
        values
    );
    return result.rows[0] || null;
}

async function desativar(id) {
    const result = await pool.query(
        'UPDATE pacotes SET ativo = FALSE, atualizado_em = NOW() WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
}

// Relacionamento Cliente -> Pacote

async function listarPacotesDoCliente(clienteId) {
    const result = await pool.query(
        `SELECT pc.*, p.nome AS pacote_nome, p.descricao AS pacote_descricao, s.nome AS servico_nome 
         FROM pacote_clientes pc
         JOIN pacotes p ON p.id = pc.pacote_id
         LEFT JOIN servicos s ON s.id = p.servico_id
         WHERE pc.cliente_id = $1
         ORDER BY pc.criado_em DESC`,
        [clienteId]
    );
    return result.rows;
}

async function adquirirPacote({ cliente_id, pacote_id, pago = false }) {
    const pacote = await buscarPorId(pacote_id);
    if (!pacote) throw new Error('Plano/Pacote nao encontrado.');

    const result = await pool.query(
        `INSERT INTO pacote_clientes (cliente_id, pacote_id, sessoes_restantes, sessoes_totais, pago)
         VALUES ($1, $2, $3, $3, $4)
         RETURNING *`,
        [cliente_id, pacote_id, pacote.quantidade_sessoes, pago]
    );
    return result.rows[0];
}

async function consumirSessao(pacoteClienteId, db = pool) {
    const result = await db.query(
        `UPDATE pacote_clientes 
         SET sessoes_restantes = GREATEST(sessoes_restantes - 1, 0), atualizado_em = NOW()
         WHERE id = $1 AND sessoes_restantes > 0
         RETURNING *`,
        [pacoteClienteId]
    );
    return result.rows[0] || null;
}

async function atualizarPagamento(pacoteClienteId, pago) {
    const result = await pool.query(
        `UPDATE pacote_clientes 
         SET pago = $2, atualizado_em = NOW()
         WHERE id = $1
         RETURNING *`,
        [pacoteClienteId, pago]
    );
    return result.rows[0] || null;
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    desativar,
    listarPacotesDoCliente,
    adquirirPacote,
    consumirSessao,
    atualizarPagamento
};
