const test = require('node:test');
const assert = require('node:assert/strict');
const publicActionLinks = require('../src/utils/publicActionLinks');

test('gera e valida token de acao publica', () => {
    process.env.PUBLIC_ACTION_SECRET = 'segredo-de-teste';
    const token = publicActionLinks.createToken({
        agendamentoId: 42,
        action: 'confirmar',
        ttlSeconds: 60,
        now: 1000
    });
    const payload = publicActionLinks.verifyToken(token, { now: 2000 });
    assert.equal(payload.agendamento_id, 42);
    assert.equal(payload.action, 'confirmar');
});

test('rejeita token alterado', () => {
    process.env.PUBLIC_ACTION_SECRET = 'segredo-de-teste';
    const token = publicActionLinks.createToken({
        agendamentoId: 42,
        action: 'cancelar',
        ttlSeconds: 60,
        now: 1000
    });
    assert.throws(() => publicActionLinks.verifyToken(`${token}x`, { now: 2000 }), /Token invalido/);
});

test('rejeita token expirado', () => {
    process.env.PUBLIC_ACTION_SECRET = 'segredo-de-teste';
    const token = publicActionLinks.createToken({
        agendamentoId: 42,
        action: 'reagendar',
        ttlSeconds: 1,
        now: 1000
    });
    assert.throws(() => publicActionLinks.verifyToken(token, { now: 4000 }), /Token expirado/);
});
