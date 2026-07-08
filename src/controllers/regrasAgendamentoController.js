const regrasAgendamento = require('../models/regrasAgendamento');
const validacao = require('../utils/validation');
const { HttpError } = require('../utils/httpError');

async function buscar(req, res) {
    res.json(await regrasAgendamento.buscar());
}

async function atualizar(req, res) {
    const campos = {};
    for (const campo of ['antecedencia_cancelamento_horas', 'antecedencia_reagendamento_horas']) {
        if (req.body[campo] !== undefined) campos[campo] = validacao.inteiro(req.body[campo], campo, 0, 168);
    }
    if (req.body.no_show_limite !== undefined) {
        campos.no_show_limite = validacao.inteiro(req.body.no_show_limite, 'no_show_limite', 0, 20);
    }
    if (req.body.no_show_bloqueio_dias !== undefined) {
        campos.no_show_bloqueio_dias = validacao.inteiro(req.body.no_show_bloqueio_dias, 'no_show_bloqueio_dias', 0, 365);
    }
    if (req.body.sinal_habilitado !== undefined) {
        campos.sinal_habilitado = validacao.booleano(req.body.sinal_habilitado, 'sinal_habilitado');
    }
    if (req.body.sinal_percentual !== undefined) {
        campos.sinal_percentual = validacao.inteiro(req.body.sinal_percentual, 'sinal_percentual', 0, 50);
        if (![0, 30, 50].includes(campos.sinal_percentual)) {
            throw new HttpError(400, 'sinal_percentual deve ser 0, 30 ou 50.');
        }
    }
    res.json(await regrasAgendamento.atualizar(campos));
}

module.exports = { buscar, atualizar };
