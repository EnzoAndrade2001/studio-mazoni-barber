const test = require('node:test');
const assert = require('node:assert/strict');

const mercadoPago = require('../src/services/mercadoPago');

test('mapeia status aprovado do Mercado Pago como pago', () => {
    assert.equal(mercadoPago.statusPagamento('approved'), 'pago');
});

test('mapeia status pendente do Mercado Pago como pendente', () => {
    assert.equal(mercadoPago.statusPagamento('pending'), 'pendente');
    assert.equal(mercadoPago.statusPagamento('in_process'), 'pendente');
});

test('mapeia estorno/cancelamento do Mercado Pago', () => {
    assert.equal(mercadoPago.statusPagamento('refunded'), 'reembolsado');
    assert.equal(mercadoPago.statusPagamento('cancelled'), 'cancelado');
});
