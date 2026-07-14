const state = {
    clientes: [],
    servicos: [],
    profissionais: [],
    agendamentos: [],
    resumo: null,
    comissoes: null,
    lembretes: [],
    listaEspera: [],
    listaEsperaInteligente: [],
    retornosInteligentes: [],
    produtos: [],
    setup: null,
    business: {
        nome: 'Agenda de Servicos',
        nome_curto: 'Agenda Admin',
        inicial: 'A',
        proprietaria: 'Equipe'
    },
    adminProtegido: false
};

const el = {
    selectedDate: document.querySelector('#selectedDate'),
    prevDay: document.querySelector('#prevDay'),
    nextDay: document.querySelector('#nextDay'),
    refreshButton: document.querySelector('#refreshButton'),
    dayLabel: document.querySelector('#dayLabel'),
    summaryGrid: document.querySelector('#summaryGrid'),
    homeDayLabel: document.querySelector('#homeDayLabel'),
    homeMetrics: document.querySelector('#homeMetrics'),
    homeRefreshButton: document.querySelector('#homeRefreshButton'),
    quickBlockButton: document.querySelector('#quickBlockButton'),
    nextCount: document.querySelector('#nextCount'),
    pendingCount: document.querySelector('#pendingCount'),
    nextAppointments: document.querySelector('#nextAppointments'),
    pendingAppointments: document.querySelector('#pendingAppointments'),
    financePeriodLabel: document.querySelector('#financePeriodLabel'),
    financeRefreshButton: document.querySelector('#financeRefreshButton'),
    financeTotals: document.querySelector('#financeTotals'),
    commissionList: document.querySelector('#commissionList'),
    productRefreshButton: document.querySelector('#productRefreshButton'),
    productForm: document.querySelector('#productForm'),
    productName: document.querySelector('#productName'),
    productCategory: document.querySelector('#productCategory'),
    productSalePrice: document.querySelector('#productSalePrice'),
    productCost: document.querySelector('#productCost'),
    productStock: document.querySelector('#productStock'),
    productMinStock: document.querySelector('#productMinStock'),
    productNotes: document.querySelector('#productNotes'),
    productAlerts: document.querySelector('#productAlerts'),
    productList: document.querySelector('#productList'),
    invTotalProducts: document.querySelector('#invTotalProducts'),
    invTotalValue: document.querySelector('#invTotalValue'),
    invLowStock: document.querySelector('#invLowStock'),
    inventoryMoveModal: document.querySelector('#inventoryMoveModal'),
    inventoryMoveForm: document.querySelector('#inventoryMoveForm'),
    inventoryMoveTitle: document.querySelector('#inventoryMoveTitle'),
    inventoryMoveDesc: document.querySelector('#inventoryMoveDesc'),
    inventoryMoveQty: document.querySelector('#inventoryMoveQty'),
    waitlistRefreshButton: document.querySelector('#waitlistRefreshButton'),
    waitlistAdminList: document.querySelector('#waitlistAdminList'),
    smartReturnRefreshButton: document.querySelector('#smartReturnRefreshButton'),
    smartReturnList: document.querySelector('#smartReturnList'),
    appointmentsList: document.querySelector('#appointmentsList'),
    appointmentForm: document.querySelector('#appointmentForm'),
    appointmentClient: document.querySelector('#appointmentClient'),
    appointmentService: document.querySelector('#appointmentService'),
    appointmentProfessional: document.querySelector('#appointmentProfessional'),
    appointmentTime: document.querySelector('#appointmentTime'),
    appointmentCustomTime: document.querySelector('#appointmentCustomTime'),
    appointmentChargeType: document.querySelector('#appointmentChargeType'),
    appointmentPaymentMethod: document.querySelector('#appointmentPaymentMethod'),
    appointmentNotes: document.querySelector('#appointmentNotes'),
    clientForm: document.querySelector('#clientForm'),
    clientName: document.querySelector('#clientName'),
    clientPhone: document.querySelector('#clientPhone'),
    clientEmail: document.querySelector('#clientEmail'),
    clientList: document.querySelector('#clientList'),
    clientProfile: document.querySelector('#clientProfile'),
    serviceForm: document.querySelector('#serviceForm'),
    serviceName: document.querySelector('#serviceName'),
    serviceCategory: document.querySelector('#serviceCategory'),
    serviceDuration: document.querySelector('#serviceDuration'),
    servicePrice: document.querySelector('#servicePrice'),
    serviceDescription: document.querySelector('#serviceDescription'),
    serviceList: document.querySelector('#serviceList'),
    professionalForm: document.querySelector('#professionalForm'),
    professionalName: document.querySelector('#professionalName'),
    professionalNickname: document.querySelector('#professionalNickname'),
    professionalCommission: document.querySelector('#professionalCommission'),
    professionalOrder: document.querySelector('#professionalOrder'),
    professionalOwner: document.querySelector('#professionalOwner'),
    professionalBio: document.querySelector('#professionalBio'),
    professionalList: document.querySelector('#professionalList'),
    businessForm: document.querySelector('#businessForm'),
    businessName: document.querySelector('#businessName'),
    businessShortName: document.querySelector('#businessShortName'),
    businessOwner: document.querySelector('#businessOwner'),
    businessInitial: document.querySelector('#businessInitial'),
    businessSegment: document.querySelector('#businessSegment'),
    businessSubtitle: document.querySelector('#businessSubtitle'),
    businessRegion: document.querySelector('#businessRegion'),
    businessBookingText: document.querySelector('#businessBookingText'),
    businessLocationTitle: document.querySelector('#businessLocationTitle'),
    businessLocationDescription: document.querySelector('#businessLocationDescription'),
    transferForm: document.querySelector('#transferForm'),
    transferAmount: document.querySelector('#transferAmount'),
    transferDefaultHint: document.querySelector('#transferDefaultHint'),
    transferDescription: document.querySelector('#transferDescription'),
    transferConfirmation: document.querySelector('#transferConfirmation'),
    transferList: document.querySelector('#transferList'),
    adminLogin: document.querySelector('#adminLogin'),
    adminLoginForm: document.querySelector('#adminLoginForm'),
    adminUserLabel: document.querySelector('#adminUserLabel'),
    adminUser: document.querySelector('#adminUser'),
    adminToken: document.querySelector('#adminToken'),
    logoutButton: document.querySelector('#logoutButton'),
    editDialog: document.querySelector('#editDialog'),
    editForm: document.querySelector('#editForm'),
    closeEdit: document.querySelector('#closeEdit'),
    editAppointmentId: document.querySelector('#editAppointmentId'),
    editClient: document.querySelector('#editClient'),
    editService: document.querySelector('#editService'),
    editProfessional: document.querySelector('#editProfessional'),
    editDate: document.querySelector('#editDate'),
    editTime: document.querySelector('#editTime'),
    editChargeType: document.querySelector('#editChargeType'),
    editPaymentMethod: document.querySelector('#editPaymentMethod'),
    editNotes: document.querySelector('#editNotes'),
    editReminderDate: document.querySelector('#editReminderDate'),
    editReminderDays: document.querySelector('#editReminderDays'),
    editReminderNotes: document.querySelector('#editReminderNotes'),
    editReminderDone: document.querySelector('#editReminderDone'),
    confirmDialog: document.querySelector('#confirmDialog'),
    confirmKicker: document.querySelector('#confirmKicker'),
    confirmTitle: document.querySelector('#confirmTitle'),
    confirmMessage: document.querySelector('#confirmMessage'),
    confirmCancel: document.querySelector('#confirmCancel'),
    confirmAccept: document.querySelector('#confirmAccept'),
    notificationButton: document.querySelector('#notificationButton'),
    notificationCount: document.querySelector('#notificationCount'),
    notificationPanel: document.querySelector('#notificationPanel'),
    notificationList: document.querySelector('#notificationList'),
    setupChecklist: document.querySelector('#setupChecklist'),
    toast: document.querySelector('#toast')
};

function today() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
}

function addDays(dateText, amount) {
    const date = new Date(`${dateText}T12:00:00`);
    date.setDate(date.getDate() + amount);
    return date.toISOString().slice(0, 10);
}

function addDaysFromDate(value, amount) {
    const date = new Date(value);
    date.setDate(date.getDate() + amount);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function startOfDay(dateText) {
    return `${dateText}T00:00:00-03:00`;
}

function nextDayStart(dateText) {
    return `${addDays(dateText, 1)}T00:00:00-03:00`;
}

function currency(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function durationLabel(minutes) {
    const total = Number(minutes || 0);
    const hours = Math.floor(total / 60);
    const remaining = total % 60;
    if (hours && remaining) return `${hours}h${String(remaining).padStart(2, '0')}`;
    if (hours) return `${hours}h`;
    return `${remaining} min`;
}

function time(value) {
    return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dateInputValue(value) {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function timeInputValue(value) {
    const date = new Date(value);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dateLong(dateText) {
    const date = new Date(`${dateText}T12:00:00`);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function dateShort(value) {
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function phoneDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function reminderLabel(days) {
    if (days < 0) return `${Math.abs(days)} dia(s) atrasado`;
    if (days === 0) return 'retorno hoje';
    return `em ${days} dia(s)`;
}

function chargeLabel(value) {
    return ({
        pagar_na_hora: 'pagar na hora',
        sinal_30: 'entrada 30%',
        sinal_50: 'entrada 50%',
        total: 'total antecipado'
    })[value] || value || 'pagar na hora';
}

function methodLabel(value) {
    return ({
        pix_online: 'Pix online',
        cartao_online: 'cartao online',
        pix_manual: 'Pix manual',
        dinheiro: 'dinheiro'
    })[value] || value || 'Pix manual';
}

function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('visible');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => el.toast.classList.remove('visible'), 3200);
}

function applyBusinessInfo(negocio = {}) {
    state.business = { ...state.business, ...(negocio || {}) };
    document.title = `Admin | ${state.business.nome}`;
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', `${state.business.nome_curto || state.business.nome} Admin`);
    document.querySelectorAll('.brand-name').forEach((node) => { node.textContent = state.business.nome; });
    document.querySelectorAll('.brand-mark').forEach((node) => { node.textContent = state.business.inicial || 'A'; });
    document.querySelectorAll('.brand-lockup').forEach((node) => { node.setAttribute('aria-label', state.business.nome); });
    if (el.transferDescription && !el.transferDescription.dataset.edited) {
        el.transferDescription.value = `Repasse ${state.business.nome}`;
    }
    fillBusinessForm();
}

function fillBusinessForm() {
    if (!el.businessForm) return;
    el.businessName.value = state.business.nome || '';
    el.businessShortName.value = state.business.nome_curto || '';
    el.businessOwner.value = state.business.proprietaria || '';
    el.businessInitial.value = state.business.inicial || '';
    el.businessSegment.value = state.business.segmento || '';
    el.businessSubtitle.value = state.business.subtitulo || '';
    el.businessRegion.value = state.business.regiao || '';
    el.businessBookingText.value = state.business.frase_agendamento || '';
    el.businessLocationTitle.value = state.business.local_titulo || '';
    el.businessLocationDescription.value = state.business.local_descricao || '';
}

function confirmAction({
    title = 'Confirmar acao',
    message = 'Tem certeza?',
    kicker = 'Confirmacao',
    acceptText = 'Confirmar',
    danger = false
}) {
    if (!el.confirmDialog) return Promise.resolve(window.confirm(message));
    el.confirmKicker.textContent = kicker;
    el.confirmTitle.textContent = title;
    el.confirmMessage.textContent = message;
    el.confirmAccept.textContent = acceptText;
    el.confirmAccept.className = danger ? 'danger-button' : 'primary-button';
    el.confirmDialog.hidden = false;
    document.body.classList.add('modal-open');
    el.confirmCancel.focus();

    return new Promise((resolve) => {
        const close = (result) => {
            el.confirmDialog.hidden = true;
            document.body.classList.remove('modal-open');
            el.confirmCancel.removeEventListener('click', onCancel);
            el.confirmAccept.removeEventListener('click', onAccept);
            el.confirmDialog.removeEventListener('click', onBackdrop);
            document.removeEventListener('keydown', onKeydown);
            resolve(result);
        };
        const onCancel = () => close(false);
        const onAccept = () => close(true);
        const onBackdrop = (event) => {
            if (event.target === el.confirmDialog) close(false);
        };
        const onKeydown = (event) => {
            if (event.key === 'Escape') close(false);
        };
        el.confirmCancel.addEventListener('click', onCancel);
        el.confirmAccept.addEventListener('click', onAccept);
        el.confirmDialog.addEventListener('click', onBackdrop);
        document.addEventListener('keydown', onKeydown);
    });
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

const demoAdminData = {
    profissionais: [
        { id: 1, nome: 'Deryck', apelido: 'Deryck', bio: 'Cortes e degrade.', dono: false, comissao_percentual: 50, ordem: 1, ativo: true },
        { id: 2, nome: 'Leo Mazoni', apelido: 'Leo', bio: 'Dono e barbeiro do Studio.', dono: true, comissao_percentual: 100, ordem: 2, ativo: true },
        { id: 3, nome: 'Gustavo', apelido: 'Gustavo', bio: 'Corte, barba e acabamento.', dono: false, comissao_percentual: 50, ordem: 3, ativo: true }
    ],
    servicos: [
        { id: 1, nome: 'Corte degrade', descricao: 'Corte degrade com acabamento.', categoria: 'Corte', duracao_minutos: 30, preco: 35 },
        { id: 2, nome: 'Corte e Barba', descricao: 'Combo com corte, barba e finalizacao.', categoria: 'Combo', duracao_minutos: 60, preco: 55 },
        { id: 3, nome: 'Combo premium', descricao: 'Atendimento completo do Studio.', categoria: 'Combo', duracao_minutos: 65, preco: 65 },
        { id: 4, nome: 'Sobrancelha', descricao: 'Acabamento rapido.', categoria: 'Detalhes', duracao_minutos: 5, preco: 10 },
        { id: 5, nome: 'Barba', descricao: 'Modelagem e acabamento.', categoria: 'Barba', duracao_minutos: 30, preco: 25 }
    ],
    clientes: [
        { id: 1, nome: 'Marcos Silva', telefone: '51999887766', email: 'marcos@email.com' },
        { id: 2, nome: 'Rafael Costa', telefone: '51988776655', email: '' },
        { id: 3, nome: 'Pedro Almeida', telefone: '51977665544', email: 'pedro@email.com' }
    ],
    negocio: {
        nome: 'Studio Mazoni Barber',
        nome_curto: 'Mazoni Barber',
        proprietaria: 'Admin',
        inicial: 'M',
        segmento: 'Barbearia premium',
        subtitulo: 'Corte, barba e atendimento com hora marcada.',
        regiao: 'Santa Tereza, Rio Grande do Sul',
        frase_agendamento: 'Escolha Deryck, Leo Mazoni ou Gustavo e veja os horarios livres em tempo real.',
        local_titulo: 'Rua Abelardo Marques 180',
        local_descricao: 'Santa Tereza, Rio Grande do Sul. Segunda 13:30-20:00, terca a sabado 09:00-20:00.'
    }
};

function demoIso(date, hour) {
    return `${date}T${hour}:00-03:00`;
}

function demoAppointments(date = today()) {
    return [
        {
            id: 101,
            cliente_id: 1,
            cliente_nome: 'Marcos Silva',
            cliente_telefone: '51999887766',
            servico_id: 1,
            servico_nome: 'Corte degrade',
            profissional_id: 1,
            inicio: demoIso(date, '09:00'),
            fim: demoIso(date, '09:30'),
            preco: 35,
            valor_pago: 35,
            saldo_restante: 0,
            status: 'confirmado',
            pagamento_status: 'pago',
            tipo_cobranca: 'pagar_na_hora',
            metodo_pagamento_preferido: 'pix_manual',
            observacoes: 'Cliente gosta de acabamento baixo.'
        },
        {
            id: 102,
            cliente_id: 2,
            cliente_nome: 'Rafael Costa',
            cliente_telefone: '51988776655',
            servico_id: 2,
            servico_nome: 'Corte e Barba',
            profissional_id: 2,
            inicio: demoIso(date, '10:30'),
            fim: demoIso(date, '11:30'),
            preco: 55,
            valor_pago: 0,
            saldo_restante: 55,
            status: 'solicitado',
            pagamento_status: 'pendente',
            aprovacao_pendente: true,
            tipo_cobranca: 'pagar_na_hora',
            metodo_pagamento_preferido: 'dinheiro'
        },
        {
            id: 103,
            cliente_id: 3,
            cliente_nome: 'Pedro Almeida',
            cliente_telefone: '51977665544',
            servico_id: 5,
            servico_nome: 'Barba',
            profissional_id: 3,
            inicio: demoIso(date, '15:30'),
            fim: demoIso(date, '16:00'),
            preco: 25,
            valor_pago: 0,
            saldo_restante: 25,
            status: 'confirmado',
            pagamento_status: 'pendente',
            tipo_cobranca: 'pagar_na_hora',
            metodo_pagamento_preferido: 'pix_manual',
            lembrete_retorno_em: date
        }
    ];
}

async function demoApi(path, options = {}) {
    const url = new URL(path, window.location.href);
    const route = url.pathname;
    const date = (url.searchParams.get('inicio') || el.selectedDate?.value || today()).slice(0, 10);
    if (route === '/api/admin/status') return { protegido: false, autenticado: true, usuario_obrigatorio: false };
    if (route === '/api/clientes') return demoAdminData.clientes;
    if (/^\/api\/clientes\/\d+$/.test(route)) {
        const id = Number(route.split('/').pop());
        const cliente = demoAdminData.clientes.find((item) => Number(item.id) === id) || demoAdminData.clientes[0];
        return {
            ...cliente,
            preferencias: { corte: 'Degrade baixo', barba: 'Acabamento alinhado' },
            observacoes: 'Cliente demo para validar a tela Cliente 360.',
            estatisticas: {
                total_agendamentos: 5,
                atendimentos_concluidos: 4,
                no_shows: id === 2 ? 1 : 0,
                cancelamentos: id === 2 ? 2 : 0,
                cancelamentos_em_cima: id === 2 ? 1 : 0,
                ultimo_no_show_em: id === 2 ? demoIso(today(), '10:30') : null,
                ultimo_agendamento_em: demoIso(today(), '09:00'),
                total_pago: id === 1 ? 520 : 90,
                frequencia_media_dias: id === 1 ? 18 : 40,
                dias_desde_ultimo_agendamento: id === 1 ? 14 : 52
            },
            score_confianca: id === 1
                ? {
                    pontos: 92,
                    classificacao: 'vip',
                    bloqueado_online: false,
                    acao_recomendada: 'Prioridade para encaixe e retorno.'
                }
                : {
                    pontos: 42,
                    classificacao: 'risco_de_falta',
                    bloqueado_online: false,
                    acao_recomendada: 'Pedir confirmacao manual ou pagamento antecipado.'
                },
            historico: demoAppointments(today())
                .filter((agendamento) => Number(agendamento.cliente_id) === Number(cliente.id))
                .map((agendamento) => ({
                    id: agendamento.id,
                    inicio: agendamento.inicio,
                    fim: agendamento.fim,
                    status: agendamento.status,
                    pagamento_status: agendamento.pagamento_status,
                    valor_pago: agendamento.valor_pago,
                    preco: agendamento.preco,
                    servico_nome: agendamento.servico_nome,
                    profissional_nome: agendamento.profissional_nome,
                    profissional_apelido: agendamento.profissional_nome
                }))
        };
    }
    if (route === '/api/clientes/retornos-inteligentes') {
        return [
            {
                cliente_id: 4,
                cliente_nome: 'Lucas Martins',
                cliente_telefone: '51966554433',
                ultimo_atendimento: addDays(today(), -28),
                ultimo_servico: 'Corte degrade',
                ultimo_profissional: 'Leo',
                atendimentos: 4,
                ciclo_estimado_dias: 20,
                dias_sem_cortar: 28,
                data_sugerida: addDays(today(), -8)
            },
            {
                cliente_id: 5,
                cliente_nome: 'Bruno Ferreira',
                cliente_telefone: '51955443322',
                ultimo_atendimento: addDays(today(), -45),
                ultimo_servico: 'Corte e Barba',
                ultimo_profissional: 'Deryck',
                atendimentos: 2,
                ciclo_estimado_dias: 30,
                dias_sem_cortar: 45,
                data_sugerida: addDays(today(), -15)
            }
        ];
    }
    if (route === '/api/servicos' && options.method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        return { id: Date.now(), ativo: true, ...body };
    }
    if (/^\/api\/servicos\/\d+$/.test(route) && ['PATCH', 'DELETE'].includes(options.method || 'GET')) {
        return { ok: true };
    }
    if (route === '/api/servicos') return demoAdminData.servicos;
    if (route === '/api/profissionais' && options.method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        return { id: Date.now(), ativo: true, ...body };
    }
    if (/^\/api\/profissionais\/\d+$/.test(route) && ['PATCH', 'DELETE'].includes(options.method || 'GET')) {
        return { ok: true };
    }
    if (route === '/api/profissionais') return demoAdminData.profissionais;
    if (route === '/api/publico') {
        return {
            nome: demoAdminData.negocio.nome,
            negocio: demoAdminData.negocio,
            setup: {
                whatsapp_configurado: true,
                pagamento_online_configurado: false,
                public_base_url_configurada: false,
                public_base_url_https: false,
                pix_disponivel: false
            }
        };
    }
    if (route === '/api/agendamentos') return demoAppointments(date);
    if (route === '/api/resumo') {
        return { total: 3, concluidos: 1, faturamento: 35, cancelados: 0, pagamentos_pendentes: 2 };
    }
    if (route === '/api/comissoes') {
        return {
            totais: {
                valor_recebido: 35,
                comissao_barbeiros: 0,
                repasse_dono: 35,
                atendimentos: 1
            },
            profissionais: [
                {
                    profissional_id: 2,
                    profissional_nome: 'Leo Mazoni',
                    profissional_apelido: 'Leo',
                    dono: true,
                    comissao_percentual: 100,
                    atendimentos: 1,
                    valor_recebido: 35,
                    comissao_barbeiro: 35,
                    repasse_dono: 35
                },
                {
                    profissional_id: 1,
                    profissional_nome: 'Deryck',
                    profissional_apelido: 'Deryck',
                    dono: false,
                    comissao_percentual: 50,
                    atendimentos: 0,
                    valor_recebido: 0,
                    comissao_barbeiro: 0,
                    repasse_dono: 0
                },
                {
                    profissional_id: 3,
                    profissional_nome: 'Gustavo',
                    profissional_apelido: 'Gustavo',
                    dono: false,
                    comissao_percentual: 50,
                    atendimentos: 0,
                    valor_recebido: 0,
                    comissao_barbeiro: 0,
                    repasse_dono: 0
                }
            ]
        };
    }
    if (route === '/api/lembretes/retorno') {
        return [{
            agendamento_id: 103,
            cliente_nome: 'Pedro Almeida',
            cliente_telefone: '51977665544',
            servico_nome: 'Barba',
            data_retorno: el.selectedDate?.value || today(),
            dias_restantes: 0,
            lembrete_retorno_observacoes: 'Chamar para retorno de acabamento.'
        }];
    }
    if (route === '/api/disponibilidade') {
        const baseDate = url.searchParams.get('data') || today();
        return ['09:00', '09:30', '11:30', '13:30', '14:00', '16:30', '18:00', '19:00'].map((hour) => demoIso(baseDate, hour));
    }
    if (route === '/api/repasses') return [];
    if (route === '/api/produtos' && options.method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        return { id: Date.now(), ativo: true, estoque_baixo: Number(body.estoque_atual || 0) <= Number(body.estoque_minimo || 0), ...body };
    }
    if (route === '/api/produtos') {
        return [
            {
                id: 701,
                nome: 'Pomada efeito matte',
                categoria: 'Pomada',
                preco_venda: 45,
                custo_unitario: 22,
                estoque_atual: 3,
                estoque_minimo: 5,
                controla_estoque: true,
                estoque_baixo: true,
                observacoes: 'Reposicao semanal.'
            },
            {
                id: 702,
                nome: 'Balm para barba',
                categoria: 'Barba',
                preco_venda: 38,
                custo_unitario: 18,
                estoque_atual: 9,
                estoque_minimo: 3,
                controla_estoque: true,
                estoque_baixo: false,
                observacoes: ''
            }
        ];
    }
    if (/^\/api\/produtos\/\d+/.test(route)) {
        return { ok: true, id: Number(route.split('/')[3] || Date.now()) };
    }
    if (route === '/api/lista-espera/inteligente') {
        return [
            {
                id: 501,
                cliente_id: 2,
                nome: 'Rafael Costa',
                telefone: '51988776655',
                servico_nome: 'Corte e Barba',
                profissional_apelido: 'Leo',
                data_preferida: today(),
                periodo: 'depois das 18h',
                status: 'aguardando',
                observacoes: 'Quer encaixe se abrir vaga depois das 18h.',
                vaga_inicio: demoIso(today(), '18:30'),
                vaga_fim: demoIso(today(), '19:30'),
                vaga_servico_nome: 'Corte e Barba',
                vaga_profissional_apelido: 'Leo'
            }
        ];
    }
    if (route === '/api/lista-espera') {
        return [
            {
                id: 501,
                cliente_id: 2,
                nome: 'Rafael Costa',
                telefone: '51988776655',
                servico_nome: 'Corte e Barba',
                profissional_apelido: 'Leo',
                data_preferida: today(),
                periodo: 'fim da tarde',
                status: 'aguardando',
                observacoes: 'Quer encaixe se abrir vaga depois das 18h.'
            },
            {
                id: 502,
                cliente_id: null,
                nome: 'Lucas Martins',
                telefone: '51966554433',
                servico_nome: 'Corte degrade',
                profissional_apelido: null,
                data_preferida: '',
                periodo: 'qualquer',
                status: 'aguardando',
                observacoes: ''
            }
        ];
    }
    if (/^\/api\/lista-espera\/\d+$/.test(route)) {
        return { ok: true, status: JSON.parse(options.body || '{}').status || 'avisado' };
    }
    if (route.includes('/pagamentos/mercado-pago')) {
        return {
            id: Date.now(),
            status: 'pendente',
            checkout_url: 'https://www.mercadopago.com.br/',
            sandbox_checkout_url: 'https://www.mercadopago.com.br/'
        };
    }
    if (route === '/api/configuracoes/negocio') return demoAdminData.negocio;
    if (options.method && options.method !== 'GET') return { ok: true, id: Date.now(), status: 'demo' };
    throw new Error('Endpoint demo indisponivel.');
}

async function api(path, options = {}) {
    if (window.location.protocol === 'file:') return demoApi(path, options);
    let response;
    try {
        response = await fetch(path, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
    } catch (error) {
        return demoApi(path, options);
    }
    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.erro || 'Nao foi possivel completar a acao.');
        error.status = response.status;
        error.details = data.detalhes || {};
        if (response.status === 401) showLogin();
        throw error;
    }
    return data;
}

function showLogin() {
    if (!el.adminLogin) return;
    el.adminLogin.hidden = false;
    el.adminLogin.style.display = 'grid';
    document.body.classList.add('login-open');
    if (el.adminUser && !el.adminUserLabel.hidden) el.adminUser.focus();
    else if (el.adminToken) el.adminToken.focus();
}

function hideLogin() {
    if (!el.adminLogin) return;
    el.adminLogin.hidden = true;
    el.adminLogin.style.display = 'none';
    document.body.classList.remove('login-open');
}

function option(value, label) {
    const node = document.createElement('option');
    node.value = value;
    node.textContent = label;
    return node;
}

function renderSelects() {
    el.appointmentClient.replaceChildren(
        option('', state.clientes.length ? 'Selecione' : 'Cadastre uma cliente'),
        ...state.clientes.map((cliente) => option(cliente.id, `${cliente.nome} - ${cliente.telefone}`))
    );
    el.appointmentService.replaceChildren(
        option('', state.servicos.length ? 'Selecione' : 'Cadastre um servico'),
        ...state.servicos.map((servico) => option(
            servico.id,
            `${servico.nome} - ${durationLabel(servico.duracao_minutos)} - ${currency(servico.preco)}`
        ))
    );
    if (el.appointmentProfessional) {
        el.appointmentProfessional.replaceChildren(
            option('', state.profissionais.length ? 'Selecione' : 'Cadastre um barbeiro'),
            ...state.profissionais.map((profissional) => option(profissional.id, profissional.apelido || profissional.nome))
        );
        if (!el.appointmentProfessional.value && state.profissionais.length) {
            el.appointmentProfessional.value = state.profissionais[0].id;
        }
    }
    if (el.editClient && el.editService) {
        el.editClient.replaceChildren(
            ...state.clientes.map((cliente) => option(cliente.id, `${cliente.nome} - ${cliente.telefone}`))
        );
        el.editService.replaceChildren(
            ...state.servicos.map((servico) => option(
                servico.id,
                `${servico.nome} - ${durationLabel(servico.duracao_minutos)} - ${currency(servico.preco)}`
            ))
        );
        if (el.editProfessional) {
            el.editProfessional.replaceChildren(
                ...state.profissionais.map((profissional) => option(profissional.id, profissional.apelido || profissional.nome))
            );
        }
    }
}

function renderClientList() {
    if (!el.clientList) return;
    if (!state.clientes.length) {
        el.clientList.innerHTML = '<div class="mini-empty">Nenhuma cliente ativa.</div>';
        return;
    }
    el.clientList.replaceChildren(...state.clientes.slice(0, 8).map((cliente) => {
        const item = document.createElement('article');
        item.className = 'client-item';
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(cliente.nome)}</strong>
                <span>${escapeHtml(cliente.telefone)}</span>
            </div>
        `;
        item.append(actionButton('Perfil', 'primary-button mini-button', () => openClientProfile(cliente.id)));
        item.append(actionButton('Excluir', 'secondary-button mini-button', () => archiveClient(cliente)));
        return item;
    }));
}

function renderProfessionalList() {
    if (!el.professionalList) return;
    if (!state.profissionais.length) {
        el.professionalList.innerHTML = '<div class="mini-empty">Nenhum barbeiro ativo cadastrado.</div>';
        return;
    }
    el.professionalList.replaceChildren(...state.profissionais.map((profissional) => {
        const item = document.createElement('article');
        item.className = 'professional-admin-card';
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(profissional.apelido || profissional.nome)}</strong>
                <span>${escapeHtml(profissional.nome)}${profissional.dono ? ' - dono' : ''}</span>
                <small>${Number(profissional.comissao_percentual || 0)}% comissao · ordem ${Number(profissional.ordem || 0)}</small>
                ${profissional.bio ? `<small>${escapeHtml(profissional.bio)}</small>` : ''}
            </div>
        `;
        item.append(actionButton('Editar', 'secondary-button mini-button', () => fillProfessionalForm(profissional)));
        item.append(actionButton('Desativar', 'danger-button mini-button', () => archiveProfessional(profissional)));
        return item;
    }));
}

function renderServiceList() {
    if (!el.serviceList) return;
    if (!state.servicos.length) {
        el.serviceList.innerHTML = '<div class="mini-empty">Nenhum servico ativo cadastrado.</div>';
        return;
    }
    el.serviceList.replaceChildren(...state.servicos.map((servico) => {
        const item = document.createElement('article');
        item.className = 'service-admin-card';
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(servico.nome)}</strong>
                <span>${escapeHtml(servico.categoria || 'Barbearia')} - ${durationLabel(servico.duracao_minutos)} - ${currency(servico.preco)}</span>
                ${servico.descricao ? `<small>${escapeHtml(servico.descricao)}</small>` : ''}
            </div>
        `;
        item.append(actionButton('Editar', 'secondary-button mini-button', () => fillServiceForm(servico)));
        item.append(actionButton('Desativar', 'danger-button mini-button', () => archiveService(servico)));
        return item;
    }));
}

function fillServiceForm(servico) {
    if (!el.serviceForm) return;
    el.serviceForm.dataset.editingId = servico.id;
    el.serviceName.value = servico.nome || '';
    if (el.serviceCategory) el.serviceCategory.value = servico.categoria || 'Barbearia';
    el.serviceDuration.value = servico.duracao_minutos || 60;
    el.servicePrice.value = servico.preco ?? '';
    if (el.serviceDescription) el.serviceDescription.value = servico.descricao || '';
    el.serviceForm.querySelector('button[type="submit"]').textContent = 'Salvar alteracoes';
    el.serviceName.focus({ preventScroll: true });
    el.serviceForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearServiceForm() {
    if (!el.serviceForm) return;
    delete el.serviceForm.dataset.editingId;
    el.serviceForm.reset();
    if (el.serviceCategory) el.serviceCategory.value = 'Barbearia';
    el.serviceDuration.value = 60;
    el.serviceForm.querySelector('button[type="submit"]').textContent = 'Salvar servico';
}

async function archiveService(servico) {
    const confirma = await confirmAction({
        title: 'Desativar servico',
        message: `Desativar ${servico.nome}? Ele deixa de aparecer para novos agendamentos, mas o historico continua salvo.`,
        kicker: 'Servicos',
        acceptText: 'Desativar',
        danger: true
    });
    if (!confirma) return;
    try {
        await api(`/api/servicos/${servico.id}`, { method: 'DELETE' });
        showToast('Servico desativado.');
        await loadBaseData();
        await loadDay();
    } catch (error) {
        showToast(error.message);
    }
}

function fillProfessionalForm(profissional) {
    if (!el.professionalForm) return;
    el.professionalForm.dataset.editingId = profissional.id;
    el.professionalName.value = profissional.nome || '';
    el.professionalNickname.value = profissional.apelido || '';
    el.professionalCommission.value = profissional.comissao_percentual ?? 50;
    el.professionalOrder.value = profissional.ordem ?? 0;
    el.professionalOwner.checked = Boolean(profissional.dono);
    el.professionalBio.value = profissional.bio || '';
    el.professionalForm.querySelector('button[type="submit"]').textContent = 'Salvar alteracoes';
    el.professionalName.focus({ preventScroll: true });
    el.professionalForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearProfessionalForm() {
    if (!el.professionalForm) return;
    delete el.professionalForm.dataset.editingId;
    el.professionalForm.reset();
    el.professionalCommission.value = 50;
    el.professionalOrder.value = 0;
    el.professionalForm.querySelector('button[type="submit"]').textContent = 'Salvar barbeiro';
}

async function archiveProfessional(profissional) {
    const confirma = await confirmAction({
        title: 'Desativar barbeiro',
        message: `Desativar ${profissional.apelido || profissional.nome}? Ele deixa de aparecer para novos horarios, mas o historico continua salvo.`,
        kicker: 'Barbeiros',
        acceptText: 'Desativar',
        danger: true
    });
    if (!confirma) return;
    try {
        await api(`/api/profissionais/${profissional.id}`, { method: 'DELETE' });
        showToast('Barbeiro desativado.');
        await loadBaseData();
        await loadDay();
    } catch (error) {
        showToast(error.message);
    }
}

function preferenceText(preferencias) {
    if (!preferencias || typeof preferencias !== 'object' || Array.isArray(preferencias)) return 'Nenhuma preferencia registrada.';
    const entries = Object.entries(preferencias).filter(([, value]) => value !== undefined && value !== null && String(value).trim());
    if (!entries.length) return 'Nenhuma preferencia registrada.';
    return entries.map(([key, value]) => `${key}: ${value}`).join(' | ');
}

function trustScoreLabel(value) {
    return ({
        vip: 'VIP',
        recorrente: 'Recorrente',
        novo: 'Novo',
        risco_de_falta: 'Risco de falta',
        bloqueado_online: 'Bloqueado online'
    })[value] || 'Novo';
}

function renderClientProfile(cliente) {
    if (!el.clientProfile) return;
    const stats = cliente.estatisticas || {};
    const historico = cliente.historico || [];
    const score = cliente.score_confianca || { pontos: 50, classificacao: 'novo', acao_recomendada: 'Confirmar normalmente.' };
    el.clientProfile.hidden = false;
    el.clientProfile.innerHTML = `
        <div class="client-profile-head">
            <div>
                <span>Cliente 360</span>
                <h3>${escapeHtml(cliente.nome)}</h3>
                <p>${escapeHtml(cliente.telefone)}${cliente.email ? ` · ${escapeHtml(cliente.email)}` : ''}</p>
            </div>
            <button class="icon-button" type="button" data-close-client-profile aria-label="Fechar perfil">x</button>
        </div>
        <div class="client-trust-card ${escapeHtml(score.classificacao)}">
            <div>
                <span>Score de confianca</span>
                <strong>${escapeHtml(trustScoreLabel(score.classificacao))}</strong>
                <small>${escapeHtml(score.acao_recomendada || 'Confirmar normalmente.')}</small>
            </div>
            <em>${Number(score.pontos || 0)}</em>
        </div>
        <div class="client-profile-metrics">
            <div><strong>${stats.total_agendamentos || 0}</strong><span>agendamentos</span></div>
            <div><strong>${stats.atendimentos_concluidos || 0}</strong><span>concluidos</span></div>
            <div><strong>${stats.no_shows || 0}</strong><span>faltas</span></div>
            <div><strong>${currency(stats.total_pago || 0)}</strong><span>total pago</span></div>
            <div><strong>${stats.cancelamentos || 0}</strong><span>cancelamentos</span></div>
            <div><strong>${stats.cancelamentos_em_cima || 0}</strong><span>em cima da hora</span></div>
        </div>
        <div class="client-profile-note">
            <strong>Preferencias</strong>
            <p>${escapeHtml(preferenceText(cliente.preferencias))}</p>
        </div>
        ${cliente.observacoes ? `
            <div class="client-profile-note">
                <strong>Observacoes</strong>
                <p>${escapeHtml(cliente.observacoes)}</p>
            </div>
        ` : ''}
        <div class="client-history">
            <strong>Historico recente</strong>
            ${historico.length ? historico.slice(0, 8).map((item) => `
                <article>
                    <time>${dateShort(item.inicio)} · ${time(item.inicio)}</time>
                    <div>
                        <strong>${escapeHtml(item.servico_nome)}</strong>
                        <span>${escapeHtml(item.profissional_apelido || item.profissional_nome || 'Barbeiro')} · ${escapeHtml(item.status)} · ${escapeHtml(item.pagamento_status || 'pendente')}</span>
                    </div>
                    <em>${currency(item.valor_pago || 0)}</em>
                </article>
            `).join('') : '<div class="mini-empty">Sem historico ainda.</div>'}
        </div>
    `;
    el.clientProfile.querySelector('[data-close-client-profile]')?.addEventListener('click', () => {
        el.clientProfile.hidden = true;
    });
    el.clientProfile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function openClientProfile(id) {
    try {
        const cliente = await api(`/api/clientes/${id}`);
        renderClientProfile(cliente);
    } catch (error) {
        showToast(error.message);
    }
}

async function loadTimes() {
    const servicoId = el.appointmentService.value;
    const profissionalId = el.appointmentProfessional && el.appointmentProfessional.value;
    if (!servicoId || !profissionalId) {
        el.appointmentTime.replaceChildren(option('', 'Escolha servico e barbeiro'));
        return;
    }
    const horarios = await api(`/api/disponibilidade?data=${el.selectedDate.value}&servico_id=${servicoId}&profissional_id=${profissionalId}`);
    el.appointmentTime.replaceChildren(
        option('', horarios.length ? 'Selecione' : 'Sem horarios livres'),
        ...horarios.map((inicio) => option(inicio, time(inicio)))
    );
}

function selectedStart() {
    if (el.appointmentCustomTime.value) {
        return `${el.selectedDate.value}T${el.appointmentCustomTime.value}:00-03:00`;
    }
    return el.appointmentTime.value;
}

function renderSummary() {
    const resumo = state.resumo || { total: 0, concluidos: 0, faturamento: 0, cancelados: 0 };
    el.summaryGrid.innerHTML = `
        <div><strong>${resumo.total}</strong><span>marcados</span></div>
        <div><strong>${resumo.concluidos}</strong><span>concluidos</span></div>
        <div><strong>${currency(resumo.faturamento)}</strong><span>recebido</span></div>
        <div><strong>${resumo.cancelados}</strong><span>cancelados</span></div>
    `;
}

function actionButton(text, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', handler);
    return button;
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } finally {
        textarea.remove();
    }
    return copied;
}

function appointmentIsOpen(agendamento) {
    return !['concluido', 'cancelado', 'faltou'].includes(agendamento.status);
}

function appointmentHasPendingPayment(agendamento) {
    return appointmentIsOpen(agendamento)
        && agendamento.pagamento_status !== 'pago'
        && Number(agendamento.saldo_restante ?? agendamento.preco ?? 0) > 0;
}

function appointmentUsesOnlinePayment(agendamento) {
    return ['pix_online', 'cartao_online'].includes(agendamento.metodo_pagamento_preferido);
}

function whatsappAppointmentUrl(agendamento) {
    const telefone = phoneDigits(agendamento.cliente_telefone);
    if (!telefone) return null;
    const texto = [
        `Oi, ${agendamento.cliente_nome}!`,
        `Aqui e do ${state.business.nome}.`,
        `Seu horario: ${time(agendamento.inicio)} - ${agendamento.servico_nome}.`
    ].join(' ');
    return `https://wa.me/55${telefone.replace(/^55/, '')}?text=${encodeURIComponent(texto)}`;
}

async function sendWhatsappNotice(agendamento, tipo = 'confirmacao', { openLink = true } = {}) {
    try {
        const result = await api(`/api/agendamentos/${agendamento.id}/whatsapp`, {
            method: 'POST',
            body: JSON.stringify({ tipo })
        });
        if (openLink && result.url) window.open(result.url, '_blank', 'noopener');
        showToast(result.enviado ? 'WhatsApp enviado.' : 'Mensagem pronta para WhatsApp.');
        return result;
    } catch (error) {
        const fallback = whatsappAppointmentUrl(agendamento);
        if (fallback && openLink) {
            window.open(fallback, '_blank', 'noopener');
            showToast('Abri o WhatsApp com uma mensagem padrao.');
            return null;
        }
        showToast(error.message);
        return null;
    }
}

async function copyClientLinks(agendamento) {
    const result = await sendWhatsappNotice(agendamento, 'confirmacao', { openLink: false });
    if (!result || !result.links) return;
    const text = [
        `Links do horario de ${agendamento.cliente_nome}:`,
        `Confirmar: ${result.links.confirmar}`,
        `Reagendar: ${result.links.reagendar}`,
        `Cancelar: ${result.links.cancelar}`
    ].join('\n');
    try {
        const copied = await copyText(text);
        showToast(copied ? 'Links copiados.' : 'Nao consegui copiar automaticamente.');
    } catch {
        showToast('Nao consegui copiar automaticamente.');
    }
}

function appointmentPaymentMethod(agendamento) {
    return agendamento.metodo_pagamento_preferido === 'dinheiro' ? 'dinheiro' : 'pix_manual';
}

async function confirmPayment(agendamento) {
    const saldo = Number(agendamento.saldo_restante ?? agendamento.preco ?? 0);
    if (saldo <= 0) {
        showToast('Esse horario ja esta sem saldo pendente.');
        return;
    }
    const confirma = await confirmAction({
        title: 'Confirmar pagamento',
        message: `Confirmar recebimento de ${currency(saldo)} de ${agendamento.cliente_nome}?`,
        kicker: 'Pagamento',
        acceptText: 'Confirmar'
    });
    if (!confirma) return;
    try {
        await api('/api/pagamentos/manual', {
            method: 'POST',
            body: JSON.stringify({
                agendamento_id: agendamento.id,
                valor: saldo,
                metodo: appointmentPaymentMethod(agendamento),
                tipo: 'manual'
            })
        });
        showToast('Pagamento confirmado.');
        await sendWhatsappNotice(agendamento, 'pagamento', { openLink: false });
        await loadDay();
    } catch (error) {
        showToast(error.message);
    }
}

async function createOnlinePayment(agendamento) {
    try {
        const pagamento = await api(`/api/agendamentos/${agendamento.id}/pagamentos/mercado-pago`, {
            method: 'POST',
            body: JSON.stringify({
                metodo: agendamento.metodo_pagamento_preferido || 'pix_online',
                tipo: agendamento.tipo_cobranca === 'total' ? 'total' : 'manual'
            })
        });
        const checkoutUrl = pagamento.checkout_url || pagamento.sandbox_checkout_url;
        if (checkoutUrl) {
            window.open(checkoutUrl, '_blank', 'noopener');
            showToast('Link Mercado Pago aberto.');
        } else {
            showToast('Cobranca criada, mas sem link de checkout.');
        }
        await loadDay();
    } catch (error) {
        const pagamento = error.details && error.details.pagamento;
        const checkoutUrl = pagamento && (pagamento.checkout_url || pagamento.sandbox_checkout_url);
        if (checkoutUrl) {
            window.open(checkoutUrl, '_blank', 'noopener');
            showToast('Ja existia uma cobranca pendente. Abri o link.');
            return;
        }
        showToast(error.message);
    }
}

function miniAppointment(agendamento, type = 'next') {
    const item = document.createElement('article');
    item.className = `mini-appointment ${type}`;
    const whatsUrl = whatsappAppointmentUrl(agendamento);
    item.innerHTML = `
        <time>${time(agendamento.inicio)}</time>
        <div>
            <strong>${escapeHtml(agendamento.cliente_nome)}</strong>
            <span>${escapeHtml(agendamento.servico_nome)}${agendamento.profissional_nome ? ` - ${escapeHtml(agendamento.profissional_nome)}` : ''}</span>
            <small>${escapeHtml(agendamento.status)} · ${escapeHtml(agendamento.pagamento_status || 'pendente')}</small>
        </div>
    `;
    const actions = document.createElement('div');
    actions.className = 'mini-actions';
    if (whatsUrl) {
        actions.append(actionButton('WhatsApp', 'secondary-button mini-button', () => sendWhatsappNotice(agendamento, 'confirmacao')));
        actions.append(actionButton('Copiar links', 'secondary-button mini-button link-copy-button', () => copyClientLinks(agendamento)));
    }
    if (appointmentHasPendingPayment(agendamento)) {
        actions.append(actionButton('Pago', 'primary-button mini-button', () => confirmPayment(agendamento)));
        if (appointmentUsesOnlinePayment(agendamento)) {
            actions.append(actionButton('Mercado Pago', 'secondary-button mini-button', () => createOnlinePayment(agendamento)));
        }
    }
    actions.append(actionButton('Editar', 'secondary-button mini-button', () => openEdit(agendamento)));
    item.append(actions);
    return item;
}

function renderAdminHome() {
    if (!el.homeMetrics) return;
    const resumo = state.resumo || { total: 0, faturamento: 0, pagamentos_pendentes: 0 };
    const now = new Date();
    const selectedIsToday = el.selectedDate.value === today();
    const active = state.agendamentos.filter(appointmentIsOpen);
    const next = active
        .filter((agendamento) => !selectedIsToday || new Date(agendamento.inicio) >= now)
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
        .slice(0, 4);
    const pending = state.agendamentos
        .filter((agendamento) => agendamento.aprovacao_pendente || appointmentHasPendingPayment(agendamento))
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    const noShows = state.agendamentos.filter((agendamento) => agendamento.status === 'faltou').length;
    const alerts = noShows + state.lembretes.filter((lembrete) => Number(lembrete.dias_restantes) <= 0).length;
    const pendingTotal = pending.length || Number(resumo.pagamentos_pendentes || 0);

    if (el.homeDayLabel) el.homeDayLabel.textContent = dateLong(el.selectedDate.value);
    el.homeMetrics.innerHTML = `
        <div><strong>${resumo.total || state.agendamentos.length}</strong><span>agendamentos</span></div>
        <div><strong>${currency(resumo.faturamento || 0)}</strong><span>recebido</span></div>
        <div><strong>${pendingTotal}</strong><span>pendencias</span></div>
        <div><strong>${alerts}</strong><span>alertas</span></div>
    `;
    if (el.nextCount) el.nextCount.textContent = next.length;
    if (el.pendingCount) el.pendingCount.textContent = pending.length;
    if (el.nextAppointments) {
        el.nextAppointments.replaceChildren(...(next.length
            ? next.map((agendamento) => miniAppointment(agendamento, 'next'))
            : [emptyMini('Nenhum proximo horario aberto.')]));
    }
    if (el.pendingAppointments) {
        el.pendingAppointments.replaceChildren(...(pending.length
            ? pending.slice(0, 5).map((agendamento) => miniAppointment(agendamento, 'pending'))
            : [emptyMini('Sem pendencias para essa data.')]));
    }
}

function renderFinance() {
    if (!el.financeTotals || !el.commissionList) return;
    const data = state.comissoes || {
        totais: { valor_recebido: 0, comissao_barbeiros: 0, repasse_dono: 0, atendimentos: 0 },
        profissionais: []
    };
    const totais = data.totais || {};
    if (el.financePeriodLabel) {
        el.financePeriodLabel.textContent = `Financeiro de ${dateLong(el.selectedDate.value)}.`;
    }
    el.financeTotals.innerHTML = `
        <div><strong>${currency(totais.valor_recebido || 0)}</strong><span>recebido</span></div>
        <div><strong>${currency(totais.comissao_barbeiros || 0)}</strong><span>comissoes</span></div>
        <div><strong>${currency(totais.repasse_dono || 0)}</strong><span>dono</span></div>
        <div><strong>${totais.atendimentos || 0}</strong><span>atendimentos</span></div>
    `;
    if (!data.profissionais || !data.profissionais.length) {
        el.commissionList.innerHTML = '<div class="mini-empty">Nenhum barbeiro ativo para calcular comissao.</div>';
        return;
    }
    el.commissionList.replaceChildren(...data.profissionais.map((item) => {
        const card = document.createElement('article');
        card.className = 'commission-card';
        const nome = item.profissional_apelido || item.profissional_nome;
        card.innerHTML = `
            <div>
                <strong>${escapeHtml(nome)}</strong>
                <span>${item.dono ? 'Dono' : `${Number(item.comissao_percentual || 0)}% de comissao`}</span>
            </div>
            <dl>
                <div><dt>Recebido</dt><dd>${currency(item.valor_recebido || 0)}</dd></div>
                <div><dt>Comissao</dt><dd>${currency(item.comissao_barbeiro || 0)}</dd></div>
                <div><dt>Dono</dt><dd>${currency(item.repasse_dono || 0)}</dd></div>
                <div><dt>Atend.</dt><dd>${item.atendimentos || 0}</dd></div>
            </dl>
        `;
        return card;
    }));
}

function productStockLabel(produto) {
    if (!produto.controla_estoque) return 'sem controle';
    return `${Number(produto.estoque_atual || 0)} un.`;
}

function renderProducts() {
    if (!el.productList || !el.productAlerts) return;
    const produtos = state.produtos || [];
    const baixos = produtos.filter((produto) => produto.estoque_baixo);
    
    // Update Alerts
    el.productAlerts.innerHTML = baixos.length
        ? `<strong>${baixos.length} alerta(s) de estoque baixo</strong><span>${baixos.map((produto) => escapeHtml(produto.nome)).join(', ')}</span>`
        : '<strong>Estoque em dia</strong><span>Nenhum produto abaixo do minimo.</span>';
        
    // Update Summary Dashboard
    if (el.invTotalProducts) {
        el.invTotalProducts.textContent = produtos.length;
        const totalValue = produtos.reduce((sum, p) => sum + (Number(p.estoque_atual || 0) * Number(p.custo_unitario || 0)), 0);
        el.invTotalValue.textContent = currency(totalValue);
        el.invLowStock.textContent = baixos.length;
    }

    if (!produtos.length) {
        el.productList.innerHTML = '<div class="mini-empty">Nenhum produto cadastrado.</div>';
        return;
    }
    
    // Group products by category
    const grouped = produtos.reduce((acc, produto) => {
        const cat = produto.categoria || 'Sem categoria';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(produto);
        return acc;
    }, {});
    
    const fragment = document.createDocumentFragment();
    
    for (const [categoria, items] of Object.entries(grouped).sort()) {
        const title = document.createElement('h3');
        title.className = 'inventory-category-title';
        title.textContent = categoria;
        fragment.appendChild(title);
        
        items.forEach(produto => {
            const card = document.createElement('article');
            card.className = `inventory-card ${produto.estoque_baixo ? 'low-stock' : ''}`;
            card.innerHTML = `
                <div class="inventory-main">
                    <span>${escapeHtml(produto.categoria || 'Produto')}</span>
                    <h3>${escapeHtml(produto.nome)}</h3>
                    <p>${escapeHtml(produto.observacoes || 'Sem observacoes.')}</p>
                </div>
                <dl>
                    <div><dt>Estoque</dt><dd>${escapeHtml(productStockLabel(produto))}</dd></div>
                    <div><dt>Minimo</dt><dd>${Number(produto.estoque_minimo || 0)}</dd></div>
                    <div><dt>Venda</dt><dd>${currency(produto.preco_venda || 0)}</dd></div>
                    <div><dt>Custo</dt><dd>${currency(produto.custo_unitario || 0)}</dd></div>
                </dl>
            `;
            const actions = document.createElement('div');
            actions.className = 'inventory-actions';
            actions.append(actionButton('Entrada', 'secondary-button mini-button', () => moveProduct(produto, 'entrada')));
            actions.append(actionButton('Saida', 'secondary-button mini-button', () => moveProduct(produto, 'saida')));
            actions.append(actionButton('Venda', 'primary-button mini-button', () => moveProduct(produto, 'venda')));
            actions.append(actionButton('Editar', 'secondary-button mini-button', () => fillProductForm(produto)));
            actions.append(actionButton('Desativar', 'danger-button mini-button', () => archiveProduct(produto)));
            card.append(actions);
            fragment.appendChild(card);
        });
    }
    
    el.productList.replaceChildren(fragment);
}

function fillProductForm(produto) {
    if (!el.productForm) return;
    el.productForm.dataset.editingId = produto.id;
    el.productName.value = produto.nome || '';
    el.productCategory.value = produto.categoria || 'Retail';
    el.productSalePrice.value = produto.preco_venda ?? 0;
    el.productCost.value = produto.custo_unitario ?? 0;
    el.productStock.value = produto.estoque_atual ?? 0;
    el.productMinStock.value = produto.estoque_minimo ?? 0;
    el.productNotes.value = produto.observacoes || '';
    el.productForm.querySelector('button[type="submit"]').textContent = 'Salvar alteracoes';
    el.productForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearProductForm() {
    if (!el.productForm) return;
    delete el.productForm.dataset.editingId;
    el.productForm.reset();
    el.productCategory.value = 'Retail';
    el.productCost.value = 0;
    el.productStock.value = 0;
    el.productMinStock.value = 0;
    el.productForm.querySelector('button[type="submit"]').textContent = 'Salvar produto';
}

async function moveProduct(produto, tipo) {
    if (!el.inventoryMoveModal) {
        // Fallback if modal not present
        const quantidadeTexto = window.prompt(`Quantidade para ${tipo} de ${produto.nome}?`, '1');
        if (!quantidadeTexto) return;
        executeProductMovement(produto, tipo, Number(quantidadeTexto));
        return;
    }
    
    el.inventoryMoveTitle.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1) + ' de Estoque';
    el.inventoryMoveDesc.textContent = `Produto: ${produto.nome} (Atual: ${produto.estoque_atual})`;
    el.inventoryMoveQty.value = 1;
    
    el.inventoryMoveModal.showModal();
    
    // Cleanup previous listeners
    const newForm = el.inventoryMoveForm.cloneNode(true);
    el.inventoryMoveForm.parentNode.replaceChild(newForm, el.inventoryMoveForm);
    el.inventoryMoveForm = newForm;
    el.inventoryMoveQty = newForm.querySelector('#inventoryMoveQty');
    
    el.inventoryMoveForm.addEventListener('submit', (e) => {
        // Only trigger if submitted by the button
        if (e.submitter && e.submitter.id === 'inventoryMoveSubmit') {
            const quantidade = Number(el.inventoryMoveQty.value);
            executeProductMovement(produto, tipo, quantidade);
        }
    });
}

async function executeProductMovement(produto, tipo, quantidade) {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        showToast('Informe uma quantidade inteira positiva.');
        return;
    }
    try {
        await api(`/api/produtos/${produto.id}/movimentos`, {
            method: 'POST',
            body: JSON.stringify({
                tipo,
                quantidade,
                valor_unitario: tipo === 'venda' ? produto.preco_venda : produto.custo_unitario,
                observacoes: tipo === 'venda' ? 'Venda registrada no painel admin' : `Movimento manual: ${tipo}`
            })
        });
        showToast('Estoque atualizado.');
        await loadProducts();
    } catch (error) {
        showToast(error.message);
    }
}

async function archiveProduct(produto) {
    const confirma = await confirmAction({
        title: 'Desativar produto',
        message: `Desativar ${produto.nome}? Ele sai do estoque ativo, mas o historico permanece salvo.`,
        kicker: 'Produtos',
        acceptText: 'Desativar',
        danger: true
    });
    if (!confirma) return;
    try {
        await api(`/api/produtos/${produto.id}`, { method: 'DELETE' });
        showToast('Produto desativado.');
        await loadProducts();
    } catch (error) {
        showToast(error.message);
    }
}

function waitlistWhatsappUrl(item) {
    const telefone = phoneDigits(item.telefone);
    if (!telefone) return null;
    const servico = item.vaga_servico_nome || item.servico_nome;
    const profissional = item.vaga_profissional_apelido || item.vaga_profissional_nome || item.profissional_apelido || item.profissional_nome;
    const quando = item.vaga_inicio ? `${dateShort(item.vaga_inicio)} as ${time(item.vaga_inicio)}` : (item.data_preferida ? `no dia ${dateShort(item.data_preferida)}` : '');
    const detalhes = [
        quando ? ` ${quando}` : '',
        profissional ? ` com ${profissional}` : '',
        servico ? ` para ${servico}` : ''
    ].join('');
    const texto = item.vaga_inicio
        ? `Oi, ${item.nome}! Aqui e do ${state.business.nome}. Abriu um horario${detalhes}. Quer reservar?`
        : `Oi, ${item.nome}! Aqui e do ${state.business.nome}. Surgiu uma possibilidade de horario${detalhes}. Quer que eu confira uma vaga para voce?`;
    return `https://wa.me/55${telefone.replace(/^55/, '')}?text=${encodeURIComponent(texto)}`;
}

async function updateWaitlistStatus(item, status) {
    try {
        await api(`/api/lista-espera/${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showToast('Lista de espera atualizada.');
        await loadWaitlist();
    } catch (error) {
        showToast(error.message);
    }
}

function renderWaitlistAdmin() {
    if (!el.waitlistAdminList) return;
    const inteligentes = state.listaEsperaInteligente || [];
    const idsInteligentes = new Set(inteligentes.map((item) => Number(item.id)));
    const items = [
        ...inteligentes.map((item) => ({ ...item, destaque_vaga: true })),
        ...(state.listaEspera || []).filter((item) => !idsInteligentes.has(Number(item.id)))
    ];
    if (!items.length) {
        el.waitlistAdminList.innerHTML = '<div class="mini-empty">Nenhum cliente aguardando vaga.</div>';
        return;
    }
    el.waitlistAdminList.replaceChildren(...items.map((item) => {
        const card = document.createElement('article');
        card.className = `waitlist-admin-card ${item.status || 'aguardando'} ${item.destaque_vaga ? 'has-opening' : ''}`;
        const whatsUrl = waitlistWhatsappUrl(item);
        const profissionalVaga = item.vaga_profissional_apelido || item.vaga_profissional_nome;
        card.innerHTML = `
            <div>
                <span>${item.destaque_vaga ? 'vaga aberta' : escapeHtml(item.status || 'aguardando')}</span>
                <h3>${escapeHtml(item.nome)}</h3>
                ${item.vaga_inicio ? `<strong class="waitlist-opening">Abriu ${dateShort(item.vaga_inicio)} as ${time(item.vaga_inicio)}${profissionalVaga ? ` com ${escapeHtml(profissionalVaga)}` : ''}</strong>` : ''}
                <p>${escapeHtml(item.telefone)}${item.servico_nome ? ` · ${escapeHtml(item.servico_nome)}` : ''}</p>
                <small>${item.profissional_apelido ? `Barbeiro: ${escapeHtml(item.profissional_apelido)} · ` : ''}${item.data_preferida ? `Data: ${dateShort(item.data_preferida)} · ` : ''}${escapeHtml(item.periodo || 'qualquer periodo')}</small>
                ${item.observacoes ? `<small>${escapeHtml(item.observacoes)}</small>` : ''}
            </div>
        `;
        const actions = document.createElement('div');
        actions.className = 'waitlist-actions';
        if (whatsUrl) {
            actions.append(actionButton('WhatsApp', 'primary-button mini-button', () => {
                window.open(whatsUrl, '_blank', 'noopener');
                updateWaitlistStatus(item, 'avisado');
            }));
        }
        actions.append(actionButton('Converter', 'secondary-button mini-button', () => updateWaitlistStatus(item, 'convertido')));
        actions.append(actionButton('Cancelar', 'danger-button mini-button', () => updateWaitlistStatus(item, 'cancelado')));
        card.append(actions);
        return card;
    }));
}

function smartReturnWhatsappUrl(item) {
    const telefone = phoneDigits(item.cliente_telefone);
    if (!telefone) return null;
    const numero = telefone.startsWith('55') ? telefone : `55${telefone}`;
    const nome = String(item.cliente_nome || '').split(' ')[0] || 'tudo bem';
    const barbeiro = item.ultimo_profissional || 'time';
    const texto = `Fala, ${nome}! Aqui e do ${state.business.nome}. Ja ta na hora daquele talento? Tenho horario com o ${barbeiro} essa semana. Quer que eu veja uma vaga pra ti?`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function renderSmartReturns() {
    if (!el.smartReturnList) return;
    const items = state.retornosInteligentes || [];
    if (!items.length) {
        el.smartReturnList.innerHTML = '<div class="mini-empty">Nenhum cliente no ponto de retorno agora.</div>';
        return;
    }
    el.smartReturnList.replaceChildren(...items.map((item) => {
        const card = document.createElement('article');
        card.className = 'smart-return-card';
        const whatsUrl = smartReturnWhatsappUrl(item);
        const diasSemCortar = Number(item.dias_sem_cortar || 0);
        const ciclo = Number(item.ciclo_estimado_dias || 30);
        const atraso = Math.max(0, diasSemCortar - ciclo);
        card.innerHTML = `
            <div class="smart-return-main">
                <span>Retorno sugerido</span>
                <h3>${escapeHtml(item.cliente_nome)}</h3>
                <p>${escapeHtml(item.cliente_nome)} esta ha <strong>${diasSemCortar} dias</strong> sem cortar.</p>
                <small>
                    Ciclo estimado: ${ciclo} dias
                    ${atraso ? ` - ${atraso} dia(s) acima do costume` : ''}
                </small>
                <small>
                    Ultimo: ${escapeHtml(item.ultimo_servico || 'servico')} com ${escapeHtml(item.ultimo_profissional || 'barbeiro')}
                    ${item.ultimo_atendimento ? ` em ${dateShort(item.ultimo_atendimento)}` : ''}
                </small>
            </div>
            <div class="smart-return-message">
                <strong>Mensagem pronta</strong>
                <p>Ja ta na hora daquele talento? Tenho horario essa semana.</p>
            </div>
        `;
        const actions = document.createElement('div');
        actions.className = 'smart-return-actions';
        if (whatsUrl) {
            actions.append(actionButton('Chamar no WhatsApp', 'primary-button mini-button', () => window.open(whatsUrl, '_blank', 'noopener')));
        }
        actions.append(actionButton('Ver ficha', 'secondary-button mini-button', () => openClientProfile(item.cliente_id)));
        card.append(actions);
        return card;
    }));
}

function emptyMini(text) {
    const node = document.createElement('div');
    node.className = 'mini-empty';
    node.textContent = text;
    return node;
}

function appointmentCard(agendamento) {
    const row = document.createElement('article');
    row.className = `appointment ${agendamento.status}`;
    const statusClass = ['cancelado', 'faltou'].includes(agendamento.status) ? agendamento.status : '';
    row.innerHTML = `
        <div class="appointment-time">
            <strong>${time(agendamento.inicio)}</strong>
            <span>${time(agendamento.fim)}</span>
        </div>
        <div class="appointment-main">
            <div class="appointment-title">
                <h3>${escapeHtml(agendamento.cliente_nome)}</h3>
                <strong>${currency(agendamento.preco)}</strong>
            </div>
            <p>${escapeHtml(agendamento.servico_nome)}</p>
            ${agendamento.observacoes ? `<p>${escapeHtml(agendamento.observacoes)}</p>` : ''}
            <div class="status-row">
                <span class="pill ${statusClass}">${escapeHtml(agendamento.status)}</span>
                ${agendamento.aprovacao_pendente ? '<span class="pill approval">aguardando aprovacao</span>' : ''}
                ${agendamento.encaixe ? '<span class="pill encaixe">encaixe</span>' : ''}
                <span class="pill pagamento">${escapeHtml(agendamento.pagamento_status || 'pendente')}</span>
                <span class="pill">${escapeHtml(chargeLabel(agendamento.tipo_cobranca))}</span>
                <span class="pill">${escapeHtml(methodLabel(agendamento.metodo_pagamento_preferido))}</span>
                ${agendamento.lembrete_retorno_em ? `<span class="pill reminder">retorno ${dateShort(agendamento.lembrete_retorno_em)}</span>` : ''}
            </div>
            <div class="money-row">
                <span>Pago: ${currency(agendamento.valor_pago)}</span>
                <span>Falta: ${currency(agendamento.saldo_restante)}</span>
            </div>
        </div>
    `;
    const actions = document.createElement('div');
    actions.className = 'actions';
    if (!['concluido', 'cancelado', 'faltou'].includes(agendamento.status)) {
        actions.append(
            actionButton('Remarcar', 'secondary-button', () => openEdit(agendamento)),
                actionButton(
                    agendamento.aprovacao_pendente ? 'Aprovar' : 'Confirmar',
                    agendamento.aprovacao_pendente ? 'primary-button' : 'secondary-button',
                    () => updateStatusAndNotify(agendamento, 'confirmado')
                ),
                actionButton('Concluir', 'primary-button', () => updateStatus(agendamento.id, 'concluido'))
        );
        if (appointmentHasPendingPayment(agendamento)) {
            actions.append(actionButton('Confirmar pagamento', 'primary-button outline-primary', () => confirmPayment(agendamento)));
            if (appointmentUsesOnlinePayment(agendamento)) {
                actions.append(actionButton('Link Mercado Pago', 'secondary-button', () => createOnlinePayment(agendamento)));
            }
        }
        if (whatsappAppointmentUrl(agendamento)) {
            actions.append(actionButton('WhatsApp', 'secondary-button', () => sendWhatsappNotice(agendamento, 'confirmacao')));
            actions.append(actionButton('Copiar links', 'secondary-button link-copy-button', () => copyClientLinks(agendamento)));
        }
        actions.append(actionButton('Cancelar', 'danger-button', () => updateStatusAndNotify(agendamento, 'cancelado')));
    } else {
        actions.append(actionButton('Editar', 'secondary-button', () => openEdit(agendamento)));
    }
    actions.append(actionButton('Excluir', 'danger-button outline-danger', () => deleteAppointment(agendamento)));
    row.append(actions);
    return row;
}

function barberName(profissional) {
    return profissional.apelido || profissional.nome || 'Barbeiro';
}

function renderBarberColumn(profissional, agendamentos) {
    const section = document.createElement('section');
    section.className = 'barber-column';
    const active = agendamentos.filter(appointmentIsOpen).length;
    const paid = agendamentos.reduce((total, item) => total + Number(item.valor_pago || 0), 0);
    section.innerHTML = `
        <header class="barber-column-head">
            <div>
                <span>${escapeHtml(active)} aberto(s)</span>
                <h3>${escapeHtml(barberName(profissional))}</h3>
            </div>
            <strong>${currency(paid)}</strong>
        </header>
    `;
    const list = document.createElement('div');
    list.className = 'barber-column-list';
    if (agendamentos.length) {
        list.replaceChildren(...agendamentos.map(appointmentCard));
    } else {
        list.append(emptyMini('Sem horarios marcados.'));
    }
    section.append(list);
    return section;
}

function renderAppointments() {
    el.dayLabel.textContent = dateLong(el.selectedDate.value);
    const sorted = [...state.agendamentos].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    const groups = state.profissionais.map((profissional) => ({
        profissional,
        agendamentos: sorted.filter((agendamento) => Number(agendamento.profissional_id) === Number(profissional.id))
    }));
    const unassigned = sorted.filter((agendamento) => !agendamento.profissional_id);
    if (unassigned.length) {
        groups.push({ profissional: { nome: 'Sem barbeiro definido', apelido: 'Sem barbeiro' }, agendamentos: unassigned });
    }
    if (!state.profissionais.length && !unassigned.length) {
        el.appointmentsList.innerHTML = '<div class="empty-state">Nenhum barbeiro cadastrado para montar a agenda.</div>';
        return;
    }
    el.appointmentsList.replaceChildren(...groups.map((group) => renderBarberColumn(group.profissional, group.agendamentos)));
}

function renderNotifications() {
    if (!el.notificationButton || !el.notificationCount || !el.notificationList) return;
    const count = state.lembretes.length;
    el.notificationCount.textContent = count;
    el.notificationButton.classList.toggle('has-alerts', count > 0);
    if (!count) {
        el.notificationList.innerHTML = '<div class="notification-empty">Nenhum retorno pendente.</div>';
        return;
    }
    el.notificationList.replaceChildren(...state.lembretes.map((lembrete) => {
        const item = document.createElement('article');
        item.className = 'notification-item';
        item.innerHTML = `
            <strong>${escapeHtml(lembrete.cliente_nome)}</strong>
            <span>${escapeHtml(lembrete.servico_nome)} - ${dateShort(lembrete.data_retorno)}</span>
            <small>${escapeHtml(reminderLabel(Number(lembrete.dias_restantes)))} · ${escapeHtml(lembrete.cliente_telefone)}</small>
            ${lembrete.lembrete_retorno_observacoes ? `<small>${escapeHtml(lembrete.lembrete_retorno_observacoes)}</small>` : ''}
        `;
        item.append(actionButton('Resolvido', 'secondary-button mini-button', () => resolveReminder(lembrete.agendamento_id)));
        return item;
    }));
}

function renderSetupChecklist() {
    if (!el.setupChecklist || !state.setup) return;
    const itens = [
        {
            pronto: Boolean(state.setup.whatsapp_configurado),
            label: 'WhatsApp Business'
        },
        {
            pronto: Boolean(state.setup.pagamento_online_configurado),
            label: 'Pagamento online'
        },
        {
            pronto: Boolean(state.setup.public_base_url_configurada),
            label: 'PUBLIC_BASE_URL'
        },
        {
            pronto: Boolean(state.setup.public_base_url_https),
            label: 'PUBLIC_BASE_URL com HTTPS'
        }
    ];
    const pendentes = itens.filter((item) => !item.pronto);
    if (!pendentes.length) {
        el.setupChecklist.hidden = true;
        return;
    }
    el.setupChecklist.hidden = false;
    el.setupChecklist.innerHTML = `
        <strong>Configuracao pendente</strong>
        <div class="setup-checklist-items">
            ${itens.map((item) => `<span class="setup-pill ${item.pronto ? 'ok' : 'pending'}">${item.pronto ? 'ok' : 'pendente'} - ${escapeHtml(item.label)}</span>`).join('')}
        </div>
    `;
}

function renderTransferDefault() {
    if (!el.transferDefaultHint) return;
    const destino = state.setup && state.setup.repasse_destino_padrao;
    if (destino && destino.configurado) {
        el.transferDefaultHint.textContent = `Destino fixo: ${destino.pix_chave_tipo} ${destino.pix_chave_mascarada}`;
        return;
    }
    el.transferDefaultHint.textContent = 'Destino padrao nao configurado.';
}

async function loadTransfers() {
    if (!el.transferList) return;
    const repasses = await api('/api/repasses');
    if (!repasses.length) {
        el.transferList.hidden = true;
        el.transferList.replaceChildren();
        return;
    }
    el.transferList.hidden = false;
    el.transferList.innerHTML = `
        <strong>Ultimos repasses</strong>
        <div class="setup-checklist-items">
            ${repasses.slice(0, 5).map((repasse) => `
                <span class="setup-pill ${repasse.status === 'concluido' ? 'ok' : 'pending'}">
                    ${escapeHtml(repasse.status)} - ${currency(repasse.valor)} - ${escapeHtml(repasse.pix_chave_mascarada)}
                </span>
            `).join('')}
        </div>
    `;
}

async function loadProducts() {
    if (!el.productList) return;
    state.produtos = await api('/api/produtos');
    renderProducts();
}

async function loadWaitlist() {
    if (!el.waitlistAdminList) return;
    const [lista, inteligente] = await Promise.all([
        api('/api/lista-espera?status=aguardando'),
        api('/api/lista-espera/inteligente')
    ]);
    state.listaEspera = lista;
    state.listaEsperaInteligente = inteligente;
    renderWaitlistAdmin();
}

async function loadSmartReturns() {
    if (!el.smartReturnList) return;
    state.retornosInteligentes = await api('/api/clientes/retornos-inteligentes');
    renderSmartReturns();
}

async function resolveReminder(id) {
    try {
        await api(`/api/agendamentos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ lembrete_retorno_concluido: true })
        });
        showToast('Lembrete resolvido.');
        await loadDay();
    } catch (error) {
        showToast(error.message);
    }
}

async function updateStatus(id, status) {
    try {
        const atualizado = await api(`/api/agendamentos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showToast('Agendamento atualizado.');
        await loadDay();
        return atualizado;
    } catch (error) {
        showToast(error.message);
        return null;
    }
}

async function updateStatusAndNotify(agendamento, status) {
    const atualizado = await updateStatus(agendamento.id, status);
    if (!atualizado) return;
    if (status === 'confirmado') {
        await sendWhatsappNotice(atualizado, 'confirmacao');
    }
    if (status === 'cancelado') {
        await sendWhatsappNotice(atualizado, 'cancelamento');
    }
}

async function deleteAppointment(agendamento) {
    const confirma = await confirmAction({
        title: 'Excluir horario',
        message: `Excluir o horario de ${agendamento.cliente_nome} as ${time(agendamento.inicio)}? Essa acao remove o agendamento da agenda.`,
        kicker: 'Agenda',
        acceptText: 'Excluir',
        danger: true
    });
    if (!confirma) return;
    try {
        await api(`/api/agendamentos/${agendamento.id}`, { method: 'DELETE' });
        showToast('Horario excluido.');
        await loadDay();
    } catch (error) {
        showToast(error.message);
    }
}

async function archiveClient(cliente) {
    const confirma = await confirmAction({
        title: 'Excluir cliente',
        message: `Excluir ${cliente.nome} da lista de clientes ativas? Ela sai dos novos agendamentos, mas o historico antigo continua salvo.`,
        kicker: 'Clientes',
        acceptText: 'Excluir',
        danger: true
    });
    if (!confirma) return;
    try {
        await api(`/api/clientes/${cliente.id}`, { method: 'DELETE' });
        showToast('Cliente excluida da lista ativa.');
        await loadBaseData();
        await loadTimes();
    } catch (error) {
        showToast(error.message);
    }
}

function openEdit(agendamento) {
    if (!el.editDialog) return;
    el.editAppointmentId.value = agendamento.id;
    el.editClient.value = agendamento.cliente_id;
    el.editService.value = agendamento.servico_id;
    if (el.editProfessional) el.editProfessional.value = agendamento.profissional_id || '';
    el.editDate.value = dateInputValue(agendamento.inicio);
    el.editTime.value = timeInputValue(agendamento.inicio);
    el.editChargeType.value = agendamento.tipo_cobranca || 'pagar_na_hora';
    el.editPaymentMethod.value = agendamento.metodo_pagamento_preferido || 'pix_manual';
    el.editNotes.value = agendamento.observacoes || '';
    el.editReminderDate.value = agendamento.lembrete_retorno_em || '';
    el.editReminderDays.value = '';
    el.editReminderNotes.value = agendamento.lembrete_retorno_observacoes || '';
    el.editReminderDone.checked = Boolean(agendamento.lembrete_retorno_concluido);
    updateEditPaymentUI();
    el.editDialog.hidden = false;
    document.body.classList.add('modal-open');
}

function closeEditDialog() {
    if (!el.editDialog) return;
    el.editDialog.hidden = true;
    document.body.classList.remove('modal-open');
}

function editBody(extra = {}) {
    return {
        cliente_id: el.editClient.value,
        servico_id: el.editService.value,
        profissional_id: el.editProfessional ? el.editProfessional.value : undefined,
        inicio: `${el.editDate.value}T${el.editTime.value}:00-03:00`,
        tipo_cobranca: el.editChargeType.value,
        metodo_pagamento_preferido: el.editPaymentMethod.value,
        lembrete_retorno_em: el.editReminderDate.value || null,
        lembrete_retorno_observacoes: el.editReminderNotes.value,
        lembrete_retorno_concluido: el.editReminderDone.checked,
        observacoes: el.editNotes.value,
        ...extra
    };
}

async function saveEdit(extra = {}) {
    await api(`/api/agendamentos/${el.editAppointmentId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(editBody(extra))
    });
}

async function handleEditSubmit(event) {
    event.preventDefault();
    try {
        await saveEdit();
        const id = el.editAppointmentId.value;
        closeEditDialog();
        showToast('Horario atualizado.');
        const avisar = await confirmAction({
            title: 'Avisar cliente?',
            message: 'Deseja enviar uma mensagem de reagendamento pelo WhatsApp?',
            kicker: 'WhatsApp',
            acceptText: 'Avisar'
        });
        if (avisar) await sendWhatsappNotice({ id }, 'reagendamento');
        await loadDay();
    } catch (error) {
        if (error.status === 409 && error.details.pode_confirmar_encaixe) {
            const conflito = error.details.conflito;
            const confirma = await confirmAction({
                title: 'Salvar como encaixe?',
                message: `Esse novo horario conflita com ${conflito.cliente_nome} das ${time(conflito.inicio)} as ${time(conflito.fim)}. Deseja salvar como encaixe mesmo assim?`,
                kicker: 'Conflito de horario',
                acceptText: 'Salvar encaixe'
            });
            if (!confirma) return;
            try {
                await saveEdit({
                    permitir_conflito: true,
                    encaixe: true,
                    motivo_encaixe: 'Remarcado como encaixe no painel'
                });
                const id = el.editAppointmentId.value;
                closeEditDialog();
                showToast('Horario remarcado como encaixe.');
                const avisar = await confirmAction({
                    title: 'Avisar cliente?',
                    message: 'Deseja enviar uma mensagem de reagendamento pelo WhatsApp?',
                    kicker: 'WhatsApp',
                    acceptText: 'Avisar'
                });
                if (avisar) await sendWhatsappNotice({ id }, 'reagendamento');
                await loadDay();
            } catch (confirmError) {
                showToast(confirmError.message);
            }
            return;
        }
        showToast(error.message);
    }
}

async function loadDay() {
    const date = el.selectedDate.value;
    const [agendamentos, resumo, lembretes, comissoes] = await Promise.all([
        api(`/api/agendamentos?inicio=${encodeURIComponent(startOfDay(date))}&fim=${encodeURIComponent(nextDayStart(date))}`),
        api(`/api/resumo?data=${date}`),
        api('/api/lembretes/retorno'),
        api(`/api/comissoes?inicio=${encodeURIComponent(startOfDay(date))}&fim=${encodeURIComponent(nextDayStart(date))}`)
    ]);
    state.agendamentos = agendamentos;
    state.resumo = resumo;
    state.lembretes = lembretes;
    state.comissoes = comissoes;
    renderSummary();
    renderAppointments();
    renderAdminHome();
    renderFinance();
    renderNotifications();
    await loadTimes();
}

async function loadBaseData() {
    const [clientes, servicos, profissionais, publico] = await Promise.all([
        api('/api/clientes'),
        api('/api/servicos'),
        api('/api/profissionais'),
        api('/api/publico')
    ]);
    state.clientes = clientes;
    state.servicos = servicos;
    state.profissionais = profissionais;
    state.setup = publico.setup || null;
    applyBusinessInfo(publico.negocio);
    renderSelects();
    renderClientList();
    renderServiceList();
    renderProfessionalList();
    renderSetupChecklist();
    renderTransferDefault();
}

async function refreshAll() {
    try {
        await loadBaseData();
        await loadDay();
        await loadTransfers();
        await loadProducts();
        await loadWaitlist();
        await loadSmartReturns();
    } catch (error) {
        showToast(error.message);
    }
}

async function checkAdminAccess() {
    const status = await api('/api/admin/status');
    state.adminProtegido = status.protegido;
    if (el.adminUserLabel && el.adminUser) {
        el.adminUserLabel.hidden = !status.usuario_obrigatorio;
        el.adminUser.required = Boolean(status.usuario_obrigatorio);
    }
    
    // Restrição visual por tipo de usuário (role)
    if (status.role && status.role !== 'admin') {
        const hideElements = [
            'a[href="#financeiro"]', 'a[href="#produtos"]', 'a[href="#espera"]', 'a[href="#retorno"]',
            '#financeiro', '#produtos', '#espera', '#retorno'
        ];
        hideElements.forEach(selector => {
            const elm = document.querySelector(selector);
            if (elm) elm.style.display = 'none';
        });
    } else {
        const showElements = [
            'a[href="#financeiro"]', 'a[href="#produtos"]', 'a[href="#espera"]', 'a[href="#retorno"]',
            '#financeiro', '#produtos', '#espera', '#retorno'
        ];
        showElements.forEach(selector => {
            const elm = document.querySelector(selector);
            if (elm) elm.style.display = '';
        });
    }

    if (state.adminProtegido && !status.autenticado) {
        showLogin();
        return false;
    }
    hideLogin();
    return true;
}

el.prevDay.addEventListener('click', () => {
    el.selectedDate.value = addDays(el.selectedDate.value, -1);
    loadDay().catch((error) => showToast(error.message));
});

el.nextDay.addEventListener('click', () => {
    el.selectedDate.value = addDays(el.selectedDate.value, 1);
    loadDay().catch((error) => showToast(error.message));
});

el.selectedDate.addEventListener('change', () => loadDay().catch((error) => showToast(error.message)));
el.refreshButton.addEventListener('click', refreshAll);
if (el.homeRefreshButton) {
    el.homeRefreshButton.addEventListener('click', refreshAll);
}
if (el.financeRefreshButton) {
    el.financeRefreshButton.addEventListener('click', refreshAll);
}
if (el.productRefreshButton) {
    el.productRefreshButton.addEventListener('click', () => loadProducts().catch((error) => showToast(error.message)));
}
if (el.waitlistRefreshButton) {
    el.waitlistRefreshButton.addEventListener('click', () => loadWaitlist().catch((error) => showToast(error.message)));
}
if (el.smartReturnRefreshButton) {
    el.smartReturnRefreshButton.addEventListener('click', () => loadSmartReturns().catch((error) => showToast(error.message)));
}

if (el.quickBlockButton) {
    el.quickBlockButton.addEventListener('click', async () => {
        const inicioHora = window.prompt('Horario inicial para bloquear? Ex: 14:00');
        if (!inicioHora) return;
        const fimHora = window.prompt('Horario final? Ex: 15:00');
        if (!fimHora) return;
        const motivo = window.prompt('Motivo do bloqueio?', 'Bloqueio manual pelo painel') || '';
        try {
            await api('/api/bloqueios', {
                method: 'POST',
                body: JSON.stringify({
                    inicio: `${el.selectedDate.value}T${inicioHora}:00-03:00`,
                    fim: `${el.selectedDate.value}T${fimHora}:00-03:00`,
                    motivo
                })
            });
            showToast('Horario bloqueado.');
            await loadDay();
        } catch (error) {
            showToast(error.message);
        }
    });
}

el.appointmentService.addEventListener('change', () => loadTimes().catch((error) => showToast(error.message)));
if (el.appointmentProfessional) {
    el.appointmentProfessional.addEventListener('change', () => loadTimes().catch((error) => showToast(error.message)));
}
el.appointmentCustomTime.addEventListener('input', () => {
    el.appointmentTime.required = !el.appointmentCustomTime.value;
});

function ajustarCobrancaPorMetodo(metodoEl, cobrancaEl) {
    if (!metodoEl || !cobrancaEl) return;
    const metodo = metodoEl.value;
    const online = ['pix_online', 'cartao_online'].includes(metodo);
    if (metodo === 'dinheiro') {
        cobrancaEl.value = 'pagar_na_hora';
        cobrancaEl.disabled = true;
        return;
    }
    cobrancaEl.disabled = false;
    if (online && cobrancaEl.value === 'pagar_na_hora') {
        cobrancaEl.value = 'total';
    }
}

function updateAppointmentPaymentUI() {
    ajustarCobrancaPorMetodo(el.appointmentPaymentMethod, el.appointmentChargeType);
}

function updateEditPaymentUI() {
    ajustarCobrancaPorMetodo(el.editPaymentMethod, el.editChargeType);
}

el.appointmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const baseBody = {
        cliente_id: el.appointmentClient.value,
        servico_id: el.appointmentService.value,
        profissional_id: el.appointmentProfessional ? el.appointmentProfessional.value : undefined,
        inicio: selectedStart(),
        tipo_cobranca: el.appointmentChargeType.value,
        metodo_pagamento_preferido: el.appointmentPaymentMethod.value,
        observacoes: el.appointmentNotes.value
    };
    try {
        await api('/api/agendamentos', {
            method: 'POST',
            body: JSON.stringify(baseBody)
        });
        el.appointmentNotes.value = '';
        el.appointmentCustomTime.value = '';
        el.appointmentTime.required = true;
        showToast('Horario agendado.');
        await loadDay();
    } catch (error) {
        if (error.status === 409 && error.details.pode_confirmar_encaixe) {
            const conflito = error.details.conflito;
            const confirma = await confirmAction({
                title: 'Criar encaixe?',
                message: `Esse horario conflita com ${conflito.cliente_nome} das ${time(conflito.inicio)} as ${time(conflito.fim)}. Tem certeza que deseja encaixar mesmo assim?`,
                kicker: 'Conflito de horario',
                acceptText: 'Criar encaixe'
            });
            if (!confirma) {
                showToast('Encaixe cancelado.');
                return;
            }
            try {
                await api('/api/agendamentos', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...baseBody,
                        permitir_conflito: true,
                        motivo_encaixe: 'Confirmado manualmente no painel'
                    })
                });
                el.appointmentNotes.value = '';
                el.appointmentCustomTime.value = '';
                el.appointmentTime.required = true;
                showToast('Encaixe agendado.');
                await loadDay();
                return;
            } catch (confirmError) {
                showToast(confirmError.message);
                return;
            }
        }
        showToast(error.message);
    }
});

el.clientForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const cliente = await api('/api/clientes', {
            method: 'POST',
            body: JSON.stringify({
                nome: el.clientName.value,
                telefone: el.clientPhone.value,
                email: el.clientEmail.value
            })
        });
        el.clientForm.reset();
        showToast('Cliente salvo.');
        await loadBaseData();
        el.appointmentClient.value = cliente.id;
    } catch (error) {
        showToast(error.message);
    }
});

el.serviceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const editingId = el.serviceForm.dataset.editingId;
    try {
        const servico = await api(editingId ? `/api/servicos/${editingId}` : '/api/servicos', {
            method: editingId ? 'PATCH' : 'POST',
            body: JSON.stringify({
                nome: el.serviceName.value,
                categoria: el.serviceCategory ? el.serviceCategory.value : 'Barbearia',
                descricao: el.serviceDescription ? el.serviceDescription.value : '',
                duracao_minutos: Number(el.serviceDuration.value),
                preco: Number(el.servicePrice.value)
            })
        });
        clearServiceForm();
        showToast(editingId ? 'Servico atualizado.' : 'Servico salvo.');
        await loadBaseData();
        el.appointmentService.value = servico.id;
        await loadTimes();
    } catch (error) {
        showToast(error.message);
    }
});

if (el.productForm) {
    el.productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = el.productForm.dataset.editingId;
        const body = {
            nome: el.productName.value,
            categoria: el.productCategory.value,
            preco_venda: el.productSalePrice.value,
            custo_unitario: el.productCost.value || 0,
            estoque_atual: el.productStock.value || 0,
            estoque_minimo: el.productMinStock.value || 0,
            controla_estoque: true,
            observacoes: el.productNotes.value
        };
        try {
            await api(id ? `/api/produtos/${id}` : '/api/produtos', {
                method: id ? 'PATCH' : 'POST',
                body: JSON.stringify(body)
            });
            clearProductForm();
            showToast('Produto salvo.');
            await loadProducts();
        } catch (error) {
            showToast(error.message);
        }
    });
}

if (el.professionalForm) {
    el.professionalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const editingId = el.professionalForm.dataset.editingId;
        const payload = {
            nome: el.professionalName.value,
            apelido: el.professionalNickname.value || null,
            bio: el.professionalBio.value || null,
            dono: el.professionalOwner.checked,
            comissao_percentual: Number(el.professionalCommission.value),
            ordem: Number(el.professionalOrder.value || 0)
        };
        try {
            const profissional = await api(editingId ? `/api/profissionais/${editingId}` : '/api/profissionais', {
                method: editingId ? 'PATCH' : 'POST',
                body: JSON.stringify(payload)
            });
            clearProfessionalForm();
            showToast(editingId ? 'Barbeiro atualizado.' : 'Barbeiro salvo.');
            await loadBaseData();
            if (profissional && profissional.id && el.appointmentProfessional) {
                el.appointmentProfessional.value = profissional.id;
                await loadTimes();
            }
        } catch (error) {
            showToast(error.message);
        }
    });
}

if (el.businessForm) {
    el.businessForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const negocio = await api('/api/configuracoes/negocio', {
                method: 'PATCH',
                body: JSON.stringify({
                    nome: el.businessName.value,
                    nome_curto: el.businessShortName.value,
                    proprietaria: el.businessOwner.value,
                    inicial: el.businessInitial.value,
                    segmento: el.businessSegment.value,
                    subtitulo: el.businessSubtitle.value,
                    regiao: el.businessRegion.value,
                    frase_agendamento: el.businessBookingText.value,
                    local_titulo: el.businessLocationTitle.value,
                    local_descricao: el.businessLocationDescription.value
                })
            });
            applyBusinessInfo(negocio);
            showToast('Configuracao do negocio salva.');
        } catch (error) {
            showToast(error.message);
        }
    });
}

if (el.transferForm) {
    el.transferForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valor = Number(el.transferAmount.value);
        const destino = state.setup && state.setup.repasse_destino_padrao;
        if (!Number.isFinite(valor) || valor <= 0) {
            showToast('Informe um valor valido para repasse.');
            return;
        }
        if (!destino || !destino.configurado) {
            showToast('Configure a chave Pix padrao de repasse no ambiente.');
            return;
        }
        if (el.transferConfirmation.value !== 'REPASSAR') {
            showToast('Digite REPASSAR para confirmar.');
            return;
        }
        const ok = await confirmAction({
            title: 'Enviar repasse?',
            message: `Enviar ${currency(valor)} para a chave Pix padrao configurada (${destino.pix_chave_mascarada})? Essa acao movimenta dinheiro real no Asaas.`,
            kicker: 'Dinheiro real',
            acceptText: 'Enviar repasse',
            danger: true
        });
        if (!ok) return;
        try {
            await api('/api/repasses/asaas', {
                method: 'POST',
                body: JSON.stringify({
                    valor,
                    usar_destino_padrao: true,
                    descricao: el.transferDescription.value,
                    confirmacao: el.transferConfirmation.value
                })
            });
            el.transferForm.reset();
            el.transferDescription.value = `Repasse ${state.business.nome}`;
            showToast('Repasse solicitado no Asaas.');
            await loadTransfers();
        } catch (error) {
            showToast(error.message);
            await loadTransfers().catch(() => {});
        }
    });
}

if (el.adminLoginForm) {
    el.adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await api('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({
                    usuario: el.adminUser ? el.adminUser.value.trim() : '',
                    token: el.adminToken.value
                })
            });
            if (el.adminUser) el.adminUser.value = '';
            el.adminToken.value = '';
            await checkAdminAccess(); // Atualiza a UI de acordo com a role do usuario
            await refreshAll();
            showToast('Acesso liberado.');
        } catch (error) {
            showLogin();
            showToast(error.message);
        }
    });
}

if (el.logoutButton) {
    el.logoutButton.addEventListener('click', async () => {
        try {
            await api('/api/admin/logout', { method: 'POST' });
            window.location.reload();
        } catch (error) {
            showToast(error.message);
        }
    });
}

if (el.editForm) {
    el.editForm.addEventListener('submit', handleEditSubmit);
}

if (el.appointmentPaymentMethod) {
    el.appointmentPaymentMethod.addEventListener('change', updateAppointmentPaymentUI);
    updateAppointmentPaymentUI();
}

if (el.editPaymentMethod) {
    el.editPaymentMethod.addEventListener('change', updateEditPaymentUI);
}

if (el.closeEdit) {
    el.closeEdit.addEventListener('click', closeEditDialog);
}

if (el.editDialog) {
    el.editDialog.addEventListener('click', (event) => {
        if (event.target === el.editDialog) closeEditDialog();
    });
}

if (el.editReminderDays) {
    el.editReminderDays.addEventListener('input', () => {
        const days = Number(el.editReminderDays.value);
        if (!Number.isInteger(days) || days < 1 || !el.editDate.value) return;
        el.editReminderDate.value = addDaysFromDate(`${el.editDate.value}T12:00:00`, days);
        el.editReminderDone.checked = false;
    });
}

if (el.notificationButton && el.notificationPanel) {
    el.notificationButton.addEventListener('click', () => {
        const willOpen = el.notificationPanel.hidden;
        el.notificationPanel.hidden = !willOpen;
        el.notificationButton.setAttribute('aria-expanded', String(willOpen));
    });
    document.addEventListener('click', (event) => {
        if (
            !el.notificationPanel.hidden
            && !el.notificationPanel.contains(event.target)
            && !el.notificationButton.contains(event.target)
        ) {
            el.notificationPanel.hidden = true;
            el.notificationButton.setAttribute('aria-expanded', 'false');
        }
    });
}

el.selectedDate.value = today();
checkAdminAccess().then((ok) => {
    if (ok) refreshAll();
}).catch((error) => showToast(error.message));
