const test = require('node:test');
const assert = require('node:assert/strict');
const commissionRules = require('../src/utils/commissionRules');

test('dono fica com todo valor recebido do proprio atendimento', () => {
    assert.deepEqual(commissionRules.calcularRepasse({
        valorPago: 80,
        percentualComissao: 50,
        dono: true
    }), {
        valor_recebido: 80,
        percentual_comissao: 0,
        comissao_barbeiro: 0,
        repasse_dono: 80
    });
});

test('barbeiro recebe percentual e restante fica para o dono', () => {
    assert.deepEqual(commissionRules.calcularRepasse({
        valorPago: 100,
        percentualComissao: 50,
        dono: false
    }), {
        valor_recebido: 100,
        percentual_comissao: 50,
        comissao_barbeiro: 50,
        repasse_dono: 50
    });
});

test('percentual de comissao fica limitado entre zero e cem', () => {
    assert.equal(commissionRules.calcularRepasse({ valorPago: 100, percentualComissao: 150 }).comissao_barbeiro, 100);
    assert.equal(commissionRules.calcularRepasse({ valorPago: 100, percentualComissao: -10 }).comissao_barbeiro, 0);
});
