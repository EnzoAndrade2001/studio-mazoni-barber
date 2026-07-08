const { pool } = require('../config/database');

const colunas = `le.id, le.cliente_id, le.nome, le.telefone, le.servico_id, s.nome AS servico_nome,
    le.profissional_id, p.nome AS profissional_nome, p.apelido AS profissional_apelido,
    le.data_preferida::text AS data_preferida, le.periodo, le.status, le.observacoes,
    le.criado_em, le.atualizado_em`;

const joins = `
    FROM lista_espera le
    LEFT JOIN servicos s ON s.id = le.servico_id
    LEFT JOIN profissionais p ON p.id = le.profissional_id`;

async function listar({ status = 'aguardando', data } = {}) {
    const values = [];
    const filtros = [];
    if (status) {
        values.push(status);
        filtros.push(`le.status = $${values.length}`);
    }
    if (data) {
        values.push(data);
        filtros.push(`le.data_preferida = $${values.length}::date`);
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${colunas} ${joins} ${where} ORDER BY le.criado_em`, values);
    return result.rows;
}

async function listarComVagas({ limite = 30, dias = 14 } = {}) {
    const result = await pool.query(
        `SELECT ${colunas},
                vaga.inicio AS vaga_inicio,
                vaga.fim AS vaga_fim,
                vaga.servico_id AS vaga_servico_id,
                vaga.servico_nome AS vaga_servico_nome,
                vaga.servico_duracao_minutos AS vaga_servico_duracao_minutos,
                vaga.servico_preco AS vaga_servico_preco,
                vaga.profissional_id AS vaga_profissional_id,
                vaga.profissional_nome AS vaga_profissional_nome,
                vaga.profissional_apelido AS vaga_profissional_apelido
         ${joins}
         JOIN LATERAL (
            SELECT
                slot.inicio,
                slot.inicio + make_interval(mins => s.duracao_minutos) AS fim,
                s.id AS servico_id,
                s.nome AS servico_nome,
                s.duracao_minutos AS servico_duracao_minutos,
                s.preco::float AS servico_preco,
                p.id AS profissional_id,
                p.nome AS profissional_nome,
                p.apelido AS profissional_apelido
            FROM generate_series(
                COALESCE(le.data_preferida, CURRENT_DATE),
                COALESCE(le.data_preferida, CURRENT_DATE + ($2::int * INTERVAL '1 day')),
                INTERVAL '1 day'
            ) AS dia(data)
            JOIN horarios_funcionamento hf ON hf.dia_semana = EXTRACT(ISODOW FROM dia.data)::int AND hf.aberto
            JOIN configuracoes c ON TRUE
            JOIN servicos s ON s.ativo AND (le.servico_id IS NULL OR s.id = le.servico_id)
            JOIN profissionais p ON p.ativo AND (le.profissional_id IS NULL OR p.id = le.profissional_id)
            CROSS JOIN LATERAL generate_series(
                ((dia.data::date + hf.abertura) AT TIME ZONE 'America/Sao_Paulo'),
                ((dia.data::date + hf.fechamento) AT TIME ZONE 'America/Sao_Paulo') - make_interval(mins => s.duracao_minutos),
                make_interval(mins => c.intervalo_minutos)
            ) AS slot(inicio)
            WHERE slot.inicio >= NOW()
              AND (
                  le.periodo IS NULL OR le.periodo = ''
                  OR LOWER(le.periodo) IN ('qualquer', 'qualquer periodo', 'qualquer horário', 'qualquer horario')
                  OR (LOWER(le.periodo) LIKE '%manha%' AND slot.inicio::time < TIME '12:00')
                  OR (LOWER(le.periodo) LIKE '%fim da tarde%' AND slot.inicio::time >= TIME '17:00')
                  OR (LOWER(le.periodo) LIKE '%tarde%' AND slot.inicio::time >= TIME '12:00' AND slot.inicio::time < TIME '18:00')
                  OR (LOWER(le.periodo) LIKE '%noite%' AND slot.inicio::time >= TIME '18:00')
                  OR (LOWER(le.periodo) LIKE '%18%' AND slot.inicio::time >= TIME '18:00')
                  OR (LOWER(le.periodo) LIKE '%19%' AND slot.inicio::time >= TIME '19:00')
                  OR (LOWER(le.periodo) LIKE '%20%' AND slot.inicio::time >= TIME '20:00')
              )
              AND NOT EXISTS (
                  SELECT 1 FROM agendamentos a
                  WHERE a.status NOT IN ('cancelado', 'faltou')
                    AND a.profissional_id = p.id
                    AND a.inicio < slot.inicio + make_interval(mins => s.duracao_minutos)
                    AND a.fim > slot.inicio
              )
              AND NOT EXISTS (
                  SELECT 1 FROM bloqueios b
                  WHERE b.inicio < slot.inicio + make_interval(mins => s.duracao_minutos)
                    AND b.fim > slot.inicio
              )
            ORDER BY slot.inicio, p.ordem NULLS LAST, p.nome, s.duracao_minutos
            LIMIT 1
         ) vaga ON TRUE
         WHERE le.status = 'aguardando'
         ORDER BY vaga.inicio, le.criado_em
         LIMIT $1`,
        [limite, dias]
    );
    return result.rows;
}

async function criar({ cliente_id, nome, telefone, servico_id, profissional_id, data_preferida, periodo, observacoes }) {
    const result = await pool.query(
        `INSERT INTO lista_espera
         (cliente_id, nome, telefone, servico_id, profissional_id, data_preferida, periodo, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8)
         RETURNING id`,
        [cliente_id || null, nome, telefone, servico_id || null, profissional_id || null, data_preferida || null, periodo, observacoes]
    );
    return buscarPorId(result.rows[0].id);
}

async function buscarPorId(id) {
    const result = await pool.query(`SELECT ${colunas} ${joins} WHERE le.id = $1`, [id]);
    return result.rows[0] || null;
}

async function atualizar(id, campos) {
    const entries = Object.entries(campos).filter(([, value]) => value !== undefined);
    if (!entries.length) return buscarPorId(id);
    const sets = entries.map(([campo], index) => `${campo} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await pool.query(
        `UPDATE lista_espera SET ${sets.join(', ')}, atualizado_em = NOW()
         WHERE id = $${values.length}
         RETURNING id`,
        values
    );
    return result.rowCount ? buscarPorId(id) : null;
}

module.exports = { listar, listarComVagas, criar, buscarPorId, atualizar };
