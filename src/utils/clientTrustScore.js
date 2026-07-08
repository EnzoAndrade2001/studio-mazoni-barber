function numero(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function calcularScoreCliente(stats = {}) {
    const agendamentos = numero(stats.total_agendamentos);
    const concluidos = numero(stats.atendimentos_concluidos);
    const faltas = numero(stats.no_shows);
    const cancelamentos = numero(stats.cancelamentos);
    const cancelamentosEmCima = numero(stats.cancelamentos_em_cima);
    const totalPago = numero(stats.total_pago);
    const diasDesdeUltimo = stats.dias_desde_ultimo_agendamento === null || stats.dias_desde_ultimo_agendamento === undefined
        ? null
        : numero(stats.dias_desde_ultimo_agendamento);
    const frequenciaMedia = stats.frequencia_media_dias === null || stats.frequencia_media_dias === undefined
        ? null
        : numero(stats.frequencia_media_dias);

    let pontos = 50;
    pontos += Math.min(concluidos * 6, 30);
    pontos += Math.min(totalPago / 20, 20);
    if (frequenciaMedia && frequenciaMedia <= 35 && concluidos >= 3) pontos += 10;
    if (diasDesdeUltimo !== null && diasDesdeUltimo <= 35 && concluidos >= 2) pontos += 5;
    pontos -= faltas * 25;
    pontos -= cancelamentosEmCima * 12;
    pontos -= Math.max(cancelamentos - cancelamentosEmCima, 0) * 5;
    pontos = Math.max(0, Math.min(100, Math.round(pontos)));

    let classificacao = 'novo';
    let acao = 'Confirmar normalmente.';
    let bloqueadoOnline = false;

    if (faltas >= 2 || (faltas >= 1 && pontos <= 15)) {
        classificacao = 'bloqueado_online';
        bloqueadoOnline = true;
        acao = 'Bloquear agendamento online e chamar no WhatsApp.';
    } else if (faltas >= 1 || cancelamentosEmCima >= 2 || pontos < 45) {
        classificacao = 'risco_de_falta';
        acao = 'Pedir confirmacao manual ou pagamento antecipado.';
    } else if (concluidos >= 8 && totalPago >= 400 && pontos >= 80) {
        classificacao = 'vip';
        acao = 'Prioridade para encaixe e retorno.';
    } else if (concluidos >= 3 && pontos >= 60) {
        classificacao = 'recorrente';
        acao = 'Cliente confiavel para encaixe.';
    }

    return {
        pontos,
        classificacao,
        bloqueado_online: bloqueadoOnline,
        acao_recomendada: acao,
        sinais: {
            agendamentos,
            concluidos,
            faltas,
            cancelamentos,
            cancelamentos_em_cima: cancelamentosEmCima,
            total_pago: totalPago,
            frequencia_media_dias: frequenciaMedia,
            dias_desde_ultimo_agendamento: diasDesdeUltimo
        }
    };
}

module.exports = { calcularScoreCliente };
