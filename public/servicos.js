const state = {
    whatsapp: null,
    business: {
        nome: 'Agenda de Servicos',
        nome_curto: 'Agenda',
        proprietaria: 'Equipe',
        inicial: 'A',
        segmento: 'Atendimento com hora marcada',
        regiao: 'Informe sua regiao',
        frase_agendamento: 'Veja horarios disponiveis e escolha entre os servicos que cabem na agenda.',
        local_titulo: 'Atendimento com local combinado',
        local_descricao: 'Endereco ou forma de atendimento combinados apos a confirmacao.'
    },
    servicos: [],
    profissionais: [],
    demo: false,
    selectedServiceId: '',
    selectedSlot: null,
    setup: {
        whatsapp_configurado: false,
        pagamento_online_configurado: false,
        public_base_url_configurada: false,
        public_base_url_https: false,
        pix_disponivel: false
    }
};

const demoBusiness = {
    nome: 'Studio Mazoni Barber',
    nome_curto: 'Mazoni Barber',
    proprietaria: 'Admin',
    inicial: 'M',
    segmento: 'Barbearia premium',
    regiao: 'Santa Tereza, Rio Grande do Sul',
    frase_agendamento: 'Escolha Deryck, Leo Mazoni ou Gustavo e veja os horarios livres em tempo real.',
    local_titulo: 'Rua Abelardo Marques 180',
    local_descricao: 'Santa Tereza, Rio Grande do Sul. Segunda 13:30-20:00, terca a sabado 09:00-20:00.'
};

const demoProfessionals = [
    {
        id: 1,
        nome: 'Deryck',
        apelido: 'Deryck',
        foto_url: 'https://cdn-partners-api.fresha.com/employee-avatars/processed/297929/medium/a405200d-8c39-4177-9bf3-19a10e2abe89-WhatsApp%20Image%202026-02-25%20at%2010.34.35%20%281%29.jpeg'
    },
    {
        id: 2,
        nome: 'Leo Mazoni',
        apelido: 'Leo',
        foto_url: 'https://cdn-partners-api.fresha.com/employee-avatars/processed/162894/medium/9fc0ae94-9870-40bc-9b13-14048b346d1c-74A1D6C4-8C27-4D18-9682-16235AA3563A.png'
    },
    {
        id: 3,
        nome: 'Gustavo',
        apelido: 'Gustavo',
        foto_url: 'https://cdn-partners-api.fresha.com/employee-avatars/processed/162904/medium/bf013f84-c756-4f58-a966-ac19cffd41d3-Fot%20gu.jpeg'
    }
];

const demoServices = [
    { id: 1, nome: 'Corte degrade', descricao: 'Corte degrade com acabamento alinhado ao estilo do cliente.', categoria: 'Hair', duracao_minutos: 30, preco: 35 },
    { id: 2, nome: 'Corte e Barba', descricao: 'Combo classico com corte, barba e finalizacao.', categoria: 'Combo', duracao_minutos: 60, preco: 55 },
    { id: 3, nome: 'Combo', descricao: 'Combo completo do Studio Mazoni Barber para renovar o visual.', categoria: 'Combo', duracao_minutos: 65, preco: 65 },
    { id: 4, nome: 'Sobrancelha', descricao: 'Acabamento rapido para alinhar a expressao.', categoria: 'Detalhes', duracao_minutos: 5, preco: 10 },
    { id: 5, nome: 'Barba', descricao: 'Modelagem e acabamento de barba.', categoria: 'Barba', duracao_minutos: 30, preco: 25 },
    { id: 6, nome: 'Limpeza de pele', descricao: 'Cuidado facial para complementar o atendimento.', categoria: 'Limpeza de pele', duracao_minutos: 30, preco: 40 }
];

const el = {
    services: document.querySelector('#publicServices'),
    heroWhatsapp: document.querySelector('#heroWhatsapp'),
    bottomWhatsapp: document.querySelector('#bottomWhatsapp'),
    availabilityForm: document.querySelector('#availabilityForm'),
    availabilityDate: document.querySelector('#availabilityDate'),
    dateSlider: document.querySelector('#dateSlider'),
    availabilityProfessional: document.querySelector('#availabilityProfessional'),
    availabilityGrid: document.querySelector('#availabilityGrid'),
    servicePicker: document.querySelector('#servicePicker'),
    professionalPicker: document.querySelector('#professionalPicker'),
    publicSetupNotice: document.querySelector('#publicSetupNotice'),
    bookingPanel: document.querySelector('#bookingPanel'),
    bookingSummary: document.querySelector('#bookingSummary'),
    bookingForm: document.querySelector('#bookingForm'),
    bookingService: document.querySelector('#bookingService'),
    bookingName: document.querySelector('#bookingName'),
    bookingPhone: document.querySelector('#bookingPhone'),
    bookingEmailLabel: document.querySelector('#bookingEmailLabel'),
    bookingEmailLabelText: document.querySelector('#bookingEmailLabelText'),
    bookingEmail: document.querySelector('#bookingEmail'),
    bookingDocumentLabel: document.querySelector('#bookingDocumentLabel'),
    bookingDocument: document.querySelector('#bookingDocument'),
    bookingPaymentMethod: document.querySelector('#bookingPaymentMethod'),
    bookingChargeType: document.querySelector('#bookingChargeType'),
    bookingNotes: document.querySelector('#bookingNotes'),
    bookingWhatsapp: document.querySelector('#bookingWhatsapp'),
    bookingSetupHint: document.querySelector('#bookingSetupHint'),
    paymentResult: document.querySelector('#paymentResult'),
    waitlistForm: document.querySelector('#waitlistForm'),
    waitlistName: document.querySelector('#waitlistName'),
    waitlistPhone: document.querySelector('#waitlistPhone'),
    waitlistPeriod: document.querySelector('#waitlistPeriod'),
    waitlistNotes: document.querySelector('#waitlistNotes'),
    waitlistSubmit: document.querySelector('#waitlistSubmit'),
    heroBookingText: document.querySelector('#heroBookingText'),
    locationBadge: document.querySelector('.location-badge'),
    locationTitle: document.querySelector('#locationTitle'),
    locationDescription: document.querySelector('#locationDescription'),
    toast: document.querySelector('#toast')
};

function today() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
}

function addDays(dateValue, days) {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setDate(date.getDate() + days);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
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

function dateLong(value) {
    return new Date(value).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function demoSlots(data, profissional) {
    const ocupados = {
        1: new Set(['10:30', '18:30']),
        2: new Set(['09:30', '15:30']),
        3: new Set(['11:00', '17:00'])
    }[Number(profissional.id)] || new Set();
    return ['09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '15:30', '17:00', '18:30', '19:00']
        .filter((hora) => !ocupados.has(hora))
        .map((hora) => ({
            inicio: `${data}T${hora}:00-03:00`,
            disponivel: true,
            servicos: state.servicos,
            profissional_id: profissional.id,
            profissional_nome: profissional.nome,
            profissional_apelido: profissional.apelido || profissional.nome
        }));
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

function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('visible');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => el.toast.classList.remove('visible'), 3200);
}

function applyBusinessInfo(negocio = {}) {
    state.business = { ...state.business, ...(negocio || {}) };
    document.title = state.business.nome;
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', state.business.nome_curto || state.business.nome);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', state.business.nome);
    document.querySelector('meta[name="description"]')?.setAttribute('content', state.business.subtitulo || state.business.nome);
    document.querySelectorAll('.brand-name').forEach((node) => { node.textContent = state.business.nome; });
    document.querySelectorAll('.brand-mark').forEach((node) => { node.textContent = state.business.inicial || 'A'; });
    document.querySelector('.public-brand')?.setAttribute('aria-label', state.business.nome);
    if (el.locationBadge) el.locationBadge.textContent = state.business.regiao || '';
    if (el.heroBookingText) el.heroBookingText.textContent = state.business.frase_agendamento || '';
    if (el.locationTitle) el.locationTitle.textContent = state.business.local_titulo || '';
    if (el.locationDescription) el.locationDescription.textContent = state.business.local_descricao || '';
}

async function copyText(text, sourceElement = null) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Safari/mobile can reject Clipboard API even after a tap.
        }
    }
    if (sourceElement) {
        sourceElement.focus();
        sourceElement.select();
        sourceElement.setSelectionRange(0, sourceElement.value.length);
        try {
            return document.execCommand('copy');
        } catch (error) {
            return false;
        }
    }
    return false;
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.erro || 'Nao foi possivel carregar.');
    return data;
}

function whatsappUrl(servico = null, horario = null, cliente = null) {
    const horarioTexto = horario ? ` no dia ${dateLong(horario)} as ${time(horario)}` : '';
    const clienteTexto = cliente ? `\nNome: ${cliente.nome}\nTelefone: ${cliente.telefone}` : '';
    const nomeAtendente = state.business.proprietaria || state.business.nome;
    const profissional = selectedProfessional();
    const profissionalTexto = profissional ? ` com ${profissional.apelido || profissional.nome}` : '';
    const message = servico
        ? `Oi, ${nomeAtendente}! Vim pelo site e quero marcar ${servico.nome}${profissionalTexto}${horarioTexto}. Pode confirmar disponibilidade?${clienteTexto}`
        : `Oi, ${nomeAtendente}! Vim pelo site e quero marcar um horario.`;
    if (!state.whatsapp) return null;
    return `https://wa.me/${state.whatsapp}?text=${encodeURIComponent(message)}`;
}

function option(value, label) {
    const node = document.createElement('option');
    node.value = value;
    node.textContent = label;
    return node;
}

function selectedProfessional() {
    if (!el.availabilityProfessional) return null;
    if (el.availabilityProfessional.value === 'any') return null;
    return state.profissionais.find((profissional) => String(profissional.id) === String(el.availabilityProfessional.value)) || null;
}

function renderProfessionals() {
    if (!el.availabilityProfessional) return;
    el.availabilityProfessional.replaceChildren(
        option('any', 'Qualquer barbeiro disponivel'),
        ...state.profissionais.map((profissional) => option(profissional.id, profissional.apelido || profissional.nome))
    );
    el.availabilityProfessional.value = 'any';
    renderProfessionalPicker();
}

function professionalInitial(profissional) {
    return String((profissional && (profissional.apelido || profissional.nome)) || '?').trim().slice(0, 1).toUpperCase();
}

function professionalPhoto(profissional) {
    if (profissional && (profissional.foto_url || profissional.fotoUrl)) {
        return `<img src="${escapeHtml(profissional.foto_url || profissional.fotoUrl)}" alt="${escapeHtml(profissional.apelido || profissional.nome)}">`;
    }
    
    // Fallback images based on the professional name to avoid showing just letters
    const nome = (profissional && (profissional.apelido || profissional.nome) || '').toLowerCase();
    let fallbackFoto = 'logo.jpeg'; // default fallback
    
    if (nome.includes('deryck')) {
        fallbackFoto = 'https://cdn-partners-api.fresha.com/employee-avatars/processed/297929/medium/a405200d-8c39-4177-9bf3-19a10e2abe89-WhatsApp%20Image%202026-02-25%20at%2010.34.35%20%281%29.jpeg';
    } else if (nome.includes('leo')) {
        fallbackFoto = 'https://cdn-partners-api.fresha.com/employee-avatars/processed/162894/medium/9fc0ae94-9870-40bc-9b13-14048b346d1c-74A1D6C4-8C27-4D18-9682-16235AA3563A.png';
    } else if (nome.includes('gustavo') || nome.includes('gu')) {
        fallbackFoto = 'https://cdn-partners-api.fresha.com/employee-avatars/processed/162904/medium/bf013f84-c756-4f58-a966-ac19cffd41d3-Fot%20gu.jpeg';
    }
    
    return `<img src="${fallbackFoto}" alt="${escapeHtml(profissional.apelido || profissional.nome)}">`;
}

function renderProfessionalPicker() {
    if (!el.professionalPicker) return;
    const choices = [
        { id: 'any', apelido: 'Qualquer', nome: 'Qualquer barbeiro disponivel', descricao: 'Mostramos a primeira vaga real entre todos.' },
        ...state.profissionais
    ];
    el.professionalPicker.replaceChildren(...choices.map((profissional) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = String(el.availabilityProfessional.value) === String(profissional.id) ? 'professional-card-public active' : 'professional-card-public';
        button.innerHTML = `
            <div class="professional-photo-public">${professionalPhoto(profissional)}</div>
            <div>
                <strong>${escapeHtml(profissional.apelido || profissional.nome)}</strong>
                <span>${escapeHtml(profissional.descricao || profissional.nome || 'Agenda disponivel')}</span>
            </div>
        `;
        button.addEventListener('click', () => {
            el.availabilityProfessional.value = profissional.id;
            state.selectedSlot = null;
            el.bookingPanel.hidden = true;
            renderProfessionalPicker();
            loadAvailability().catch((error) => showToast(error.message));
        });
        return button;
    }));
}

function metodoLabel(value) {
    return ({
        pix_online: 'Pix online',
        cartao_online: 'Cartao online',
        pix_manual: 'Pix manual na hora',
        dinheiro: 'Dinheiro na hora'
    })[value] || value;
}

function renderHeroAction() {
    el.heroWhatsapp.href = '#agendamento';
    el.heroWhatsapp.textContent = 'Agendar agora';
    el.heroWhatsapp.removeAttribute('target');
    el.heroWhatsapp.removeAttribute('rel');
    if (el.bottomWhatsapp) {
        el.bottomWhatsapp.href = '#agendamento';
        el.bottomWhatsapp.textContent = 'Agendar agora';
        el.bottomWhatsapp.removeAttribute('target');
        el.bottomWhatsapp.removeAttribute('rel');
    }
}

function metodoOnline() {
    return ['pix_online', 'cartao_online'].includes(el.bookingPaymentMethod.value);
}

function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function fieldErrorElement(input) {
    return input && document.querySelector(`[data-error-for="${input.id}"]`);
}

function setFieldError(input, message = '') {
    if (!input) return;
    input.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const error = fieldErrorElement(input);
    if (error) error.textContent = message;
}

function clearBookingErrors() {
    [el.bookingName, el.bookingPhone, el.bookingEmail, el.bookingDocument, el.bookingService]
        .forEach((input) => setFieldError(input, ''));
}

function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function validateBookingForm() {
    clearBookingErrors();
    const errors = [];
    const online = metodoOnline();
    const name = el.bookingName.value.trim();
    const phoneDigits = onlyDigits(el.bookingPhone.value);
    const email = el.bookingEmail.value.trim();
    const documentDigits = onlyDigits(el.bookingDocument.value);

    if (!state.selectedSlot) errors.push({ input: null, message: 'Escolha um horario livre antes de reservar.' });
    if (!el.bookingService.value) errors.push({ input: el.bookingService, message: 'Escolha o servico deste horario.' });
    if (name.length < 2) errors.push({ input: el.bookingName, message: 'Informe o nome da cliente.' });
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        errors.push({ input: el.bookingPhone, message: 'Informe um WhatsApp com DDD.' });
    }
    if (online && !validEmail(email)) {
        errors.push({ input: el.bookingEmail, message: 'Informe um email valido para o pagamento.' });
    }
    if (online && ![11, 14].includes(documentDigits.length)) {
        errors.push({ input: el.bookingDocument, message: 'Informe CPF com 11 digitos ou CNPJ com 14 digitos.' });
    }

    errors.forEach((error) => {
        if (error.input) setFieldError(error.input, error.message);
    });
    if (!errors.length) return true;

    const firstInput = errors.find((error) => error.input);
    showToast(errors[0].message);
    if (firstInput) {
        firstInput.input.focus({ preventScroll: true });
        firstInput.input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
}

function pagamentoOnlineConfigurado() {
    return Boolean(state.setup.pagamento_online_configurado);
}

function updateBookingModeUI() {
    if (!el.bookingForm) return;
    const metodo = el.bookingPaymentMethod.value;
    const submitButton = el.bookingForm.querySelector('button[type="submit"]');
    const online = metodoOnline();
    el.bookingEmail.required = online;
    if (el.bookingDocument) el.bookingDocument.required = online;
    if (el.bookingEmailLabelText) {
        el.bookingEmailLabelText.textContent = online ? 'Email para pagamento online' : 'Email (opcional)';
    }
    if (el.bookingDocumentLabel) {
        el.bookingDocumentLabel.hidden = !online;
    }
    if (!online) {
        setFieldError(el.bookingEmail, '');
        setFieldError(el.bookingDocument, '');
        if (el.bookingDocument) el.bookingDocument.value = '';
    }
    el.bookingChargeType.value = online ? 'total' : 'pagar_na_hora';
    el.bookingChargeType.disabled = true;
    submitButton.textContent = ({
        pix_online: 'Gerar QR Pix',
        cartao_online: 'Abrir pagamento com cartao',
        pix_manual: 'Reservar horario',
        dinheiro: 'Reservar horario'
    })[metodo] || 'Reservar horario';
    submitButton.disabled = online && !pagamentoOnlineConfigurado();
    el.bookingWhatsapp.disabled = !state.whatsapp;

    const avisos = [];
    if (online && !pagamentoOnlineConfigurado()) {
        avisos.push('Pagamento online ainda nao configurado.');
    }
    if (!state.whatsapp) {
        avisos.push(`WhatsApp sera liberado quando o numero de ${state.business.nome} entrar no .env.`);
    }
    el.bookingSetupHint.hidden = !avisos.length;
    el.bookingSetupHint.textContent = avisos.join(' ');
}

function renderSetupNotice() {
    const pendencias = [];
    if (!state.setup.whatsapp_configurado) pendencias.push('WhatsApp');
    if (!pagamentoOnlineConfigurado()) pendencias.push('pagamento online');
    if (!pendencias.length) {
        el.publicSetupNotice.hidden = true;
        return;
    }
    el.publicSetupNotice.hidden = false;
    el.publicSetupNotice.textContent = `Integracoes em configuracao: ${pendencias.join(' e ')}. O agendamento manual segue funcionando.`;
}

function serviceCard(servico) {
    const article = document.createElement('article');
    article.className = 'service-card';
    article.innerHTML = `
        <div class="service-meta">
            <span>${escapeHtml(servico.categoria || 'Barbearia')}</span>
            <strong>${durationLabel(servico.duracao_minutos)}</strong>
        </div>
        <h3>${escapeHtml(servico.nome)}</h3>
        <p>${escapeHtml(servico.descricao || 'Servico com atendimento personalizado.')}</p>
        <div class="service-bottom">
            <strong>${currency(servico.preco)}</strong>
            <button class="secondary-button service-button" type="button">Escolher</button>
        </div>
    `;
    article.querySelector('button').addEventListener('click', () => {
        selectService(servico.id);
        document.querySelector('#agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return article;
}

function renderServices() {
    if (!state.servicos.length) {
        el.services.innerHTML = '<div class="empty-state">Nenhum servico ativo cadastrado.</div>';
        return;
    }
    el.services.replaceChildren(...state.servicos.map(serviceCard));
}

function selectedService() {
    return state.servicos.find((servico) => String(servico.id) === String(state.selectedServiceId)) || state.servicos[0] || null;
}

function selectService(servicoId) {
    state.selectedServiceId = String(servicoId || '');
    state.selectedSlot = null;
    el.bookingPanel.hidden = true;
    renderServicePicker();
    loadAvailability().catch((error) => showToast(error.message));
}

function renderServicePicker() {
    if (!el.servicePicker) return;
    if (!state.servicos.length) {
        el.servicePicker.innerHTML = '<div class="empty-state compact-empty">Nenhum servico ativo cadastrado.</div>';
        return;
    }
    if (!state.selectedServiceId) state.selectedServiceId = String(state.servicos[0].id);
    el.servicePicker.replaceChildren(...state.servicos.map((servico) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = String(state.selectedServiceId) === String(servico.id) ? 'service-choice active' : 'service-choice';
        button.innerHTML = `
            <span>${escapeHtml(servico.categoria || 'Servico')}</span>
            <strong>${escapeHtml(servico.nome)}</strong>
            <small>${durationLabel(servico.duracao_minutos)} - ${currency(servico.preco)}</small>
        `;
        button.addEventListener('click', () => selectService(servico.id));
        return button;
    }));
}

function selectedBookingService() {
    if (!state.selectedSlot || !el.bookingService) return null;
    return (state.selectedSlot.servicos || [])
        .find((servico) => String(servico.id) === String(el.bookingService.value)) || null;
}

function serviceOptionLabel(servico) {
    return `${servico.nome} - ${durationLabel(servico.duracao_minutos)} - ${currency(servico.preco)}`;
}

function slotServicesLabel(slot) {
    const count = (slot.servicos || []).length;
    if (count === 1) return '1 servico';
    return `${count} servicos`;
}

function renderBookingServices(slot) {
    el.bookingService.replaceChildren(
        ...slot.servicos.map((servico) => option(servico.id, serviceOptionLabel(servico)))
    );
    if (slot.servicos.length) el.bookingService.value = slot.servicos[0].id;
}

function updateBookingSummary() {
    if (!state.selectedSlot) {
        el.bookingSummary.textContent = 'Escolha um horario livre.';
        return;
    }
    const servico = selectedBookingService();
    const profissionalNome = state.selectedSlot.profissional_nome || (selectedProfessional() || {}).apelido || 'barbeiro';
    el.bookingSummary.textContent = servico
        ? `${servico.nome} com ${profissionalNome} em ${dateLong(state.selectedSlot.inicio)} as ${time(state.selectedSlot.inicio)}.`
        : `Horario em ${dateLong(state.selectedSlot.inicio)} as ${time(state.selectedSlot.inicio)}.`;
}

function selectSlot(slot) {
    state.selectedSlot = slot;
    renderBookingServices(slot);
    updateBookingSummary();
    el.bookingPanel.hidden = false;
    el.paymentResult.hidden = true;
    el.paymentResult.replaceChildren();
    updateBookingModeUI();
    el.bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAvailability(slots, { preserveBooking = false } = {}) {
    if (!preserveBooking) {
        state.selectedSlot = null;
        el.bookingPanel.hidden = true;
    }
    const availableSlots = slots.filter((slot) => slot.disponivel);
    if (!availableSlots.length) {
        const service = selectedService();
        el.availabilityGrid.innerHTML = `
            <div class="empty-state premium-empty compact-empty">
                <strong>Nenhum horario livre para ${escapeHtml(service ? service.nome : 'este servico')}</strong>
                <span>Tente outro barbeiro, escolha outra data ou entre na lista de espera.</span>
            </div>
        `;
        renderWaitlist(true);
        return;
    }
    renderWaitlist(false);
    el.availabilityGrid.replaceChildren(...availableSlots.map((slot) => {
        const item = document.createElement('button');
        item.className = 'availability-slot available';
        item.type = 'button';
        item.addEventListener('click', () => selectSlot(slot));
        item.setAttribute('aria-label', `Reservar horario das ${time(slot.inicio)}`);
        item.innerHTML = `
            <strong>${time(slot.inicio)}</strong>
            <small>${escapeHtml(slot.profissional_apelido || slot.profissional_nome || slotServicesLabel(slot))}</small>
        `;
        return item;
    }));
}

async function loadAvailability(options = {}) {
    if (!el.availabilityDate.value) {
        renderWaitlist(false);
        el.availabilityGrid.innerHTML = '<div class="empty-state compact-empty">Escolha a data para ver horarios.</div>';
        return [];
    }
    const service = selectedService();
    if (!service) {
        renderWaitlist(false);
        el.availabilityGrid.innerHTML = '<div class="empty-state compact-empty">Escolha um servico para ver horarios.</div>';
        return [];
    }
    if (!el.availabilityProfessional.value) {
        renderWaitlist(false);
        el.availabilityGrid.innerHTML = '<div class="empty-state compact-empty">Escolha um barbeiro para ver a agenda.</div>';
        return [];
    }
    const selectedProfessionalId = el.availabilityProfessional.value;
    const professionals = selectedProfessionalId === 'any'
        ? state.profissionais
        : state.profissionais.filter((profissional) => String(profissional.id) === String(selectedProfessionalId));
    const results = state.demo
        ? professionals.map((profissional) => demoSlots(el.availabilityDate.value, profissional))
        : await Promise.all(professionals.map(async (profissional) => {
            const slots = await api(`/api/disponibilidade/horarios?data=${el.availabilityDate.value}&profissional_id=${profissional.id}`);
            return slots.map((slot) => ({
                ...slot,
                profissional_id: profissional.id,
                profissional_nome: profissional.nome,
                profissional_apelido: profissional.apelido || profissional.nome
            }));
        }));
    const slots = results
        .flat()
        .filter((slot) => (slot.servicos || []).some((item) => String(item.id) === String(service.id)))
        .map((slot) => ({ ...slot, servicos: (slot.servicos || []).filter((item) => String(item.id) === String(service.id)) }))
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    renderAvailability(slots, options);
    return slots;
}

async function openNextAvailableDate() {
    const baseDate = today();
    el.availabilityDate.min = baseDate;
    el.availabilityDate.value = baseDate;
    renderDatePicker(baseDate);

    for (let offset = 0; offset <= 21; offset += 1) {
        el.availabilityDate.value = addDays(baseDate, offset);
        renderDatePicker(baseDate); // Highlight the selected date in slider
        const slots = await loadAvailability();
        if (slots.some((slot) => slot.disponivel)) return;
    }
}

function renderDatePicker(startDate) {
    if (!el.dateSlider) return;
    const days = [];
    for (let i = 0; i < 30; i++) {
        days.push(addDays(startDate, i));
    }
    
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    
    el.dateSlider.replaceChildren(...days.map(dateStr => {
        const d = new Date(dateStr + 'T12:00:00');
        const isSelected = el.availabilityDate.value === dateStr;
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = isSelected ? 'date-chip active' : 'date-chip';
        btn.innerHTML = `
            <small>${dias[d.getDay()]}</small>
            <strong>${d.getDate()}</strong>
            <span>${meses[d.getMonth()]}</span>
        `;
        
        btn.addEventListener('click', () => {
            el.availabilityDate.value = dateStr;
            renderDatePicker(startDate);
            loadAvailability().catch(err => showToast(err.message));
        });
        
        return btn;
    }));
}

function bookingPayload(metodo) {
    if (!state.selectedSlot) throw new Error('Escolha um horario livre.');
    return {
        nome: el.bookingName.value,
        telefone: onlyDigits(el.bookingPhone.value),
        email: el.bookingEmail.value,
        cpf_cnpj: el.bookingDocument ? el.bookingDocument.value : '',
        servico_id: el.bookingService.value,
        profissional_id: state.selectedSlot.profissional_id || el.availabilityProfessional.value,
        inicio: state.selectedSlot.inicio,
        tipo_cobranca: metodoOnline() ? el.bookingChargeType.value : 'pagar_na_hora',
        metodo_pagamento_preferido: metodo,
        observacoes: el.bookingNotes.value
    };
}

function renderWaitlist(show) {
    if (!el.waitlistForm) return;
    el.waitlistForm.hidden = !show;
}

async function submitWaitlist() {
    const service = selectedService();
    const phone = onlyDigits(el.waitlistPhone.value);
    if (!el.waitlistName.value.trim()) {
        showToast('Informe seu nome para entrar na lista de espera.');
        el.waitlistName.focus();
        return;
    }
    if (phone.length < 10 || phone.length > 11) {
        showToast('Informe um WhatsApp com DDD.');
        el.waitlistPhone.focus();
        return;
    }
    try {
        if (state.demo) {
            showToast('Lista de espera simulada na demo visual.');
            el.waitlistName.value = '';
            el.waitlistPhone.value = '';
            if (el.waitlistPeriod) el.waitlistPeriod.value = 'qualquer';
            el.waitlistNotes.value = '';
            return;
        }
        el.waitlistSubmit.disabled = true;
        el.waitlistSubmit.textContent = 'Salvando...';
        await api('/api/publico/lista-espera', {
            method: 'POST',
            body: JSON.stringify({
                nome: el.waitlistName.value,
                telefone: phone,
                servico_id: service && service.id,
                profissional_id: el.availabilityProfessional.value === 'any' ? null : el.availabilityProfessional.value,
                data_preferida: el.availabilityDate.value,
                periodo: el.waitlistPeriod ? el.waitlistPeriod.value : 'qualquer',
                observacoes: el.waitlistNotes.value
            })
        });
        showToast('Voce entrou na lista de espera.');
        el.waitlistName.value = '';
        el.waitlistPhone.value = '';
        if (el.waitlistPeriod) el.waitlistPeriod.value = 'qualquer';
        el.waitlistNotes.value = '';
    } catch (error) {
        showToast(error.message);
    } finally {
        el.waitlistSubmit.disabled = false;
        el.waitlistSubmit.textContent = 'Entrar na lista de espera';
    }
}

function renderPixPayment(result) {
    const pix = result.pagamento && result.pagamento.pix;
    const pagamento = result.pagamento || {};
    const checkoutUrl = pagamento.checkout_url || pagamento.sandbox_checkout_url;
    if (!pix && checkoutUrl) {
        el.paymentResult.hidden = false;
        el.paymentResult.innerHTML = `
            <div>
                <strong>Pix online pronto</strong>
                <p>Horario reservado. Abra o checkout do Mercado Pago para gerar e pagar o Pix.</p>
            </div>
            <a class="primary-button payment-link" href="${checkoutUrl}" target="_blank" rel="noopener">Ir para o Mercado Pago</a>
        `;
        return;
    }
    if (!pix || !pix.qr_code) {
        showToast('Agendamento criado, mas o link de pagamento nao retornou.');
        return;
    }
    el.paymentResult.hidden = false;
    el.paymentResult.innerHTML = `
        <div>
            <strong>QR Pix gerado</strong>
            <p>Horario reservado temporariamente. Pague pelo QR Code ou copie o codigo Pix para confirmar.</p>
        </div>
        ${pix.qr_code_base64 ? `<img src="data:image/png;base64,${pix.qr_code_base64}" alt="QR Code Pix">` : ''}
        <textarea readonly rows="4" data-pix-code>${escapeHtml(pix.qr_code)}</textarea>
        <button class="secondary-button" type="button" data-copy-pix>Copiar Pix</button>
        <p class="copy-hint" data-copy-hint hidden>Se nao copiar automaticamente, toque no codigo acima, selecione tudo e copie.</p>
    `;
    const copyButton = el.paymentResult.querySelector('[data-copy-pix]');
    const pixTextarea = el.paymentResult.querySelector('[data-pix-code]');
    const copyHint = el.paymentResult.querySelector('[data-copy-hint]');
    copyButton.addEventListener('click', async () => {
        const copied = await copyText(pix.qr_code, pixTextarea);
        if (copied) {
            copyButton.textContent = 'Pix copiado';
            showToast('Codigo Pix copiado.');
            setTimeout(() => { copyButton.textContent = 'Copiar Pix'; }, 2200);
            return;
        }
        pixTextarea.focus();
        pixTextarea.select();
        copyHint.hidden = false;
        showToast('Nao consegui copiar automaticamente. O codigo ficou selecionado.');
    });
}

function renderCardPayment(result) {
    const pagamento = result.pagamento || {};
    const checkoutUrl = pagamento.checkout_url || pagamento.sandbox_checkout_url;
    if (!checkoutUrl) {
        showToast('Agendamento criado, mas o link de pagamento nao retornou.');
        return;
    }
    el.paymentResult.hidden = false;
    el.paymentResult.innerHTML = `
        <div>
            <strong>Pagamento com cartao pronto</strong>
            <p>Horario reservado. Abra o checkout do Mercado Pago para concluir o pagamento online.</p>
        </div>
        <a class="primary-button payment-link" href="${checkoutUrl}" target="_blank" rel="noopener">Ir para o Mercado Pago</a>
    `;
}

function renderManualReservation(result) {
    const aviso = result.aviso_whatsapp || {};
    const whatsappButton = aviso.url
        ? `<a class="primary-button payment-link" href="${aviso.url}" target="_blank" rel="noopener" data-manual-whatsapp>Avisar no WhatsApp</a>`
        : '';
    el.paymentResult.hidden = false;
    el.paymentResult.innerHTML = `
        <div>
            <strong>Pedido enviado</strong>
            <p>A cliente pediu ${escapeHtml(metodoLabel(el.bookingPaymentMethod.value).toLowerCase())}. O horario fica aguardando aprovacao.</p>
        </div>
        ${whatsappButton}
    `;
    const link = el.paymentResult.querySelector('[data-manual-whatsapp]');
    if (link && !aviso.enviado) {
        setTimeout(() => {
            window.open(link.href, '_blank', 'noopener');
        }, 120);
    }
}

async function init() {
    try {
        const [info, servicos] = await Promise.all([
            api('/api/publico'),
            api('/api/servicos')
        ]);
        state.whatsapp = info.whatsapp;
        applyBusinessInfo(info.negocio);
        state.setup = info.setup || state.setup;
        state.profissionais = info.profissionais || [];
        state.servicos = servicos;
        renderProfessionals();
        renderServicePicker();
        renderSetupNotice();
        renderHeroAction();
        renderServices();
        updateBookingModeUI();
        if (state.servicos.length) {
            await openNextAvailableDate();
        }
    } catch (error) {
        state.demo = true;
        state.whatsapp = '5551989849691';
        state.setup = {
            ...state.setup,
            whatsapp_configurado: true,
            pagamento_online_configurado: false
        };
        state.profissionais = demoProfessionals;
        state.servicos = demoServices;
        applyBusinessInfo(demoBusiness);
        renderProfessionals();
        renderServicePicker();
        renderSetupNotice();
        renderHeroAction();
        renderServices();
        updateBookingModeUI();
        await openNextAvailableDate();
        showToast('Demo visual carregada. Para agendamento real, abra pelo servidor.');
    }
}

if (el.availabilityForm) {
    el.availabilityForm.addEventListener('submit', (event) => {
        event.preventDefault();
        loadAvailability().catch((error) => showToast(error.message));
    });
    el.availabilityDate.addEventListener('change', () => loadAvailability().catch((error) => showToast(error.message)));
}

if (el.availabilityProfessional) {
    el.availabilityProfessional.addEventListener('change', () => {
        renderProfessionalPicker();
        loadAvailability().catch((error) => showToast(error.message));
    });
}

if (el.bookingForm) {
    el.bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const metodo = el.bookingPaymentMethod.value;
        if (!validateBookingForm()) return;
        if (metodoOnline() && !pagamentoOnlineConfigurado()) {
            showToast('Pagamento online ainda nao configurado no .env.');
            return;
        }
        try {
            if (state.demo) {
                el.paymentResult.hidden = false;
                el.paymentResult.innerHTML = `
                    <div>
                        <strong>Reserva simulada</strong>
                        <p>Esta tela esta em modo demo visual. Para salvar de verdade, abra pelo servidor com banco conectado.</p>
                    </div>
                `;
                showToast('Reserva simulada criada.');
                return;
            }
            const result = await api('/api/publico/agendamentos', {
                method: 'POST',
                body: JSON.stringify(bookingPayload(metodo))
            });
            if (metodo === 'pix_online') renderPixPayment(result);
            else if (metodo === 'cartao_online') renderCardPayment(result);
            else renderManualReservation(result);
            await loadAvailability({ preserveBooking: true });
        } catch (error) {
            showToast(error.message);
        }
    });
}

if (el.bookingPaymentMethod) {
    el.bookingPaymentMethod.addEventListener('change', () => {
        updateBookingModeUI();
        clearBookingErrors();
    });
}

if (el.bookingService) {
    el.bookingService.addEventListener('change', updateBookingSummary);
}

[el.bookingName, el.bookingPhone, el.bookingEmail, el.bookingDocument].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
        if (input === el.bookingPhone) input.value = formatPhone(input.value);
        setFieldError(input, '');
    });
});

if (el.waitlistPhone) {
    el.waitlistPhone.addEventListener('input', () => {
        el.waitlistPhone.value = formatPhone(el.waitlistPhone.value);
    });
}

if (el.waitlistSubmit) {
    el.waitlistSubmit.addEventListener('click', submitWaitlist);
}

if (el.bookingWhatsapp) {
    el.bookingWhatsapp.addEventListener('click', () => {
        try {
            const servico = selectedBookingService();
            const url = whatsappUrl(servico, state.selectedSlot && state.selectedSlot.inicio, {
                nome: el.bookingName.value || 'Cliente pelo site',
                telefone: el.bookingPhone.value || 'nao informado'
            });
            if (!url) {
                showToast('Configure WHATSAPP_BUSINESS_NUMBER no .env.');
                return;
            }
            window.open(url, '_blank', 'noopener');
        } catch (error) {
            showToast(error.message);
        }
    });
}

window.nextBookingStep = function(step) {
    // Hide all steps
    document.querySelectorAll('.booking-step-card').forEach(el => {
        el.setAttribute('hidden', '');
    });
    
    // Show target step
    if (step === 4) {
        document.querySelector('#bookingPanel').removeAttribute('hidden');
        document.querySelector('#availabilityForm').style.display = 'none';
    } else {
        document.querySelector('#availabilityForm').style.display = 'block';
        const targetCard = document.querySelector(`#step-card-${step}`);
        if(targetCard) targetCard.removeAttribute('hidden');
        document.querySelector('#bookingPanel').setAttribute('hidden', '');
    }
    
    // Update nav
    document.querySelectorAll('.booking-steps li').forEach((el, index) => {
        if (index < step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Scroll to top smoothly
    const agendamentoSec = document.querySelector('#agendamento');
    if(agendamentoSec) {
        agendamentoSec.scrollIntoView({ behavior: 'smooth' });
    }
};

window.prevBookingStep = function(step) {
    window.nextBookingStep(step);
};

init();
