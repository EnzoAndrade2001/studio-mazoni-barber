const test = require('node:test');
const assert = require('node:assert/strict');
const scheduleRules = require('../src/utils/scheduleRules');

const jornadaSabado = {
    aberto: true,
    abertura: '09:00:00',
    fechamento: '20:00:00'
};

test('calcula dia da semana ISO para datas locais', () => {
    assert.equal(scheduleRules.isoWeekdayFromDate('2026-07-06'), 1);
    assert.equal(scheduleRules.isoWeekdayFromDate('2026-07-12'), 7);
});

test('valida atendimento dentro da jornada em Sao Paulo', () => {
    assert.equal(scheduleRules.isWithinBusinessHours({
        date: '2026-07-11',
        start: new Date('2026-07-11T12:00:00.000Z'),
        end: new Date('2026-07-11T12:30:00.000Z'),
        schedule: jornadaSabado
    }), true);
});

test('rejeita atendimento que passa do fechamento', () => {
    assert.equal(scheduleRules.isWithinBusinessHours({
        date: '2026-07-11',
        start: new Date('2026-07-11T22:45:00.000Z'),
        end: new Date('2026-07-11T23:15:00.000Z'),
        schedule: jornadaSabado
    }), false);
});

test('rejeita dia fechado', () => {
    assert.equal(scheduleRules.isWithinBusinessHours({
        date: '2026-07-12',
        start: new Date('2026-07-12T12:00:00.000Z'),
        end: new Date('2026-07-12T12:30:00.000Z'),
        schedule: { aberto: false, abertura: '09:00:00', fechamento: '20:00:00' }
    }), false);
});
