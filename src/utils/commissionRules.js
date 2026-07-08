function arredondar(valor) {
    return Math.round(Number(valor || 0) * 100) / 100;
}

function calcularRepasse({ valorPago, percentualComissao, dono }) {
    const recebido = arredondar(valorPago);
    const percentual = dono ? 0 : Math.max(0, Math.min(Number(percentualComissao || 0), 100));
    const comissaoBarbeiro = arredondar(recebido * (percentual / 100));
    return {
        valor_recebido: recebido,
        percentual_comissao: percentual,
        comissao_barbeiro: comissaoBarbeiro,
        repasse_dono: arredondar(recebido - comissaoBarbeiro)
    };
}

module.exports = { calcularRepasse, arredondar };
