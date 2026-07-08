const { HttpError } = require('./httpError');

const tiposCobranca = ['total', 'pagar_na_hora'];
const tiposPagamento = ['total', 'manual'];
const metodosPreferidos = ['pix_online', 'cartao_online', 'pix_manual', 'dinheiro'];
const metodosManuais = ['pix_manual', 'dinheiro'];

function arredondar(valor) {
    return Math.round(Number(valor || 0) * 100) / 100;
}

function validarTipoCobranca(value = 'pagar_na_hora') {
    if (!tiposCobranca.includes(value)) {
        throw new HttpError(400, `Tipo de cobranca invalido. Use: ${tiposCobranca.join(', ')}.`);
    }
    return value;
}

function validarMetodoPreferido(value = 'pix_manual') {
    if (!metodosPreferidos.includes(value)) {
        throw new HttpError(400, `Metodo de pagamento invalido. Use: ${metodosPreferidos.join(', ')}.`);
    }
    return value;
}

function validarMetodoManual(value = 'dinheiro') {
    if (!metodosManuais.includes(value)) {
        throw new HttpError(400, `Pagamento manual aceita apenas: ${metodosManuais.join(', ')}.`);
    }
    return value;
}

function validarTipoPagamento(value = 'manual') {
    if (!tiposPagamento.includes(value)) {
        throw new HttpError(400, `Tipo de pagamento invalido. Use: ${tiposPagamento.join(', ')}.`);
    }
    return value;
}

function calcularCobranca(preco, tipoCobranca) {
    const total = arredondar(preco);
    const tipo = validarTipoCobranca(tipoCobranca);
    const percentual = tipo === 'total' ? 100 : 0;
    const valorSinal = arredondar(total * (percentual / 100));
    return {
        tipo_cobranca: tipo,
        percentual_sinal: percentual,
        valor_sinal: valorSinal,
        saldo_restante: arredondar(Math.max(total - valorSinal, 0))
    };
}

function validarCombinacao(tipoCobranca, metodoPreferido) {
    const tipo = validarTipoCobranca(tipoCobranca);
    const metodo = validarMetodoPreferido(metodoPreferido);
    if (tipo === 'pagar_na_hora' && ['pix_online', 'cartao_online'].includes(metodo)) {
        throw new HttpError(400, 'Para pagar na hora, use pix_manual ou dinheiro.');
    }
    if (tipo === 'total' && metodo === 'dinheiro') {
        throw new HttpError(400, 'Dinheiro deve ser usado apenas para pagamento na hora.');
    }
    if (tipo === 'total' && metodo === 'pix_manual') {
        throw new HttpError(400, 'Pagamento total antecipado deve usar pix_online ou cartao_online.');
    }
    return { tipo_cobranca: tipo, metodo_pagamento_preferido: metodo };
}

module.exports = {
    tiposCobranca,
    tiposPagamento,
    metodosPreferidos,
    metodosManuais,
    validarTipoCobranca,
    validarTipoPagamento,
    validarMetodoPreferido,
    validarMetodoManual,
    validarCombinacao,
    calcularCobranca,
    arredondar
};
