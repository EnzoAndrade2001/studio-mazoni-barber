const agendamentos = require('../models/agendamentos');
const clientes = require('../models/clientes');
const pagamentos = require('../models/pagamentos');
const mercadoPago = require('../services/mercadoPago');
const whatsapp = require('../services/whatsappCloud');
const negocioConfiguracoes = require('../models/negocioConfiguracoes');
const regrasAgendamento = require('../models/regrasAgendamento');
const { HttpError } = require('../utils/httpError');
const validacao = require('../utils/validation');
const regrasPagamento = require('../utils/paymentRules');
const bookingRules = require('../utils/bookingRules');

function tipoPagamentoParaCobranca(tipoCobranca) {
    return tipoCobranca === 'total' ? 'total' : 'manual';
}

function metodoOnline(metodo) {
    return ['pix_online', 'cartao_online'].includes(metodo);
}

function pagamentoOnlineConfigurado(metodo) {
    return metodoOnline(metodo) && mercadoPago.estaConfigurado();
}

function formatarDataHora(value) {
    return new Date(value).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function moeda(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function metodoLabel(value) {
    return ({
        pix_manual: 'Pix na hora',
        dinheiro: 'Dinheiro na hora',
        pix_online: 'Pix online',
        cartao_online: 'Cartao online'
    })[value] || value;
}

function numeroNotificacaoAdmin() {
    return process.env.WHATSAPP_ADMIN_NOTIFY_NUMBER || process.env.WHATSAPP_BUSINESS_NUMBER || null;
}

function numeroContatoCliente() {
    return process.env.WHATSAPP_BUSINESS_NUMBER || process.env.WHATSAPP_ADMIN_NOTIFY_NUMBER || null;
}

async function montarMensagemAdmin({ agendamento, cliente }) {
    const negocio = await negocioConfiguracoes.buscar();
    return [
        `Novo pedido de horario pelo site ${negocio.nome}.`,
        '',
        `Cliente: ${cliente.nome}`,
        `WhatsApp: ${cliente.telefone}`,
        `Servico: ${agendamento.servico_nome}`,
        `Barbeiro: ${agendamento.profissional_nome || 'A definir'}`,
        `Data: ${formatarDataHora(agendamento.inicio)}`,
        `Valor: ${moeda(agendamento.preco)}`,
        `Pagamento: ${metodoLabel(agendamento.metodo_pagamento_preferido)}`,
        '',
        'Esse pedido esta aguardando aprovacao no painel admin.'
    ].join('\n');
}

async function montarMensagemCliente({ agendamento, cliente }) {
    const negocio = await negocioConfiguracoes.buscar();
    return [
        `Oi! Acabei de reservar um horario pelo site ${negocio.nome}.`,
        '',
        `Meu nome: ${cliente.nome}`,
        `Servico: ${agendamento.servico_nome}`,
        `Barbeiro: ${agendamento.profissional_nome || 'A definir'}`,
        `Data: ${formatarDataHora(agendamento.inicio)}`,
        `Pagamento: ${metodoLabel(agendamento.metodo_pagamento_preferido)}`,
        '',
        agendamento.aprovacao_pendente
            ? 'Fico aguardando a confirmacao do horario.'
            : 'Quero confirmar se ficou tudo certo.'
    ].join('\n');
}

function whatsappUrlAdmin(texto) {
    const numero = numeroNotificacaoAdmin();
    if (!numero) return null;
    return `https://wa.me/${String(numero).replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
}

async function whatsappCliente({ agendamento, cliente }) {
    const numero = numeroContatoCliente();
    if (!numero) return { url: null };
    const texto = await montarMensagemCliente({ agendamento, cliente });
    return {
        url: `https://wa.me/${String(numero).replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`,
        mensagem: texto
    };
}

async function avisarAdminPedidoManual({ agendamento, cliente }) {
    const texto = await montarMensagemAdmin({ agendamento, cliente });
    const para = numeroNotificacaoAdmin();
    if (!para) return { enviado: false, url: null };
    try {
        await whatsapp.enviarTexto({ para: String(para).replace(/\D/g, ''), texto });
        return { enviado: true, url: whatsappUrlAdmin(texto) };
    } catch (error) {
        console.error('Erro ao avisar admin no WhatsApp:', error);
        return { enviado: false, url: whatsappUrlAdmin(texto) };
    }
}

async function obterOuCriarCliente({ nome, telefone, email }) {
    const existente = await clientes.buscarPorTelefone(telefone);
    if (!existente) return clientes.criar({ nome, telefone, email });
    const atualizacoes = {};
    if (existente.nome !== nome) atualizacoes.nome = nome;
    if (email && existente.email !== email) atualizacoes.email = email;
    if (!Object.keys(atualizacoes).length) return existente;
    return clientes.atualizar(existente.id, atualizacoes);
}

async function agendar(req, res) {
    await pagamentos.expirarReservasOnlinePendentes();
    const metodoSolicitado = req.body.metodo_pagamento_preferido || 'pix_online';
    const nome = validacao.texto(req.body.nome, 'nome', { max: 120 });
    const telefone = validacao.telefone(req.body.telefone);
    const email = validacao.email(req.body.email, { obrigatorio: metodoOnline(metodoSolicitado) });
    const inicio = validacao.data(req.body.inicio);
    if (inicio <= new Date()) throw new HttpError(400, 'O agendamento deve ser feito em uma data futura.');

    const metodoPreferido = regrasPagamento.validarMetodoPreferido(metodoSolicitado);
    const tipoCobranca = regrasPagamento.validarTipoCobranca(req.body.tipo_cobranca || (metodoOnline(metodoPreferido) ? 'total' : 'pagar_na_hora'));
    regrasPagamento.validarCombinacao(tipoCobranca, metodoPreferido);
    if (metodoOnline(metodoPreferido) && !pagamentoOnlineConfigurado(metodoPreferido)) {
        throw new HttpError(503, 'Pagamento online ainda nao configurado para esse metodo.');
    }

    const clienteAnterior = await clientes.buscarReconhecidoPorTelefone(telefone);
    const regras = await regrasAgendamento.buscar();
    if (clienteAnterior) {
        const bloqueio = bookingRules.bloqueioNoShow({
            totalNoShows: clienteAnterior.estatisticas.no_shows,
            ultimoNoShowEm: clienteAnterior.estatisticas.ultimo_no_show_em,
            limite: regras.no_show_limite,
            bloqueioDias: regras.no_show_bloqueio_dias
        });
        if (bloqueio.bloqueado) {
            throw new HttpError(409, 'Esse telefone possui bloqueio temporario por faltas anteriores. Fale com a barbearia pelo WhatsApp.', {
                bloqueado_ate: bloqueio.ate
            });
        }
        if (clienteAnterior.score_confianca && clienteAnterior.score_confianca.bloqueado_online) {
            throw new HttpError(409, 'Esse cliente precisa confirmar o horario pelo WhatsApp antes de agendar online.', {
                score_confianca: clienteAnterior.score_confianca
            });
        }
    }
    const cliente = await obterOuCriarCliente({ nome, telefone, email });
    const clienteReconhecido = Boolean(clienteAnterior);
    const clienteEstatisticas = clienteAnterior
        ? clienteAnterior.estatisticas
        : { total_agendamentos: 0, atendimentos_concluidos: 0, ultimo_agendamento_em: null, total_pago: 0 };
    const online = metodoOnline(metodoPreferido);
    const documentoPagamento = online ? validacao.cpfCnpj(req.body.cpf_cnpj) : null;
    const agendamento = await agendamentos.criar({
        cliente_id: cliente.id,
        servico_id: validacao.id(req.body.servico_id, 'servico_id'),
        profissional_id: validacao.id(req.body.profissional_id, 'profissional_id'),
        inicio,
        observacoes: validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 1000 }),
        permitir_conflito: false,
        origem_publica: true,
        aprovacao_pendente: !online,
        tipo_cobranca: tipoCobranca,
        metodo_pagamento_preferido: metodoPreferido
    });

    if (!online) {
        const avisoWhatsapp = await avisarAdminPedidoManual({ agendamento, cliente });
        return res.status(201).json({
            agendamento,
            pagamento: null,
            aviso_whatsapp: avisoWhatsapp,
            whatsapp_cliente: await whatsappCliente({ agendamento, cliente }),
            cliente_reconhecido: clienteReconhecido,
            cliente_estatisticas: clienteEstatisticas
        });
    }

    const tipo = tipoPagamentoParaCobranca(tipoCobranca);
    const valor = agendamento.preco;
    if (valor <= 0) throw new HttpError(400, 'Valor de cobranca deve ser maior que zero.');

    let atualizado;
    try {
        const pagamento = await pagamentos.criarPendente({
            agendamento_id: agendamento.id,
            valor,
            provedor: 'mercado_pago',
            metodo: metodoPreferido,
            tipo
        });
        const preferencia = await mercadoPago.criarPreferencia({
            agendamento,
            pagamento,
            cliente: { nome, email, cpf_cnpj: documentoPagamento },
            metodo: metodoPreferido
        });
        atualizado = await pagamentos.atualizar(pagamento.id, {
            status: 'pendente',
            mercado_pago_preference_id: String(preferencia.id),
            checkout_url: preferencia.init_point,
            sandbox_checkout_url: preferencia.sandbox_init_point,
            payload: mercadoPago.payloadSeguro(preferencia)
        });
    } catch (error) {
        await agendamentos.remover(agendamento.id);
        throw error;
    }

    res.status(201).json({
        agendamento,
        pagamento: atualizado,
        whatsapp_cliente: await whatsappCliente({ agendamento, cliente }),
        cliente_reconhecido: clienteReconhecido,
        cliente_estatisticas: clienteEstatisticas
    });
}

async function reconhecerCliente(req, res) {
    const telefone = validacao.telefone(req.query.telefone);
    const cliente = await clientes.buscarReconhecidoPorTelefone(telefone);
    if (!cliente) return res.json({ reconhecido: false });
    res.json({
        reconhecido: true,
        cliente: {
            nome: cliente.nome,
            telefone: cliente.telefone,
            email: cliente.email,
            estatisticas: cliente.estatisticas
        }
    });
}

module.exports = { agendar, reconhecerCliente };
