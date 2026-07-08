const test = require('node:test');
const assert = require('node:assert/strict');
const validacao = require('../src/utils/validation');

test('normaliza telefone brasileiro', () => {
    assert.equal(validacao.telefone('(11) 99999-8888'), '11999998888');
});

test('rejeita telefone curto', () => {
    assert.throws(() => validacao.telefone('1234'), /10 e 13 digitos/);
});

test('aceita e converte dinheiro', () => {
    assert.equal(validacao.dinheiro('42.509'), 42.51);
});

test('rejeita data invalida', () => {
    assert.throws(() => validacao.data('nao-e-data'), /data invalida/);
});

test('valida ids positivos', () => {
    assert.equal(validacao.id('12'), 12);
    assert.throws(() => validacao.id('0'), /inteiro positivo/);
});

test('valida texto com tamanho minimo', () => {
    assert.equal(validacao.texto(' Leo ', 'nome', { min: 2 }), 'Leo');
    assert.throws(() => validacao.texto('A', 'nome', { min: 2 }), /pelo menos 2/);
});

test('normaliza booleanos de formulario', () => {
    assert.equal(validacao.booleano(true, 'ativo'), true);
    assert.equal(validacao.booleano('false', 'ativo'), false);
    assert.throws(() => validacao.booleano('talvez', 'ativo'), /verdadeiro ou falso/);
});

test('valida CPF com digitos verificadores', () => {
    assert.equal(validacao.cpfCnpj('529.982.247-25'), '52998224725');
    assert.throws(() => validacao.cpfCnpj('111.111.111-11'), /CPF invalido/);
});

test('valida CNPJ com digitos verificadores', () => {
    assert.equal(validacao.cpfCnpj('11.222.333/0001-81'), '11222333000181');
    assert.throws(() => validacao.cpfCnpj('11.111.111/1111-11'), /CNPJ invalido/);
});
