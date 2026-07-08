const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularScoreCliente } = require('../src/utils/clientTrustScore');

test('classifica cliente forte como VIP', () => {
    const score = calcularScoreCliente({
        total_agendamentos: 12,
        atendimentos_concluidos: 10,
        no_shows: 0,
        cancelamentos: 0,
        cancelamentos_em_cima: 0,
        total_pago: 620,
        frequencia_media_dias: 18,
        dias_desde_ultimo_agendamento: 14
    });

    assert.equal(score.classificacao, 'vip');
    assert.equal(score.bloqueado_online, false);
    assert.ok(score.pontos >= 80);
});

test('classifica faltas moderadas como risco de falta', () => {
    const score = calcularScoreCliente({
        total_agendamentos: 4,
        atendimentos_concluidos: 2,
        no_shows: 1,
        cancelamentos: 2,
        cancelamentos_em_cima: 2,
        total_pago: 90
    });

    assert.equal(score.classificacao, 'risco_de_falta');
    assert.equal(score.bloqueado_online, false);
});

test('bloqueia online quando cliente tem muitas faltas', () => {
    const score = calcularScoreCliente({
        total_agendamentos: 5,
        atendimentos_concluidos: 2,
        no_shows: 2,
        cancelamentos: 1,
        total_pago: 70
    });

    assert.equal(score.classificacao, 'bloqueado_online');
    assert.equal(score.bloqueado_online, true);
});
