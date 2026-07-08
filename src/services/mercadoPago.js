const { HttpError } = require('../utils/httpError');
const negocioConfiguracoes = require('../models/negocioConfiguracoes');

const API_BASE = 'https://api.mercadopago.com';

function accessToken() {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        throw new HttpError(503, 'MERCADO_PAGO_ACCESS_TOKEN nao configurado.');
    }
    return process.env.MERCADO_PAGO_ACCESS_TOKEN;
}

function estaConfigurado() {
    return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

function publicBaseUrl() {
    const baseUrl = process.env.PUBLIC_BASE_URL;
    if (!baseUrl) throw new HttpError(503, 'PUBLIC_BASE_URL precisa estar configurada para pagamentos online.');
    return baseUrl.replace(/\/+$/, '');
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken()}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new HttpError(response.status, data.message || data.error || 'Erro ao comunicar com Mercado Pago.', data);
    }
    return data;
}

function statusPagamento(status) {
    return ({
        approved: 'pago',
        authorized: 'pendente',
        in_process: 'pendente',
        pending: 'pendente',
        rejected: 'cancelado',
        cancelled: 'cancelado',
        refunded: 'reembolsado',
        charged_back: 'reembolsado'
    })[status] || 'pendente';
}

function externalReference(agendamento, pagamento) {
    return `agendamento:${agendamento.id}:pagamento:${pagamento.id}`;
}

async function criarPreferencia({ agendamento, pagamento, cliente, metodo }) {
    const negocio = await negocioConfiguracoes.buscar();
    const baseUrl = publicBaseUrl();
    const preference = await request('/checkout/preferences', {
        method: 'POST',
        body: JSON.stringify({
            items: [{
                id: String(agendamento.servico_id || agendamento.id),
                title: `${negocio.nome} - ${agendamento.servico_nome}`,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: Number(pagamento.valor)
            }],
            payer: {
                name: cliente && cliente.nome ? cliente.nome : agendamento.cliente_nome,
                email: cliente && cliente.email ? cliente.email : undefined
            },
            payment_methods: metodo === 'pix_online'
                ? { excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }] }
                : { excluded_payment_types: [{ id: 'ticket' }] },
            back_urls: {
                success: `${baseUrl}/agendamento/confirmar`,
                failure: `${baseUrl}/agendamento/reagendar`,
                pending: `${baseUrl}/agendamento/confirmar`
            },
            notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
            external_reference: externalReference(agendamento, pagamento),
            statement_descriptor: negocio.nome_curto || negocio.nome,
            metadata: {
                agendamento_id: agendamento.id,
                pagamento_id: pagamento.id,
                metodo
            }
        })
    });
    return preference;
}

async function buscarPagamento(paymentId) {
    return request(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

function payloadSeguro(preferenceOrPayment) {
    return {
        id: preferenceOrPayment && preferenceOrPayment.id,
        status: preferenceOrPayment && preferenceOrPayment.status,
        external_reference: preferenceOrPayment && preferenceOrPayment.external_reference,
        init_point: preferenceOrPayment && preferenceOrPayment.init_point,
        sandbox_init_point: preferenceOrPayment && preferenceOrPayment.sandbox_init_point,
        payment_method_id: preferenceOrPayment && preferenceOrPayment.payment_method_id,
        payment_type_id: preferenceOrPayment && preferenceOrPayment.payment_type_id,
        transaction_amount: preferenceOrPayment && preferenceOrPayment.transaction_amount
    };
}

module.exports = {
    estaConfigurado,
    criarPreferencia,
    buscarPagamento,
    statusPagamento,
    payloadSeguro
};
