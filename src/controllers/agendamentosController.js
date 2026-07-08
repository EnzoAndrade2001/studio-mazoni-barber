const agendamentos = require('../models/agendamentos');
const { HttpError } = require('../utils/httpError');
const validacao = require('../utils/validation');
const regrasPagamento = require('../utils/paymentRules');
const whatsapp = require('../services/whatsappCloud');
const negocioConfiguracoes = require('../models/negocioConfiguracoes');
const whatsappMessages = require('../utils/whatsappMessages');
const publicActionLinks = require('../utils/publicActionLinks');

async function enviarWhatsappCliente(req, agendamento, tipo) {
    if (!agendamento.cliente_telefone) return { enviado: false, url: null };
    try {
        const negocio = await negocioConfiguracoes.buscar();
        const links = publicActionLinks.actionUrls(req, agendamento.id);
        const texto = whatsappMessages.mensagemAgendamento(agendamento, tipo, negocio, links);
        const numero = whatsappMessages.telefoneWaMe(agendamento.cliente_telefone);
        const url = whatsappMessages.whatsappUrl(agendamento.cliente_telefone, texto);
        if (whatsapp.estaConfigurado() && numero) {
            await whatsapp.enviarTexto({ para: numero, texto });
            return { enviado: true, url };
        }
        return { enviado: false, url };
    } catch (error) {
        console.error('[WhatsApp] Falha ao enviar mensagem automatica:', error.message || error);
        return { enviado: false, url: null };
    }
}

const statuses = ['agendado', 'confirmado', 'concluido', 'cancelado', 'faltou'];
const pagamentos = ['pendente', 'parcial', 'pago', 'reembolsado', 'cancelado'];

function validarStatus(value) {
    if (!statuses.includes(value)) throw new HttpError(400, `Status invalido. Use: ${statuses.join(', ')}.`);
    return value;
}

function validarPagamentoStatus(value) {
    if (!pagamentos.includes(value)) throw new HttpError(400, `Status de pagamento invalido. Use: ${pagamentos.join(', ')}.`);
    return value;
}

function dataOpcional(value, campo) {
    if (value === null || value === '') return null;
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new HttpError(400, `O campo ${campo} deve estar no formato AAAA-MM-DD.`);
    }
    const parsed = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new HttpError(400, `O campo ${campo} possui data invalida.`);
    }
    return value;
}

async function listar(req, res) {
    res.json(await agendamentos.listar({
        inicio: req.query.inicio ? validacao.data(req.query.inicio, 'inicio') : undefined,
        fim: req.query.fim ? validacao.data(req.query.fim, 'fim') : undefined,
        status: req.query.status ? validarStatus(req.query.status) : undefined,
        clienteId: req.query.cliente_id ? validacao.id(req.query.cliente_id, 'cliente_id') : undefined,
        profissionalId: req.query.profissional_id ? validacao.id(req.query.profissional_id, 'profissional_id') : undefined,
        aprovacaoPendente: req.query.aprovacao_pendente !== undefined
            ? validacao.booleano(req.query.aprovacao_pendente, 'aprovacao_pendente')
            : undefined
    }));
}

async function buscar(req, res) {
    const agendamento = await agendamentos.buscarPorId(validacao.id(req.params.id));
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    res.json(agendamento);
}

async function criar(req, res) {
    const inicio = validacao.data(req.body.inicio);
    if (inicio <= new Date()) throw new HttpError(400, 'O agendamento deve ser feito em uma data futura.');
    const agendamento = await agendamentos.criar({
        cliente_id: validacao.id(req.body.cliente_id, 'cliente_id'),
        servico_id: validacao.id(req.body.servico_id, 'servico_id'),
        profissional_id: req.body.profissional_id ? validacao.id(req.body.profissional_id, 'profissional_id') : undefined,
        inicio,
        observacoes: validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 1000 }),
        permitir_conflito: req.body.permitir_conflito === undefined ? false : validacao.booleano(req.body.permitir_conflito, 'permitir_conflito'),
        motivo_encaixe: validacao.texto(req.body.motivo_encaixe, 'motivo_encaixe', { obrigatorio: false, max: 300 }),
        lembrete_retorno_em: dataOpcional(req.body.lembrete_retorno_em, 'lembrete_retorno_em'),
        lembrete_retorno_observacoes: validacao.texto(req.body.lembrete_retorno_observacoes, 'lembrete_retorno_observacoes', {
            obrigatorio: false,
            max: 300
        }),
        tipo_cobranca: regrasPagamento.validarTipoCobranca(req.body.tipo_cobranca || 'pagar_na_hora'),
        metodo_pagamento_preferido: regrasPagamento.validarMetodoPreferido(req.body.metodo_pagamento_preferido || 'pix_manual')
    });
    res.status(201).json(agendamento);
}

async function atualizar(req, res) {
    const campos = {};
    if (req.body.cliente_id !== undefined) campos.cliente_id = validacao.id(req.body.cliente_id, 'cliente_id');
    if (req.body.servico_id !== undefined) campos.servico_id = validacao.id(req.body.servico_id, 'servico_id');
    if (req.body.profissional_id !== undefined) campos.profissional_id = validacao.id(req.body.profissional_id, 'profissional_id');
    if (req.body.inicio !== undefined) campos.inicio = validacao.data(req.body.inicio);
    if (req.body.status !== undefined) campos.status = validarStatus(req.body.status);
    if (req.body.pagamento_status !== undefined) campos.pagamento_status = validarPagamentoStatus(req.body.pagamento_status);
    if (req.body.tipo_cobranca !== undefined) campos.tipo_cobranca = regrasPagamento.validarTipoCobranca(req.body.tipo_cobranca);
    if (req.body.metodo_pagamento_preferido !== undefined) {
        campos.metodo_pagamento_preferido = regrasPagamento.validarMetodoPreferido(req.body.metodo_pagamento_preferido);
    }
    if (req.body.forma_pagamento !== undefined) {
        campos.forma_pagamento = validacao.texto(req.body.forma_pagamento, 'forma_pagamento', { obrigatorio: false, max: 30 });
    }
    if (req.body.valor_pago !== undefined) campos.valor_pago = validacao.dinheiro(req.body.valor_pago, 'valor_pago');
    if (req.body.permitir_conflito !== undefined) campos.permitir_conflito = validacao.booleano(req.body.permitir_conflito, 'permitir_conflito');
    if (req.body.encaixe !== undefined) campos.encaixe = validacao.booleano(req.body.encaixe, 'encaixe');
    if (req.body.motivo_encaixe !== undefined) {
        campos.motivo_encaixe = validacao.texto(req.body.motivo_encaixe, 'motivo_encaixe', { obrigatorio: false, max: 300 });
    }
    if (req.body.lembrete_retorno_em !== undefined) {
        campos.lembrete_retorno_em = dataOpcional(req.body.lembrete_retorno_em, 'lembrete_retorno_em');
    }
    if (req.body.lembrete_retorno_observacoes !== undefined) {
        campos.lembrete_retorno_observacoes = validacao.texto(
            req.body.lembrete_retorno_observacoes,
            'lembrete_retorno_observacoes',
            { obrigatorio: false, max: 300 }
        );
    }
    if (req.body.lembrete_retorno_concluido !== undefined) {
        campos.lembrete_retorno_concluido = validacao.booleano(req.body.lembrete_retorno_concluido, 'lembrete_retorno_concluido');
    }
    if (req.body.aprovacao_pendente !== undefined) {
        campos.aprovacao_pendente = validacao.booleano(req.body.aprovacao_pendente, 'aprovacao_pendente');
    }
    if (req.body.observacoes !== undefined) {
        campos.observacoes = validacao.texto(req.body.observacoes, 'observacoes', { obrigatorio: false, max: 1000 });
    }
    if (!Object.keys(campos).length) throw new HttpError(400, 'Nenhum campo valido foi enviado.');
    res.json(await agendamentos.atualizar(validacao.id(req.params.id), campos));
}

async function remover(req, res) {
    if (!(await agendamentos.remover(validacao.id(req.params.id)))) {
        throw new HttpError(404, 'Agendamento nao encontrado.');
    }
    res.status(204).end();
}

async function aprovar(req, res) {
    const id = validacao.id(req.params.id);
    const agendamento = await agendamentos.buscarPorId(id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    if (!agendamento.aprovacao_pendente) {
        throw new HttpError(409, 'Esse agendamento nao esta pendente de aprovacao.');
    }
    if (['cancelado', 'faltou', 'concluido'].includes(agendamento.status)) {
        throw new HttpError(409, 'Nao e possivel aprovar um agendamento encerrado.');
    }
    const atualizado = await agendamentos.atualizar(id, {
        status: 'confirmado',
        aprovacao_pendente: false
    });
    const whatsappResult = await enviarWhatsappCliente(req, atualizado, 'confirmacao');
    res.json({ ...atualizado, _whatsapp: whatsappResult });
}

async function recusar(req, res) {
    const id = validacao.id(req.params.id);
    const agendamento = await agendamentos.buscarPorId(id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    if (!agendamento.aprovacao_pendente) {
        throw new HttpError(409, 'Esse agendamento nao esta pendente de aprovacao.');
    }
    const motivo = validacao.texto(req.body.motivo, 'motivo', { obrigatorio: false, max: 300 });
    const observacoes = [
        agendamento.observacoes,
        motivo ? `Pedido recusado: ${motivo}` : 'Pedido recusado pelo painel admin.'
    ].filter(Boolean).join('\n');
    const atualizado = await agendamentos.atualizar(id, {
        status: 'cancelado',
        aprovacao_pendente: false,
        observacoes
    });
    const whatsappResult = await enviarWhatsappCliente(req, atualizado, 'recusa');
    res.json({ ...atualizado, _whatsapp: whatsappResult });
}

async function avisarWhatsapp(req, res) {
    const id = validacao.id(req.params.id);
    const tipo = validacao.texto(req.body.tipo || 'confirmacao', 'tipo', { max: 30 });
    const tipos = ['confirmacao', 'reagendamento', 'cancelamento', 'lembrete', 'pagamento'];
    if (!tipos.includes(tipo)) throw new HttpError(400, `Tipo de aviso invalido. Use: ${tipos.join(', ')}.`);
    const agendamento = await agendamentos.buscarPorId(id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    const negocio = await negocioConfiguracoes.buscar();
    const links = publicActionLinks.actionUrls(req, agendamento.id);
    const texto = whatsappMessages.mensagemAgendamento(agendamento, tipo, negocio, links);
    const url = whatsappMessages.whatsappUrl(agendamento.cliente_telefone, texto);
    if (!url) throw new HttpError(400, 'Cliente sem telefone valido para WhatsApp.');
    let enviado = false;
    if (whatsapp.estaConfigurado()) {
        await whatsapp.enviarTexto({
            para: whatsappMessages.telefoneWaMe(agendamento.cliente_telefone),
            texto
        });
        enviado = true;
    }
    res.json({ enviado, url, texto, tipo, links });
}

module.exports = { listar, buscar, criar, atualizar, remover, aprovar, recusar, avisarWhatsapp };
