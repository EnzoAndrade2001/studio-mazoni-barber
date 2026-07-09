const express = require('express');
const clientes = require('../controllers/clientesController');
const servicos = require('../controllers/servicosController');
const profissionais = require('../controllers/profissionaisController');
const bloqueios = require('../controllers/bloqueiosController');
const sistema = require('../controllers/sistemaController');
const pagamentos = require('../controllers/pagamentosController');
const publico = require('../controllers/publicoController');
const repasses = require('../controllers/repassesController');
const comissoes = require('../controllers/comissoesController');
const regrasAgendamento = require('../controllers/regrasAgendamentoController');
const listaEspera = require('../controllers/listaEsperaController');
const whatsapp = require('../controllers/whatsappController');
const produto = require('../controllers/produtoController');
const produtos = require('../controllers/produtosController');
const acoesPublicas = require('../controllers/acoesPublicasController');
const pacotes = require('../controllers/pacotesController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/admin/status', adminAuth.statusAdmin);
router.post('/admin/login', adminAuth.loginAdmin);
router.post('/admin/logout', adminAuth.exigirAdmin, adminAuth.logoutAdmin);

router.get('/clientes', adminAuth.exigirAdmin, clientes.listar);
router.get('/clientes/retornos-inteligentes', adminAuth.exigirAdmin, clientes.retornosInteligentes);
router.get('/clientes/:id', adminAuth.exigirAdmin, clientes.buscar);
router.post('/clientes', adminAuth.exigirAdmin, clientes.criar);
router.patch('/clientes/:id', adminAuth.exigirAdmin, clientes.atualizar);
router.delete('/clientes/:id', adminAuth.exigirAdmin, clientes.remover);

router.get('/servicos', servicos.listar);
router.get('/servicos/:id', servicos.buscar);
router.post('/servicos', adminAuth.exigirAdmin, servicos.criar);
router.patch('/servicos/:id', adminAuth.exigirAdmin, servicos.atualizar);
router.delete('/servicos/:id', adminAuth.exigirAdmin, servicos.remover);

router.get('/profissionais', profissionais.listar);
router.get('/profissionais/:id', profissionais.buscar);
router.post('/profissionais', adminAuth.exigirAdmin, profissionais.criar);
router.patch('/profissionais/:id', adminAuth.exigirAdmin, profissionais.atualizar);
router.delete('/profissionais/:id', adminAuth.exigirAdmin, profissionais.remover);

router.get('/produtos', adminAuth.exigirAdmin, produtos.listar);
router.get('/produtos/:id', adminAuth.exigirAdmin, produtos.buscar);
router.post('/produtos', adminAuth.exigirAdmin, produtos.criar);
router.patch('/produtos/:id', adminAuth.exigirAdmin, produtos.atualizar);
router.delete('/produtos/:id', adminAuth.exigirAdmin, produtos.remover);
router.post('/produtos/:id/movimentos', adminAuth.exigirAdmin, produtos.movimentar);

router.use('/agendamentos', adminAuth.exigirAdmin, require('./agendamentosRoutes'));

router.get('/pagamentos', adminAuth.exigirAdmin, pagamentos.listar);
router.get('/pagamentos/:id', adminAuth.exigirAdmin, pagamentos.buscar);
router.post('/pagamentos/manual', adminAuth.exigirAdmin, pagamentos.registrarManual);
router.post('/pagamentos/asaas', adminAuth.exigirAdmin, pagamentos.criarAsaas);
router.post('/agendamentos/:agendamentoId/pagamentos/asaas', adminAuth.exigirAdmin, pagamentos.criarAsaas);
router.post('/pagamentos/mercado-pago', adminAuth.exigirAdmin, pagamentos.criarMercadoPago);
router.post('/agendamentos/:agendamentoId/pagamentos/mercado-pago', adminAuth.exigirAdmin, pagamentos.criarMercadoPago);
router.get('/repasses', adminAuth.exigirAdmin, repasses.listar);
router.post('/repasses/asaas', adminAuth.exigirAdmin, repasses.criar);
router.get('/comissoes', adminAuth.exigirAdmin, comissoes.resumo);
router.get('/lista-espera/inteligente', adminAuth.exigirAdmin, listaEspera.inteligente);
router.get('/lista-espera', adminAuth.exigirAdmin, listaEspera.listar);
router.patch('/lista-espera/:id', adminAuth.exigirAdmin, listaEspera.atualizar);

router.get('/bloqueios', adminAuth.exigirAdmin, bloqueios.listar);
router.post('/bloqueios', adminAuth.exigirAdmin, bloqueios.criar);
router.delete('/bloqueios/:id', adminAuth.exigirAdmin, bloqueios.remover);

router.post('/webhooks/asaas', pagamentos.webhookAsaas);
router.post('/webhooks/mercado-pago', pagamentos.webhookMercadoPago);
router.get('/webhooks/whatsapp', whatsapp.verificarWebhook);
router.post('/webhooks/whatsapp', whatsapp.receberWebhook);

router.get('/publico', sistema.infoPublica);
router.get('/produto', produto.info);
router.get('/publico/clientes/reconhecer', publico.reconhecerCliente);
router.post('/publico/agendamentos', publico.agendar);
router.post('/publico/lista-espera', listaEspera.criarPublico);
router.get('/publico/acoes/agendamento', acoesPublicas.consultar);
router.post('/publico/acoes/agendamento/confirmar', acoesPublicas.confirmar);
router.post('/publico/acoes/agendamento/cancelar', acoesPublicas.cancelar);
router.post('/publico/acoes/agendamento/reagendar', acoesPublicas.reagendar);
router.get('/disponibilidade', sistema.disponibilidade);
router.get('/disponibilidade/grade', sistema.gradeDisponibilidade);
router.get('/disponibilidade/horarios', sistema.horariosDisponiveis);
router.get('/lembretes/retorno', adminAuth.exigirAdmin, sistema.lembretesRetorno);
router.get('/resumo', adminAuth.exigirAdmin, sistema.resumo);
router.get('/configuracoes', adminAuth.exigirAdmin, sistema.buscarConfiguracoes);
router.patch('/configuracoes', adminAuth.exigirAdmin, sistema.atualizarConfiguracoes);
router.get('/regras-agendamento', adminAuth.exigirAdmin, regrasAgendamento.buscar);
router.patch('/regras-agendamento', adminAuth.exigirAdmin, regrasAgendamento.atualizar);
router.get('/horarios-funcionamento', adminAuth.exigirAdmin, sistema.listarHorariosFuncionamento);
router.patch('/horarios-funcionamento/:dia', adminAuth.exigirAdmin, sistema.atualizarHorarioFuncionamento);
router.get('/configuracoes/negocio', adminAuth.exigirAdmin, sistema.buscarNegocio);
router.patch('/configuracoes/negocio', adminAuth.exigirAdmin, sistema.atualizarNegocio);

// Rotas de Pacotes e Planos
router.get('/pacotes', pacotes.listar);
router.get('/pacotes/:id', pacotes.buscar);
router.post('/pacotes', adminAuth.exigirAdmin, pacotes.criar);
router.patch('/pacotes/:id', adminAuth.exigirAdmin, pacotes.atualizar);
router.delete('/pacotes/:id', adminAuth.exigirAdmin, pacotes.remover);
router.get('/clientes/:clienteId/pacotes', adminAuth.exigirAdmin, pacotes.listarDoCliente);
router.post('/pacotes/adquirir', adminAuth.exigirAdmin, pacotes.adquirir);
router.patch('/pacotes/adquiridos/:id/pagamento', adminAuth.exigirAdmin, pacotes.atualizarPagamento);

module.exports = router;
