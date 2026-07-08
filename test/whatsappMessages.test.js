const test = require('node:test');
const assert = require('node:assert/strict');
const whatsappMessages = require('../src/utils/whatsappMessages');

const agendamento = {
    cliente_nome: 'Rafael',
    cliente_telefone: '(51) 99999-8888',
    servico_nome: 'Corte degrade',
    profissional_apelido: 'Leo',
    inicio: '2026-07-03T22:30:00.000Z'
};

test('monta mensagem de confirmacao com servico barbeiro e horario', () => {
    const texto = whatsappMessages.mensagemAgendamento(agendamento, 'confirmacao', {
        nome: 'Studio Mazoni Barber'
    }, {
        confirmar: 'https://site.test/agendamento/confirmar?token=abc',
        cancelar: 'https://site.test/agendamento/cancelar?token=def'
    });
    assert.match(texto, /Rafael/);
    assert.match(texto, /Studio Mazoni Barber/);
    assert.match(texto, /Corte degrade/);
    assert.match(texto, /Leo/);
    assert.match(texto, /19:30/);
    assert.match(texto, /Confirmar: https:\/\/site.test/);
    assert.match(texto, /Cancelar: https:\/\/site.test/);
});

test('monta mensagem de reagendamento diferente da confirmacao', () => {
    const texto = whatsappMessages.mensagemAgendamento(agendamento, 'reagendamento', {
        nome: 'Studio Mazoni Barber'
    });
    assert.match(texto, /atualizado/);
});

test('gera link wa.me com codigo do Brasil', () => {
    const url = whatsappMessages.whatsappUrl(agendamento.cliente_telefone, 'Teste');
    assert.equal(url, 'https://wa.me/5551999998888?text=Teste');
});
