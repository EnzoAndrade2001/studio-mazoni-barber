const test = require('node:test');
const assert = require('node:assert/strict');
const bookingRules = require('../src/utils/bookingRules');

test('valida antecedencia minima para alterar horario', () => {
    const agora = new Date('2026-07-03T12:00:00.000Z');
    assert.equal(bookingRules.podeAlterarComAntecedencia('2026-07-03T15:00:00.000Z', 2, agora), true);
    assert.equal(bookingRules.podeAlterarComAntecedencia('2026-07-03T13:00:00.000Z', 2, agora), false);
});

test('bloqueia cliente com no-show dentro da janela configurada', () => {
    const result = bookingRules.bloqueioNoShow({
        totalNoShows: 2,
        ultimoNoShowEm: '2026-07-01T12:00:00.000Z',
        limite: 2,
        bloqueioDias: 30,
        agora: new Date('2026-07-03T12:00:00.000Z')
    });
    assert.equal(result.bloqueado, true);
});

test('nao bloqueia cliente abaixo do limite de no-show', () => {
    const result = bookingRules.bloqueioNoShow({
        totalNoShows: 1,
        ultimoNoShowEm: '2026-07-01T12:00:00.000Z',
        limite: 2,
        bloqueioDias: 30
    });
    assert.equal(result.bloqueado, false);
});
