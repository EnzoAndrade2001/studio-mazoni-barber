const { pool } = require('../config/database');

const colunas = `id, antecedencia_cancelamento_horas, antecedencia_reagendamento_horas,
    no_show_limite, no_show_bloqueio_dias, sinal_habilitado, sinal_percentual, atualizado_em`;

async function buscar(db = pool) {
    const result = await db.query(`SELECT ${colunas} FROM regras_agendamento WHERE id = 1`);
    return result.rows[0] || {
        id: 1,
        antecedencia_cancelamento_horas: 2,
        antecedencia_reagendamento_horas: 2,
        no_show_limite: 2,
        no_show_bloqueio_dias: 30,
        sinal_habilitado: false,
        sinal_percentual: 0
    };
}

async function atualizar(campos) {
    const entries = Object.entries(campos).filter(([, value]) => value !== undefined);
    if (!entries.length) return buscar();
    const sets = entries.map(([campo], index) => `${campo} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    const result = await pool.query(
        `UPDATE regras_agendamento SET ${sets.join(', ')}, atualizado_em = NOW()
         WHERE id = 1 RETURNING ${colunas}`,
        values
    );
    return result.rows[0];
}

module.exports = { buscar, atualizar };
