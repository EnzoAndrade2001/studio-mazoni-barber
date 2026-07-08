const { pool } = require('../config/database');

async function listar() {
    const result = await pool.query(
        `SELECT dia_semana, aberto, abertura::text, fechamento::text
         FROM horarios_funcionamento
         ORDER BY dia_semana`
    );
    return result.rows;
}

async function buscarPorDia(diaSemana, db = pool) {
    const result = await db.query(
        `SELECT dia_semana, aberto, abertura::text, fechamento::text
         FROM horarios_funcionamento
         WHERE dia_semana = $1`,
        [diaSemana]
    );
    return result.rows[0] || null;
}

async function atualizar(diaSemana, { aberto, abertura, fechamento }) {
    const result = await pool.query(
        `UPDATE horarios_funcionamento SET
            aberto = COALESCE($2, aberto),
            abertura = COALESCE($3, abertura),
            fechamento = COALESCE($4, fechamento),
            atualizado_em = NOW()
         WHERE dia_semana = $1
         RETURNING dia_semana, aberto, abertura::text, fechamento::text`,
        [diaSemana, aberto ?? null, abertura ?? null, fechamento ?? null]
    );
    return result.rows[0] || null;
}

module.exports = { listar, buscarPorDia, atualizar };
