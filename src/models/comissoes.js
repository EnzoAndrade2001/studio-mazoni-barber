const { pool } = require('../config/database');
const commissionRules = require('../utils/commissionRules');

async function resumo({ inicio, fim, profissionalId } = {}) {
    const values = [];
    const filtros = [
        "a.status NOT IN ('cancelado', 'faltou')",
        "a.pagamento_status IN ('parcial', 'pago')",
        'a.valor_pago > 0'
    ];
    if (inicio) {
        values.push(inicio);
        filtros.push(`a.inicio >= $${values.length}`);
    }
    if (fim) {
        values.push(fim);
        filtros.push(`a.inicio < $${values.length}`);
    }
    if (profissionalId) {
        values.push(profissionalId);
        filtros.push(`a.profissional_id = $${values.length}`);
    }
    const result = await pool.query(
        `SELECT
            p.id AS profissional_id,
            p.nome AS profissional_nome,
            p.apelido AS profissional_apelido,
            p.dono,
            p.comissao_percentual::float AS comissao_percentual,
            COUNT(a.id)::int AS atendimentos,
            COALESCE(SUM(a.valor_pago), 0)::float AS valor_recebido
         FROM profissionais p
         LEFT JOIN agendamentos a ON a.profissional_id = p.id
            AND ${filtros.join(' AND ')}
         WHERE p.ativo = TRUE
         GROUP BY p.id, p.nome, p.apelido, p.dono, p.comissao_percentual
         ORDER BY p.dono DESC, p.ordem, p.nome`,
        values
    );
    const profissionais = result.rows.map((row) => {
        const calculo = commissionRules.calcularRepasse({
            valorPago: row.valor_recebido,
            percentualComissao: row.comissao_percentual,
            dono: row.dono
        });
        return { ...row, ...calculo };
    });
    const totais = profissionais.reduce((acc, item) => ({
        valor_recebido: commissionRules.arredondar(acc.valor_recebido + item.valor_recebido),
        comissao_barbeiros: commissionRules.arredondar(acc.comissao_barbeiros + item.comissao_barbeiro),
        repasse_dono: commissionRules.arredondar(acc.repasse_dono + item.repasse_dono),
        atendimentos: acc.atendimentos + item.atendimentos
    }), {
        valor_recebido: 0,
        comissao_barbeiros: 0,
        repasse_dono: 0,
        atendimentos: 0
    });
    return { profissionais, totais };
}

module.exports = { resumo };
