const { pool } = require('../config/database');

const colunas = 'id, nome, apelido, bio, dono, comissao_percentual::float AS comissao_percentual, ordem, ativo, criado_em, atualizado_em';

async function listar(incluirInativos = false) {
    const where = incluirInativos ? '' : 'WHERE ativo = TRUE';
    const result = await pool.query(`SELECT ${colunas} FROM profissionais ${where} ORDER BY ordem, nome`);
    return result.rows;
}

async function buscarPorId(id, db = pool) {
    const result = await db.query(`SELECT ${colunas} FROM profissionais WHERE id = $1`, [id]);
    return result.rows[0] || null;
}

async function primeiroAtivo(db = pool) {
    const result = await db.query(`SELECT ${colunas} FROM profissionais WHERE ativo = TRUE ORDER BY ordem, nome LIMIT 1`);
    return result.rows[0] || null;
}

async function criar({ nome, apelido, bio, dono = false, comissao_percentual = 50, ordem = 0 }) {
    const result = await pool.query(
        `INSERT INTO profissionais (nome, apelido, bio, dono, comissao_percentual, ordem)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${colunas}`,
        [nome, apelido, bio, dono, comissao_percentual, ordem]
    );
    return result.rows[0];
}

async function atualizar(id, campos) {
    const atual = await buscarPorId(id);
    if (!atual) return null;
    const result = await pool.query(
        `UPDATE profissionais SET
            nome = COALESCE($2, nome),
            apelido = COALESCE($3, apelido),
            bio = COALESCE($4, bio),
            dono = COALESCE($5, dono),
            comissao_percentual = COALESCE($6, comissao_percentual),
            ordem = COALESCE($7, ordem),
            ativo = COALESCE($8, ativo),
            atualizado_em = NOW()
         WHERE id = $1
         RETURNING ${colunas}`,
        [
            id,
            campos.nome ?? null,
            campos.apelido ?? null,
            campos.bio ?? null,
            campos.dono ?? null,
            campos.comissao_percentual ?? null,
            campos.ordem ?? null,
            campos.ativo ?? null
        ]
    );
    return result.rows[0] || null;
}

async function desativar(id) {
    const result = await pool.query(
        `UPDATE profissionais SET ativo = FALSE, atualizado_em = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );
    return Boolean(result.rowCount);
}

module.exports = { listar, buscarPorId, primeiroAtivo, criar, atualizar, desativar };
