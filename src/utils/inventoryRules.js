const tiposMovimentacao = ['entrada', 'saida', 'venda', 'ajuste'];

function normalizarTipoMovimentacao(tipo) {
    if (!tiposMovimentacao.includes(tipo)) {
        throw new Error(`Tipo de movimentacao invalido. Use: ${tiposMovimentacao.join(', ')}.`);
    }
    return tipo;
}

function calcularNovoEstoque(estoqueAtual, { tipo, quantidade }) {
    const atual = Number(estoqueAtual || 0);
    const qtd = Number(quantidade || 0);
    normalizarTipoMovimentacao(tipo);
    if (!Number.isInteger(qtd) || qtd <= 0) throw new Error('Quantidade deve ser um inteiro positivo.');
    if (tipo === 'entrada') return atual + qtd;
    if (tipo === 'ajuste') return qtd;
    const novoEstoque = atual - qtd;
    if (novoEstoque < 0) throw new Error('Estoque insuficiente para essa movimentacao.');
    return novoEstoque;
}

function estoqueBaixo(produto) {
    if (!produto || produto.controla_estoque === false) return false;
    return Number(produto.estoque_atual || 0) <= Number(produto.estoque_minimo || 0);
}

module.exports = { tiposMovimentacao, normalizarTipoMovimentacao, calcularNovoEstoque, estoqueBaixo };
