const comissoes = require('../models/comissoes');
const validacao = require('../utils/validation');

async function resumo(req, res) {
    res.json(await comissoes.resumo({
        inicio: req.query.inicio ? validacao.data(req.query.inicio, 'inicio') : undefined,
        fim: req.query.fim ? validacao.data(req.query.fim, 'fim') : undefined,
        profissionalId: req.query.profissional_id ? validacao.id(req.query.profissional_id, 'profissional_id') : undefined
    }));
}

module.exports = { resumo };
