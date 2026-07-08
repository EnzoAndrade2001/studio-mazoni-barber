const test = require('node:test');
const assert = require('node:assert/strict');
const regrasPagamento = require('../src/utils/paymentRules');

test('aceita apenas pagar total ou pagar na hora', () => {
    assert.equal(regrasPagamento.validarTipoCobranca('total'), 'total');
    assert.equal(regrasPagamento.validarTipoCobranca('pagar_na_hora'), 'pagar_na_hora');
    assert.throws(() => regrasPagamento.validarTipoCobranca('sinal_30'), /Tipo de cobranca invalido/);
    assert.throws(() => regrasPagamento.validarTipoCobranca('sinal_50'), /Tipo de cobranca invalido/);
});

test('total antecipado exige pagamento online', () => {
    assert.deepEqual(regrasPagamento.validarCombinacao('total', 'pix_online'), {
        tipo_cobranca: 'total',
        metodo_pagamento_preferido: 'pix_online'
    });
    assert.throws(() => regrasPagamento.validarCombinacao('total', 'pix_manual'), /Pagamento total antecipado/);
    assert.throws(() => regrasPagamento.validarCombinacao('total', 'dinheiro'), /Dinheiro/);
});

test('pagar na hora aceita apenas metodos manuais', () => {
    assert.deepEqual(regrasPagamento.validarCombinacao('pagar_na_hora', 'dinheiro'), {
        tipo_cobranca: 'pagar_na_hora',
        metodo_pagamento_preferido: 'dinheiro'
    });
    assert.throws(() => regrasPagamento.validarCombinacao('pagar_na_hora', 'pix_online'), /Para pagar na hora/);
});
