'use strict';

const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';
const action = window.location.pathname.split('/').filter(Boolean).pop();

// Estado do reagendamento
let agendamentoAtual = null;
let selectedSlot = null;

// Referências de DOM
const el = {
    kicker:            document.getElementById('actionKicker'),
    title:             document.getElementById('actionTitle'),
    message:           document.getElementById('actionMessage'),
    successIcon:       document.getElementById('successIcon'),
    summary:           document.getElementById('appointmentSummary'),
    cancelForm:        document.getElementById('cancelForm'),
    cancelReason:      document.getElementById('cancelReason'),
    rescheduleSection: document.getElementById('rescheduleSection'),
    rescheduleDate:    document.getElementById('rescheduleDate'),
    slotsLoading:      document.getElementById('slotsLoading'),
    slotsGrid:         document.getElementById('slotsGrid'),
    slotsEmpty:        document.getElementById('slotsEmpty'),
    slotsTitle:        document.getElementById('slotsTitle'),
    primary:           document.getElementById('primaryAction'),
    toast:             document.getElementById('toast'),
};

// ---- Utilitários ----

function showToast(message, isError = false) {
    el.toast.textContent = message;
    el.toast.classList.toggle('error', isError);
    el.toast.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.toast.classList.remove('visible'), 3500);
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.erro || 'Nao foi possivel concluir.');
    return data;
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long',
        timeZone: 'America/Sao_Paulo'
    });
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    });
}

function capitalize(str) {
    return String(str || '').replace(/^\w/, (c) => c.toUpperCase());
}

function minDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
}

function tomorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

// ---- Renderização ----

function badgeClass(status) {
    if (!status) return '';
    if (['confirmado', 'concluido'].includes(status)) return 'confirmado';
    if (status === 'agendado') return 'agendado';
    if (['cancelado', 'faltou'].includes(status)) return 'cancelado';
    return '';
}

function renderSummary(agendamento) {
    const { data, hora } = { data: formatDate(agendamento.inicio), hora: formatTime(agendamento.inicio) };
    el.summary.hidden = false;
    el.summary.innerHTML = `
        <div class="summary-row">
            <span class="summary-icon">✂️</span>
            <div class="summary-detail">
                <span class="summary-label">Servico</span>
                <span class="summary-value">${agendamento.servico_nome || '–'}</span>
            </div>
        </div>
        <div class="summary-row">
            <span class="summary-icon">🧑‍🦱</span>
            <div class="summary-detail">
                <span class="summary-label">Barbeiro</span>
                <span class="summary-value">${agendamento.profissional_nome || 'A definir'}</span>
            </div>
        </div>
        <div class="summary-row">
            <span class="summary-icon">📅</span>
            <div class="summary-detail">
                <span class="summary-label">Data e horario</span>
                <span class="summary-value">${capitalize(data)} às ${hora}</span>
            </div>
        </div>
        <div class="summary-row">
            <span class="summary-icon">⚡</span>
            <div class="summary-detail">
                <span class="summary-label">Status</span>
                <span class="status-badge ${badgeClass(agendamento.status)}">${agendamento.status || '–'}</span>
            </div>
        </div>
    `;
}

// ---- Horários disponíveis ----

async function carregarHorarios() {
    if (!agendamentoAtual) return;
    const data = el.rescheduleDate.value;
    if (!data) return;

    selectedSlot = null;
    el.slotsGrid.innerHTML = '';
    el.slotsEmpty.hidden = true;
    el.slotsLoading.hidden = false;
    el.primary.disabled = true;

    try {
        const result = await api(
            `/api/disponibilidade/horarios?data=${data}&profissional_id=${agendamentoAtual.profissional_id || ''}`
        );

        // Coletar slots únicos com pelo menos um serviço disponível
        const slotsUnicos = [];
        const vistos = new Set();
        for (const slot of (result || [])) {
            const key = new Date(slot.inicio).toISOString();
            if (!vistos.has(key) && slot.servicos && slot.servicos.length > 0) {
                vistos.add(key);
                slotsUnicos.push(slot);
            }
        }

        el.slotsLoading.hidden = true;

        if (!slotsUnicos.length) {
            el.slotsEmpty.hidden = false;
            return;
        }

        el.slotsGrid.innerHTML = '';
        for (const slot of slotsUnicos) {
            const hora = formatTime(slot.inicio);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.textContent = hora;
            btn.dataset.inicio = slot.inicio;
            btn.addEventListener('click', () => {
                selectedSlot = slot.inicio;
                el.slotsGrid.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                el.primary.disabled = false;
            });
            el.slotsGrid.appendChild(btn);
        }
    } catch {
        el.slotsLoading.hidden = true;
        el.slotsEmpty.textContent = 'Erro ao buscar horarios. Tente outra data.';
        el.slotsEmpty.hidden = false;
    }
}

// ---- Setup por ação ----

function setupAction(currentAction) {
    const configs = {
        confirmar: {
            kicker: 'Confirmar horario',
            title: 'Confirme seu atendimento',
            btnText: 'Confirmar horario',
            btnClass: ''
        },
        cancelar: {
            kicker: 'Cancelar horario',
            title: 'Cancelar atendimento',
            btnText: 'Cancelar horario',
            btnClass: 'danger'
        },
        reagendar: {
            kicker: 'Reagendar horario',
            title: 'Escolha nova data e horario',
            btnText: 'Pedir reagendamento',
            btnClass: ''
        }
    };

    const cfg = configs[currentAction] || configs.confirmar;
    el.kicker.textContent = cfg.kicker;
    el.title.textContent = cfg.title;
    el.primary.textContent = cfg.btnText;
    el.primary.className = `btn btn-primary ${cfg.btnClass}`.trim();
    el.primary.hidden = false;
    el.primary.disabled = false;

    el.cancelForm.hidden = (currentAction !== 'cancelar');
    el.rescheduleSection.hidden = (currentAction !== 'reagendar');

    if (currentAction === 'reagendar') {
        const min = minDate();
        const amanha = tomorrowDate();
        el.rescheduleDate.min = min;
        el.rescheduleDate.value = amanha;
        el.primary.disabled = true; // desativa até selecionar horário
        carregarHorarios();
        el.rescheduleDate.addEventListener('change', carregarHorarios);
    }
}

// ---- Carregar dados ----

async function load() {
    if (!token) throw new Error('Link sem token de seguranca. Verifique o link recebido pelo WhatsApp.');
    const data = await api(`/api/publico/acoes/agendamento?token=${encodeURIComponent(token)}`);
    agendamentoAtual = data.agendamento;
    setupAction(data.action);
    renderSummary(agendamentoAtual);
    el.message.textContent = 'Confira os dados abaixo antes de continuar.';
}

// ---- Submeter ação ----

async function submitAction() {
    const body = { token };
    const endpoint = `/api/publico/acoes/agendamento/${action}`;

    if (action === 'cancelar') {
        body.motivo = el.cancelReason.value.trim();
    }

    if (action === 'reagendar') {
        if (!selectedSlot) {
            showToast('Selecione um horario disponivel.', true);
            return;
        }
        body.inicio = selectedSlot;
    }

    el.primary.disabled = true;
    const originalText = el.primary.textContent;
    el.primary.textContent = 'Aguarde...';

    try {
        const result = await api(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        // Estado de sucesso
        const msgs = {
            confirmar: { icon: '✅', title: 'Horario confirmado!', msg: result.message || 'Tudo certo. Te esperamos!' },
            cancelar:  { icon: '🗑️', title: 'Horario cancelado.', msg: result.message || 'Seu horario foi cancelado.' },
            reagendar: { icon: '📆', title: 'Pedido enviado!', msg: result.message || 'O reagendamento precisa de aprovacao. Avisamos em breve.' }
        };
        const feedback = msgs[action] || msgs.confirmar;

        el.successIcon.textContent = feedback.icon;
        el.successIcon.hidden = false;
        el.kicker.textContent = 'Tudo certo';
        el.title.textContent = feedback.title;
        el.message.textContent = feedback.msg;
        el.message.style.color = '#f0ece4';
        el.cancelForm.hidden = true;
        el.rescheduleSection.hidden = true;
        el.primary.hidden = true;
        if (result.agendamento) renderSummary(result.agendamento);
    } catch (error) {
        showToast(error.message, true);
        el.primary.disabled = false;
        el.primary.textContent = originalText;
    }
}

// ---- Inicializar ----

el.primary.addEventListener('click', submitAction);

load().catch((error) => {
    el.kicker.textContent = 'Link indisponivel';
    el.title.textContent = 'Nao conseguimos abrir este link';
    el.message.textContent = error.message;
    el.primary.hidden = true;
});
