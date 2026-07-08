const agendamentos = require('../models/agendamentos');
const publicActionLinks = require('../utils/publicActionLinks');
const validacao = require('../utils/validation');
const { HttpError } = require('../utils/httpError');

const allowedActions = ['confirmar', 'cancelar', 'reagendar'];

function tokenPayload(req, expectedAction = null) {
    const payload = publicActionLinks.verifyToken(req.body.token || req.query.token);
    if (!allowedActions.includes(payload.action)) throw new HttpError(400, 'Acao publica invalida.');
    if (expectedAction && payload.action !== expectedAction) {
        throw new HttpError(403, 'Esse link nao permite esta acao.');
    }
    return payload;
}

function publicoAgendamento(agendamento) {
    return {
        id: agendamento.id,
        cliente_nome: agendamento.cliente_nome,
        servico_nome: agendamento.servico_nome,
        profissional_nome: agendamento.profissional_apelido || agendamento.profissional_nome,
        inicio: agendamento.inicio,
        fim: agendamento.fim,
        status: agendamento.status,
        pagamento_status: agendamento.pagamento_status,
        preco: agendamento.preco
    };
}

async function consultar(req, res) {
    const payload = tokenPayload(req);
    const agendamento = await agendamentos.buscarPorId(payload.agendamento_id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    res.json({
        action: payload.action,
        agendamento: publicoAgendamento(agendamento)
    });
}

async function confirmar(req, res) {
    const payload = tokenPayload(req, 'confirmar');
    const agendamento = await agendamentos.buscarPorId(payload.agendamento_id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    if (['cancelado', 'faltou', 'concluido'].includes(agendamento.status)) {
        throw new HttpError(409, 'Esse horario nao pode mais ser confirmado.');
    }
    const atualizado = await agendamentos.atualizar(agendamento.id, {
        status: 'confirmado',
        aprovacao_pendente: false
    });
    res.json({ message: 'Horario confirmado com sucesso.', agendamento: publicoAgendamento(atualizado) });
}

async function cancelar(req, res) {
    const payload = tokenPayload(req, 'cancelar');
    const agendamento = await agendamentos.buscarPorId(payload.agendamento_id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    if (['cancelado', 'faltou', 'concluido'].includes(agendamento.status)) {
        throw new HttpError(409, 'Esse horario nao pode mais ser cancelado por aqui.');
    }
    const motivo = validacao.texto(req.body.motivo, 'motivo', { obrigatorio: false, max: 300 });
    const observacoes = [
        agendamento.observacoes,
        motivo ? `Cancelado pela cliente: ${motivo}` : 'Cancelado pela cliente pelo link publico.'
    ].filter(Boolean).join('\n');
    const atualizado = await agendamentos.atualizar(agendamento.id, {
        status: 'cancelado',
        aprovacao_pendente: false,
        observacoes
    });
    res.json({ message: 'Horario cancelado com sucesso.', agendamento: publicoAgendamento(atualizado) });
}

async function reagendar(req, res) {
    const payload = tokenPayload(req, 'reagendar');
    const agendamento = await agendamentos.buscarPorId(payload.agendamento_id);
    if (!agendamento) throw new HttpError(404, 'Agendamento nao encontrado.');
    if (['cancelado', 'faltou', 'concluido'].includes(agendamento.status)) {
        throw new HttpError(409, 'Esse horario nao pode mais ser reagendado por aqui.');
    }
    const inicio = validacao.data(req.body.inicio);
    if (inicio <= new Date()) throw new HttpError(400, 'Escolha uma data futura para reagendar.');
    const atualizado = await agendamentos.atualizar(agendamento.id, {
        inicio,
        status: 'agendado',
        aprovacao_pendente: true,
        observacoes: [
            agendamento.observacoes,
            'Cliente solicitou reagendamento pelo link publico.'
        ].filter(Boolean).join('\n')
    });
    res.json({ message: 'Pedido de reagendamento enviado para aprovacao.', agendamento: publicoAgendamento(atualizado) });
}

module.exports = { consultar, confirmar, cancelar, reagendar };
