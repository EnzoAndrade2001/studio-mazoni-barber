const { pool } = require('../config/database');
const { HttpError } = require('../utils/httpError');
const regrasPagamento = require('../utils/paymentRules');
const scheduleRules = require('../utils/scheduleRules');
const horariosFuncionamento = require('./horariosFuncionamento');
const profissionais = require('./profissionais');

const selectCompleto = `
    SELECT a.id, a.cliente_id, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
           a.servico_id, s.nome AS servico_nome,
           a.profissional_id, p.nome AS profissional_nome, p.apelido AS profissional_apelido,
           a.inicio, a.fim,
           a.preco::float AS preco, a.status, a.pagamento_status, a.forma_pagamento,
           a.valor_pago::float AS valor_pago, a.tipo_cobranca, a.percentual_sinal,
           a.valor_sinal::float AS valor_sinal, a.saldo_restante::float AS saldo_restante,
           a.metodo_pagamento_preferido, a.confirmado_em, a.pago_em,
           a.origem_publica, a.aprovacao_pendente,
           a.encaixe, a.motivo_encaixe,
           a.lembrete_retorno_em::text AS lembrete_retorno_em,
           a.lembrete_retorno_observacoes,
           a.lembrete_retorno_concluido,
           a.observacoes, a.criado_em, a.atualizado_em
    FROM agendamentos a
    JOIN clientes c ON c.id = a.cliente_id
    JOIN servicos s ON s.id = a.servico_id
    LEFT JOIN profissionais p ON p.id = a.profissional_id`;

async function listar({ inicio, fim, status, clienteId, profissionalId, aprovacaoPendente }) {
    const values = [];
    const filtros = [];
    for (const [coluna, operador, value] of [
        ['a.inicio', '>=', inicio],
        ['a.inicio', '<', fim],
        ['a.status', '=', status],
        ['a.cliente_id', '=', clienteId],
        ['a.profissional_id', '=', profissionalId],
        ['a.aprovacao_pendente', '=', aprovacaoPendente]
    ]) {
        if (value !== undefined && value !== null) {
            values.push(value);
            filtros.push(`${coluna} ${operador} $${values.length}`);
        }
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const result = await pool.query(`${selectCompleto} ${where} ORDER BY a.inicio`, values);
    return result.rows;
}

async function buscarPorId(id, db = pool) {
    const result = await db.query(`${selectCompleto} WHERE a.id = $1`, [id]);
    return result.rows[0] || null;
}

async function obterServicoEValidarCliente(db, clienteId, servicoId) {
    const result = await db.query(
        `SELECT
            EXISTS(SELECT 1 FROM clientes WHERE id = $1 AND ativo) AS cliente_existe,
            (SELECT json_build_object('duracao', duracao_minutos, 'preco', preco::float)
             FROM servicos WHERE id = $2 AND ativo) AS servico`,
        [clienteId, servicoId]
    );
    if (!result.rows[0].cliente_existe) throw new HttpError(404, 'Cliente ativo nao encontrado.');
    if (!result.rows[0].servico) throw new HttpError(404, 'Servico ativo nao encontrado.');
    return result.rows[0].servico;
}

async function obterProfissional(db, profissionalId) {
    if (profissionalId) {
        const profissional = await profissionais.buscarPorId(profissionalId, db);
        if (!profissional || !profissional.ativo) throw new HttpError(404, 'Barbeiro ativo nao encontrado.');
        return profissional;
    }
    const profissional = await profissionais.primeiroAtivo(db);
    if (!profissional) throw new HttpError(404, 'Nenhum barbeiro ativo cadastrado.');
    return profissional;
}

async function validarConflito(db, inicio, fim, profissionalId, ignorarId = null, permitirConflito = false) {
    await db.query('SELECT pg_advisory_xact_lock($1)', [Number(profissionalId || 0)]);
    const result = await db.query(
        `SELECT
            (
                SELECT json_build_object(
                    'id', id,
                    'cliente_nome', cliente_nome,
                    'servico_nome', servico_nome,
                    'inicio', inicio,
                    'fim', fim
                )
                FROM (
                    SELECT a.id, c.nome AS cliente_nome, s.nome AS servico_nome, a.inicio, a.fim
                    FROM agendamentos a
                    JOIN clientes c ON c.id = a.cliente_id
                    JOIN servicos s ON s.id = a.servico_id
                    WHERE a.status NOT IN ('cancelado', 'faltou')
                      AND a.profissional_id = $3
                      AND ($4::bigint IS NULL OR a.id <> $4)
                      AND a.inicio < $2 AND a.fim > $1
                    ORDER BY a.inicio
                    LIMIT 1
                ) conflito
            ) AS agendamento,
            (
                SELECT json_build_object('id', id, 'inicio', inicio, 'fim', fim, 'motivo', motivo)
                FROM bloqueios
                WHERE inicio < $2 AND fim > $1
                LIMIT 1
            ) AS bloqueio`,
        [inicio, fim, profissionalId, ignorarId]
    );
    if (result.rows[0].bloqueio) {
        throw new HttpError(409, 'Esse horario esta bloqueado.', { bloqueio: result.rows[0].bloqueio });
    }
    if (result.rows[0].agendamento && !permitirConflito) {
        throw new HttpError(409, 'Esse horario conflita com outro agendamento.', {
            conflito: result.rows[0].agendamento,
            pode_confirmar_encaixe: true
        });
    }
    return result.rows[0].agendamento || null;
}

async function validarJornada(db, inicio, fim) {
    const data = scheduleRules.localDate(inicio);
    if (!data) throw new HttpError(400, 'Horario de inicio invalido.');
    if (scheduleRules.localDate(fim) !== data) {
        throw new HttpError(400, 'O atendimento precisa iniciar e terminar no mesmo dia.');
    }
    const diaSemana = scheduleRules.isoWeekdayFromDate(data);
    const jornada = await horariosFuncionamento.buscarPorDia(diaSemana, db);
    if (!jornada || !jornada.aberto) {
        throw new HttpError(409, 'A barbearia esta fechada nesse dia.');
    }
    if (!scheduleRules.isWithinBusinessHours({ date: data, start: inicio, end: fim, schedule: jornada })) {
        throw new HttpError(409, 'Esse horario fica fora da jornada de atendimento.');
    }
}

async function criar({
    cliente_id, servico_id, profissional_id, inicio, observacoes, permitir_conflito, motivo_encaixe,
    lembrete_retorno_em, lembrete_retorno_observacoes,
    origem_publica = false, aprovacao_pendente = false,
    tipo_cobranca = 'pagar_na_hora', metodo_pagamento_preferido = 'pix_manual'
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const servico = await obterServicoEValidarCliente(client, cliente_id, servico_id);
        const profissional = await obterProfissional(client, profissional_id);
        const fim = new Date(inicio.getTime() + servico.duracao * 60000);
        await validarJornada(client, inicio, fim);
        const conflito = await validarConflito(client, inicio, fim, profissional.id, null, permitir_conflito);
        const combinacao = regrasPagamento.validarCombinacao(tipo_cobranca, metodo_pagamento_preferido);
        const cobranca = regrasPagamento.calcularCobranca(servico.preco, tipo_cobranca);
        const result = await client.query(
            `INSERT INTO agendamentos
             (cliente_id, servico_id, profissional_id, inicio, fim, preco, observacoes, encaixe, motivo_encaixe,
              lembrete_retorno_em, lembrete_retorno_observacoes,
              tipo_cobranca, percentual_sinal, valor_sinal, saldo_restante, metodo_pagamento_preferido,
              origem_publica, aprovacao_pendente)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
            [
                cliente_id, servico_id, profissional.id, inicio, fim, servico.preco, observacoes, Boolean(conflito), motivo_encaixe,
                lembrete_retorno_em || null, lembrete_retorno_observacoes,
                cobranca.tipo_cobranca, cobranca.percentual_sinal, cobranca.valor_sinal, cobranca.saldo_restante,
                combinacao.metodo_pagamento_preferido, origem_publica, aprovacao_pendente
            ]
        );
        await client.query('COMMIT');
        return buscarPorId(result.rows[0].id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function atualizar(id, campos) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const atual = await buscarPorId(id, client);
        if (!atual) throw new HttpError(404, 'Agendamento nao encontrado.');
        const clienteId = campos.cliente_id ?? atual.cliente_id;
        const servicoId = campos.servico_id ?? atual.servico_id;
        const profissionalId = campos.profissional_id ?? atual.profissional_id;
        const inicio = campos.inicio ?? new Date(atual.inicio);
        const status = campos.status ?? atual.status;
        const pagamentoStatus = campos.pagamento_status ?? atual.pagamento_status;
        const valorPago = campos.valor_pago ?? atual.valor_pago;
        if (status === 'concluido' && !['parcial', 'pago'].includes(pagamentoStatus) && Number(valorPago || 0) <= 0) {
            throw new HttpError(409, 'Registre o pagamento antes de concluir o atendimento.');
        }
        const servico = await obterServicoEValidarCliente(client, clienteId, servicoId);
        const profissional = await obterProfissional(client, profissionalId);
        const fim = new Date(inicio.getTime() + servico.duracao * 60000);
        const tipoCobranca = campos.tipo_cobranca ?? atual.tipo_cobranca;
        const metodoPreferido = campos.metodo_pagamento_preferido !== undefined
            ? regrasPagamento.validarMetodoPreferido(campos.metodo_pagamento_preferido)
            : atual.metodo_pagamento_preferido;
        const combinacao = regrasPagamento.validarCombinacao(tipoCobranca, metodoPreferido);
        const cobranca = regrasPagamento.calcularCobranca(servico.preco, tipoCobranca);
        const saldoRestante = Math.max(Number(servico.preco) - Number(valorPago || 0), 0);
        let conflito = null;
        if (!['cancelado', 'faltou'].includes(status)) {
            await validarJornada(client, inicio, fim);
            conflito = await validarConflito(client, inicio, fim, profissional.id, id, campos.permitir_conflito);
        }
        await client.query(
            `UPDATE agendamentos SET cliente_id=$1, servico_id=$2, profissional_id=$3, inicio=$4, fim=$5,
             preco=$6, status=$7, observacoes=$8, pagamento_status=$9, forma_pagamento=$10,
             valor_pago=$11, confirmado_em=$12, pago_em=$13, encaixe=$14, motivo_encaixe=$15,
             tipo_cobranca=$16, percentual_sinal=$17, valor_sinal=$18, saldo_restante=$19,
             metodo_pagamento_preferido=$20, lembrete_retorno_em=$21::date,
             lembrete_retorno_observacoes=$22, lembrete_retorno_concluido=$23,
             origem_publica=$24, aprovacao_pendente=$25, atualizado_em=NOW() WHERE id=$26`,
            [
                clienteId, servicoId, profissional.id, inicio, fim, servico.preco, status,
                campos.observacoes !== undefined ? campos.observacoes : atual.observacoes,
                pagamentoStatus,
                campos.forma_pagamento !== undefined ? campos.forma_pagamento : atual.forma_pagamento,
                valorPago,
                campos.confirmado_em !== undefined
                    ? campos.confirmado_em
                    : (status === 'confirmado' && !atual.confirmado_em ? new Date() : atual.confirmado_em),
                campos.pago_em !== undefined
                    ? campos.pago_em
                    : (pagamentoStatus === 'pago' && !atual.pago_em ? new Date() : atual.pago_em),
                campos.encaixe !== undefined ? campos.encaixe : (Boolean(conflito) || atual.encaixe),
                campos.motivo_encaixe !== undefined ? campos.motivo_encaixe : atual.motivo_encaixe,
                cobranca.tipo_cobranca,
                cobranca.percentual_sinal,
                cobranca.valor_sinal,
                regrasPagamento.arredondar(saldoRestante),
                combinacao.metodo_pagamento_preferido,
                campos.lembrete_retorno_em !== undefined ? campos.lembrete_retorno_em : atual.lembrete_retorno_em,
                campos.lembrete_retorno_observacoes !== undefined
                    ? campos.lembrete_retorno_observacoes
                    : atual.lembrete_retorno_observacoes,
                campos.lembrete_retorno_concluido !== undefined
                    ? campos.lembrete_retorno_concluido
                    : atual.lembrete_retorno_concluido,
                campos.origem_publica !== undefined ? campos.origem_publica : atual.origem_publica,
                campos.aprovacao_pendente !== undefined
                    ? campos.aprovacao_pendente
                    : (status === 'confirmado' || status === 'cancelado' || status === 'concluido'
                        ? false
                        : atual.aprovacao_pendente),
                id
            ]
        );
        await client.query('COMMIT');
        return buscarPorId(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function remover(id) {
    const result = await pool.query('DELETE FROM agendamentos WHERE id = $1 RETURNING id', [id]);
    return Boolean(result.rowCount);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
