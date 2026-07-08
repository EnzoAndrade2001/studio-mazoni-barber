const express = require('express');
const controller = require('../controllers/agendamentosController');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', controller.criar);
router.post('/:id/aprovar', controller.aprovar);
router.post('/:id/recusar', controller.recusar);
router.post('/:id/whatsapp', controller.avisarWhatsapp);
router.patch('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
