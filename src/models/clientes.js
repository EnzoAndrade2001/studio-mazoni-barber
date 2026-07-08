const { pool } = require('../config/database');
const { calcularScoreCliente } = require('../utils/clientTrustScore');

const colunas = "id, nome, telefone, email, preferencias, observacoes, ativo, criado_em, atualizado_em";

async function listar(busca, incluirInativos = false) {
    const values = [];
    const filtros = [];
    if (!incluirInativos) filtros.push('ativo = TRUE');
    if (busca) {
        values.push(`%${busca}%`);
        filtros.push(`(nome ILIKE $${values.length} OR telefone LIKE $${values.length})`);
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${colunas} FROM clientes ${where} ORDER BY nome`, values);
    return result.rows;
}

async function buscarPorId(id) {
    const result = await pool.query(`SELECT ${colunas} FROM clientes WHERE id = $1`, [id]);
    return result.rows[0] || null;
}

async function historico(id, limite = 20, db = pool) {
    const result = await db.query(
        `SELECT
            a.id, a.inicio, a.fim, a.status, a.pagamento_status,
            a.valor_pago::float AS valor_pago, a.preco::float AS preco,
            s.nome AS servico_nome,
            p.nome AS profissional_nome,
            p.apelido AS profissional_apelido
         FROM agendamentos a
         JOIN servicos s ON s.id = a.servico_id
         LEFT JOIN profissionais p ON p.id = a.profissional_id
         WHERE a.cliente_id = $1
         ORDER BY a.inicio DESC
         LIMIT $2`,
        [id, limite]
    );
    return result.rows;
}

async function buscarCompletoPorId(id) {
    const cliente = await buscarPorId(id);
    if (!cliente) return null;
    const stats = await estatisticas(id);
    return {
        ...cliente,
        estatisticas: stats,
        score_confianca: calcularScoreCliente(stats),
        historico: await historico(id)
    };
}

async function buscarPorTelefone(telefone) {
    const result = await pool.query(`SELECT ${colunas} FROM clientes WHERE telefone = $1 AND ativo = TRUE`, [telefone]);
    return result.rows[0] || null;
}

async function estatisticas(id, db = pool) {
    const result = await db.query(
        `SELECT
            COUNT(*) FILTER (WHERE status NOT IN ('cancelado', 'faltou'))::int AS total_agendamentos,
            COUNT(*) FILTER (WHERE status = 'concluido')::int AS atendimentos_concluidos,
            COUNT(*) FILTER (WHERE status = 'faltou')::int AS no_shows,
            COUNT(*) FILTER (WHERE status = 'cancelado')::int AS cancelamentos,
            COUNT(*) FILTER (
                WHERE status = 'cancelado'
                  AND atualizado_em >= inicio - INTERVAL '2 hours'
            )::int AS cancelamentos_em_cima,
            MAX(inicio) FILTER (WHERE status = 'faltou') AS ultimo_no_show_em,
            MAX(inicio) FILTER (WHERE status NOT IN ('cancelado', 'faltou')) AS ultimo_agendamento_em,
            CASE
                WHEN MAX(inicio) FILTER (WHERE status NOT IN ('cancelado', 'faltou')) IS NULL THEN NULL
                ELSE (CURRENT_DATE - (MAX(inicio) FILTER (WHERE status NOT IN ('cancelado', 'faltou')))::date)::int
            END AS dias_desde_ultimo_agendamento,
            ROUND(AVG(intervalo_dias) FILTER (WHERE status NOT IN ('cancelado', 'faltou')))::int AS frequencia_media_dias,
            COALESCE(SUM(valor_pago) FILTER (WHERE pagamento_status IN ('parcial', 'pago')), 0)::float AS total_pago
         FROM (
            SELECT a.*,
                   (a.inicio::date - LAG(a.inicio::date) OVER (PARTITION BY a.cliente_id ORDER BY a.inicio)) AS intervalo_dias
            FROM agendamentos a
            WHERE a.cliente_id = $1
         ) agendamentos
         WHERE cliente_id = $1`,
        [id]
    );
    return result.rows[0];
}

async function buscarReconhecidoPorTelefone(telefone) {
    const cliente = await buscarPorTelefone(telefone);
    if (!cliente) return null;
    const stats = await estatisticas(cliente.id);
    return {
        ...cliente,
        estatisticas: stats,
        score_confianca: calcularScoreCliente(stats),
        reconhecido: true
    };
}

async function criar({ nome, telefone, email, preferencias = {}, observacoes }) {
    const result = await pool.query(
        `INSERT INTO clientes (nome, telefone, email, preferencias, observacoes)
         VALUES ($1, $2, $3, $4, $5) RETURNING ${colunas}`,
        [nome, telefone, email, preferencias, observacoes]
    );
    return result.rows[0];
}

async function atualizar(id, campos) {
    const entries = Object.entries(campos);
    const sets = entries.map(([chave], index) => `${chave} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await pool.query(
        `UPDATE clientes SET ${sets.join(', ')}, atualizado_em = NOW()
         WHERE id = $${values.length} RETURNING ${colunas}`,
        values
    );
    return result.rows[0] || null;
}

async function desativar(id) {
    const result = await pool.query(
        `UPDATE clientes SET ativo = FALSE, atualizado_em = NOW()
         WHERE id = $1 AND ativo = TRUE RETURNING ${colunas}`,
        [id]
    );
    return result.rows[0] || null;
}

async function retornosInteligentes({ limite = 30, toleranciaDias = 3 } = {}) {
    const result = await pool.query(
        `WITH atendimentos AS (
            SELECT
                a.cliente_id,
                a.inicio::date AS data_atendimento,
                s.nome AS servico_nome,
                p.nome AS profissional_nome,
                p.apelido AS profissional_apelido,
                LAG(a.inicio::date) OVER (PARTITION BY a.cliente_id ORDER BY a.inicio) AS atendimento_anterior
            FROM agendamentos a
            JOIN servicos s ON s.id = a.servico_id
            LEFT JOIN profissionais p ON p.id = a.profissional_id
            WHERE a.status IN ('confirmado', 'concluido')
              AND a.status <> 'faltou'
        ),
        perfil AS (
            SELECT
                cliente_id,
                MAX(data_atendimento) AS ultimo_atendimento,
                (ARRAY_AGG(servico_nome ORDER BY data_atendimento DESC))[1] AS ultimo_servico,
                (ARRAY_AGG(COALESCE(profissional_apelido, profissional_nome) ORDER BY data_atendimento DESC))[1] AS ultimo_profissional,
                COUNT(*)::int AS atendimentos,
                ROUND(AVG(data_atendimento - atendimento_anterior))::int AS ciclo_medio_dias
            FROM atendimentos
            GROUP BY cliente_id
        )
        SELECT
            c.id AS cliente_id,
            c.nome AS cliente_nome,
            c.telefone AS cliente_telefone,
            p.ultimo_atendimento::text,
            p.ultimo_servico,
            p.ultimo_profissional,
            p.atendimentos,
            GREATEST(COALESCE(p.ciclo_medio_dias, 30), 15)::int AS ciclo_estimado_dias,
            (CURRENT_DATE - p.ultimo_atendimento)::int AS dias_sem_cortar,
            (p.ultimo_atendimento + (GREATEST(COALESCE(p.ciclo_medio_dias, 30), 15)::int || ' days')::interval)::date::text AS data_sugerida
         FROM perfil p
         JOIN clientes c ON c.id = p.cliente_id AND c.ativo = TRUE
         WHERE (CURRENT_DATE - p.ultimo_atendimento) >= GREATEST(COALESCE(p.ciclo_medio_dias, 30), 15)::int - $2
           AND NOT EXISTS (
               SELECT 1 FROM agendamentos futuro
               WHERE futuro.cliente_id = c.id
                 AND futuro.status NOT IN ('cancelado', 'faltou')
                 AND futuro.inicio::date > p.ultimo_atendimento
           )
         ORDER BY dias_sem_cortar DESC, c.nome
         LIMIT $1`,
        [limite, toleranciaDias]
    );
    return result.rows;
}

module.exports = {
    listar,
    buscarPorId,
    buscarCompletoPorId,
    buscarPorTelefone,
    buscarReconhecidoPorTelefone,
    estatisticas,
    historico,
    criar,
    atualizar,
    desativar,
    retornosInteligentes
};
