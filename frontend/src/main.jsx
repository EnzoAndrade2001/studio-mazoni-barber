import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const demoProfessionals = [
  {
    id: 1,
    nome: "Deryck",
    apelido: "Deryck",
    foto_url: "https://cdn-partners-api.fresha.com/employee-avatars/processed/297929/medium/a405200d-8c39-4177-9bf3-19a10e2abe89-WhatsApp%20Image%202026-02-25%20at%2010.34.35%20%281%29.jpeg",
  },
  {
    id: 2,
    nome: "Leo Mazoni",
    apelido: "Leo",
    foto_url: "https://cdn-partners-api.fresha.com/employee-avatars/processed/162894/medium/9fc0ae94-9870-40bc-9b13-14048b346d1c-74A1D6C4-8C27-4D18-9682-16235AA3563A.png",
  },
  {
    id: 3,
    nome: "Gustavo",
    apelido: "Gustavo",
    foto_url: "https://cdn-partners-api.fresha.com/employee-avatars/processed/162904/medium/bf013f84-c756-4f58-a966-ac19cffd41d3-Fot%20gu.jpeg",
  },
];

const demoServices = [
  { id: 1, nome: "Corte degrade", categoria: "Hair", duracao_minutos: 30, preco: 35, descricao: "Degrade alinhado com acabamento premium." },
  { id: 2, nome: "Corte e Barba", categoria: "Combo", duracao_minutos: 60, preco: 55, descricao: "Corte, barba e finalizacao no padrao Mazoni." },
  { id: 3, nome: "Combo", categoria: "Combo", duracao_minutos: 65, preco: 65, descricao: "Experiencia completa para renovar o visual." },
  { id: 4, nome: "Sobrancelha", categoria: "Detalhes", duracao_minutos: 5, preco: 10, descricao: "Detalhe rapido para fechar o atendimento." },
  { id: 5, nome: "Barba", categoria: "Barba", duracao_minutos: 30, preco: 25, descricao: "Modelagem de barba com acabamento limpo." },
  { id: 6, nome: "Limpeza de pele", categoria: "Limpeza", duracao_minutos: 30, preco: 40, descricao: "Cuidado facial para complementar o corte." },
];

const demoBusiness = {
  nome: "Studio Mazoni Barber",
  regiao: "Santa Tereza, Rio Grande do Sul",
  frase_agendamento: "Escolha o barbeiro, veja horarios livres e reserve sem depender da recepcao.",
  local_titulo: "Rua Abelardo Marques 180",
  local_descricao: "Segunda 13:30-20:00. Terca a sabado 09:00-20:00. Domingo fechado.",
};

const demoBusinessHours = [
  { dia_semana: 1, nome: "Segunda", aberto: true, abertura: "13:30:00", fechamento: "20:00:00" },
  { dia_semana: 2, nome: "Terca", aberto: true, abertura: "09:00:00", fechamento: "20:00:00" },
  { dia_semana: 3, nome: "Quarta", aberto: true, abertura: "09:00:00", fechamento: "20:00:00" },
  { dia_semana: 4, nome: "Quinta", aberto: true, abertura: "09:00:00", fechamento: "20:00:00" },
  { dia_semana: 5, nome: "Sexta", aberto: true, abertura: "09:00:00", fechamento: "20:00:00" },
  { dia_semana: 6, nome: "Sabado", aberto: true, abertura: "09:00:00", fechamento: "20:00:00" },
  { dia_semana: 7, nome: "Domingo", aberto: false, abertura: "09:00:00", fechamento: "20:00:00" },
];

const demoAppointments = [
  { id: 1, hora: "09:00", cliente: "Rafael", servico: "Corte degrade", profissional_id: 1, status: "confirmado", pago: true },
  { id: 2, hora: "10:30", cliente: "Bruno", servico: "Corte e Barba", profissional_id: 2, status: "em atendimento", pago: false },
  { id: 3, hora: "14:00", cliente: "Marcos", servico: "Combo", profissional_id: 3, status: "agendado", pago: false },
  { id: 4, hora: "18:30", cliente: "Felipe", servico: "Barba", profissional_id: 1, status: "confirmado", pago: true },
];

function today() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function duration(minutes) {
  const total = Number(minutes || 0);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours && rest) return `${hours}h${String(rest).padStart(2, "0")}`;
  if (hours) return `${hours}h`;
  return `${rest} min`;
}

function ScissorsIcon() {
  return (
    <svg className="scissors-icon-svg" viewBox="0 0 120 70" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="27" r="10"/>
      <circle cx="24" cy="47" r="10"/>
      <path d="M34 32 L102 10"/>
      <path d="M34 42 L102 61"/>
      <path d="M43 37 L78 36"/>
    </svg>
  );
}

function ScissorsBackground() {
  const rows = Array.from({ length: 12 });
  const icons = Array.from({ length: 25 });

  return (
    <div className="scissors-flow-container" aria-hidden="true">
      {rows.map((_, rowIndex) => {
        const isReverse = rowIndex % 2 === 1;
        return (
          <div key={rowIndex} className={`scissors-row ${isReverse ? "reverse" : ""}`}>
            {icons.map((_, iconIndex) => (
              <ScissorsIcon key={iconIndex} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function time(value) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function api(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("api indisponivel");
  return response.json();
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Nao foi possivel salvar.");
  }
  if (response.status === 204) return null;
  return response.json();
}

async function loadInitialData() {
  try {
    const [publico, services, professionals] = await Promise.all([
      api("/api/publico"),
      api("/api/servicos"),
      api("/api/profissionais"),
    ]);
    return {
      business: publico.negocio || demoBusiness,
      services,
      professionals: professionals.length ? professionals : demoProfessionals,
      demo: false,
    };
  } catch {
    return {
      business: demoBusiness,
      services: demoServices,
      professionals: demoProfessionals,
      demo: true,
    };
  }
}

function demoSlots(date, professionalId) {
  const blockedByProfessional = {
    1: new Set(["10:30", "18:30"]),
    2: new Set(["09:30", "15:30"]),
    3: new Set(["11:00", "17:00"]),
  };
  const base = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "15:30", "17:00", "18:30", "19:00"];
  return base
    .filter((hour) => !(blockedByProfessional[professionalId] || new Set()).has(hour))
    .map((hour) => ({ inicio: `${date}T${hour}:00-03:00`, servicos: demoServices, disponivel: true }));
}

function App() {
  const [data, setData] = useState({
    business: demoBusiness,
    services: demoServices,
    professionals: demoProfessionals,
    demo: true,
  });
  const [view, setView] = useState("cliente");
  const [date, setDate] = useState(today());
  const [professionalId, setProfessionalId] = useState(2);
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState(null);
  const [serviceId, setServiceId] = useState(1);
  const [status, setStatus] = useState("idle");
  const [businessHours, setBusinessHours] = useState(demoBusinessHours);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingRules, setBookingRules] = useState(null);

  useEffect(() => {
    loadInitialData().then((loaded) => {
      setData(loaded);
      setProfessionalId(loaded.professionals[0]?.id || 1);
      setServiceId(loaded.services[0]?.id || 1);
    });
  }, []);

  useEffect(() => {
    if (data.demo) return;
    Promise.all([
      api("/api/horarios-funcionamento"),
      api("/api/regras-agendamento")
    ]).then(([hours, rules]) => {
      setBusinessHours(hours);
      setBookingRules(rules);
    }).catch(() => {
      setBusinessHours(demoBusinessHours);
    });
  }, [data.demo]);

  useEffect(() => {
    let alive = true;
    async function loadSlots() {
      setStatus("loading");
      setSlot(null);
      try {
        if (data.demo) {
          if (alive) setSlots(demoSlots(date, Number(professionalId)));
        } else {
          const result = await api(`/api/disponibilidade/horarios?data=${date}&profissional_id=${professionalId}`);
          if (alive) setSlots(result);
        }
        setStatus("idle");
      } catch {
        if (alive) {
          setSlots(demoSlots(date, Number(professionalId)));
          setStatus("demo");
        }
      }
    }
    loadSlots();
    return () => {
      alive = false;
    };
  }, [date, professionalId, data.demo]);

  const selectedProfessional = useMemo(
    () => data.professionals.find((professional) => Number(professional.id) === Number(professionalId)) || data.professionals[0],
    [data.professionals, professionalId],
  );

  const selectedService = useMemo(
    () => data.services.find((service) => Number(service.id) === Number(serviceId)) || data.services[0],
    [data.services, serviceId],
  );

  useEffect(() => {
    if (slot?.servicos?.length) setServiceId(slot.servicos[0].id);
  }, [slot]);

  return (
    <main>
      <ScissorsBackground />
      <div className="fixed-watermark" aria-hidden="true">
        <MazoniLogo variant="watermark" />
      </div>
      <Hero business={data.business} view={view} setView={setView} demo={data.demo || status === "demo"} />
      {view === "cliente" ? (
        <ClientBooking
          business={data.business}
          services={data.services}
          professionals={data.professionals}
          date={date}
          setDate={setDate}
          professionalId={professionalId}
          setProfessionalId={setProfessionalId}
          serviceId={serviceId}
          setServiceId={setServiceId}
          selectedProfessional={selectedProfessional}
          selectedService={selectedService}
          slots={slots}
          slot={slot}
          setSlot={setSlot}
          status={status}
          demo={data.demo}
          bookingStatus={bookingStatus}
          setBookingStatus={setBookingStatus}
        />
      ) : (
        <AdminPanel
          data={data}
          setData={setData}
          businessHours={businessHours}
          setBusinessHours={setBusinessHours}
          bookingRules={bookingRules}
          setBookingRules={setBookingRules}
        />
      )}
    </main>
  );
}

function Hero({ business, view, setView, demo }) {
  return (
    <section className="hero">
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark"><MazoniIcon /></div>
          <div>
            <strong>{business.nome}</strong>
            <span>agenda premium</span>
          </div>
        </div>
        <div className="view-toggle" aria-label="Alternar visualizacao">
          <button className={view === "cliente" ? "active" : ""} onClick={() => setView("cliente")} type="button">
            Cliente
          </button>
          <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")} type="button">
            Fran Admin
          </button>
        </div>
      </nav>

      <div className="hero-center">
        <MazoniLogo />
        <div className="hero-copy-block">
          <p className="eyebrow">Barbearia com hora marcada</p>
          <h1>Agendamento premium para o Studio Mazoni Barber.</h1>
          <p className="hero-copy">
            Escolha barbeiro, servico e horario em poucos toques. A recepcao acompanha tudo em uma agenda pensada para operar rapido.
          </p>
          <div className="hero-actions">
            <a href="#agenda" className="primary">Agendar agora</a>
            <a href="#admin" className="secondary" onClick={() => setView("admin")}>Ver painel da Fran</a>
          </div>
          {demo && <span className="demo-pill">Demo visual conectada a dados simulados</span>}
        </div>
      </div>
    </section>
  );
}

function MazoniIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 20h34L28 44h24v7H18l14-24H8z" fill="currentColor" />
      <path d="M42 13l8 31" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="52" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function MazoniLogo({ variant = "main" }) {
  return (
    <div className={`mazoni-logo ${variant}`} aria-label="Mazoni Barber">
      <div className="mazoni-rule top"></div>
      <div className="mazoni-word">
        <span>MA</span>
        <strong>Z</strong>
        <span>ONI</span>
      </div>
      <div className="mazoni-rule bottom"></div>
      <div className="mazoni-barber">BARBER</div>
      <div className="razor-mark">
        <span className="razor-blade"></span>
        <span className="razor-handle"></span>
        <span className="razor-ring"></span>
      </div>
    </div>
  );
}

function ClientBooking(props) {
  const {
    business,
    services,
    professionals,
    date,
    setDate,
    professionalId,
    setProfessionalId,
    serviceId,
    setServiceId,
    selectedProfessional,
    selectedService,
    slots,
    slot,
    setSlot,
    status,
    demo,
    bookingStatus,
    setBookingStatus,
  } = props;
  const [paymentMethod, setPaymentMethod] = useState("pix_online");
  const [chargeType, setChargeType] = useState("total");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("");
  const [recognizedClient, setRecognizedClient] = useState(null);
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const slotServices = slot?.servicos?.length ? slot.servicos : services;
  const onlinePayment = ["pix_online", "cartao_online"].includes(paymentMethod);

  const [serviceQuery, setServiceQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchQuery = s.nome.toLowerCase().includes(serviceQuery.toLowerCase()) || 
                         (s.descricao && s.descricao.toLowerCase().includes(serviceQuery.toLowerCase()));
      const matchCat = selectedCategory === "Todos" || s.categoria === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [services, serviceQuery, selectedCategory]);

  useEffect(() => {
    if (chargeType === "pagar_na_hora" && onlinePayment) setPaymentMethod("pix_manual");
    if (chargeType !== "pagar_na_hora" && paymentMethod === "dinheiro") setPaymentMethod("pix_online");
    if (chargeType === "total" && paymentMethod === "pix_manual") setPaymentMethod("pix_online");
  }, [chargeType, onlinePayment, paymentMethod]);

  async function recognizeClient(telefone) {
    const cleanPhone = String(telefone || "").replace(/\D/g, "");
    setRecognizedClient(null);
    setRecognitionStatus("");
    if (cleanPhone.length < 10) return;
    if (demo) {
      setRecognizedClient({ nome: "Cliente demo", estatisticas: { total_agendamentos: 3 } });
      return;
    }
    try {
      const result = await api(`/api/publico/clientes/reconhecer?telefone=${encodeURIComponent(cleanPhone)}`);
      if (result.reconhecido) {
        setRecognizedClient(result.cliente);
      }
    } catch {
      setRecognitionStatus("Nao conseguimos consultar seu historico agora, mas voce pode continuar.");
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!slot) {
      setBookingStatus("Escolha um horario antes de reservar.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      telefone: form.get("telefone"),
      email: form.get("email"),
      cpf_cnpj: form.get("cpf_cnpj"),
      profissional_id: professionalId,
      servico_id: serviceId,
      inicio: slot.inicio,
      tipo_cobranca: chargeType,
      metodo_pagamento_preferido: paymentMethod,
      observacoes: form.get("observacoes"),
    };
    if (!payload.nome || !payload.telefone) {
      setBookingStatus("Preencha nome e WhatsApp para reservar.");
      return;
    }
    if (onlinePayment && !payload.cpf_cnpj) {
      setBookingStatus("Informe CPF para gerar pagamento online.");
      return;
    }
    setBookingStatus("Reservando horario...");
    setWhatsappLink("");
    try {
      if (demo) {
        setWhatsappLink("https://wa.me/5551989849691?text=Oi%2C%20acabei%20de%20reservar%20um%20horario%20pela%20demo%20do%20site.");
        setBookingStatus("Pedido simulado criado. No backend real ele ficara aguardando pagamento ou aprovacao.");
        return;
      }
      const result = await apiRequest("/api/publico/agendamentos", { method: "POST", body: payload });
      const pix = result.pagamento?.pix?.qr_code ? " Pix gerado para pagamento." : "";
      const aviso = result.aviso_whatsapp?.url ? " Aviso para WhatsApp da recepcao gerado." : "";
      const link = result.whatsapp_cliente?.url || "";
      setWhatsappLink(link);
      if (link && !onlinePayment) window.open(link, "_blank", "noopener,noreferrer");
      setBookingStatus(`Horario reservado com sucesso.${pix}${aviso}`);
    } catch (error) {
      setBookingStatus(error.message);
    }
  }

  async function submitWaitlist(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      telefone: form.get("telefone"),
      servico_id: Number(form.get("servico_id") || serviceId),
      profissional_id: professionalId,
      data_preferida: date,
      periodo: form.get("periodo"),
      observacoes: form.get("observacoes"),
    };
    if (!payload.nome || !payload.telefone) {
      setWaitlistStatus("Preencha nome e WhatsApp para entrar na lista de espera.");
      return;
    }
    setWaitlistStatus("Salvando seu pedido na lista de espera...");
    try {
      if (demo) {
        setWaitlistStatus("Pedido simulado na lista de espera. No backend real a recepcao recebe esse aviso.");
        event.currentTarget.reset();
        return;
      }
      await apiRequest("/api/publico/lista-espera", { method: "POST", body: payload });
      setWaitlistStatus("Pronto. Voce entrou na lista de espera para essa data.");
      event.currentTarget.reset();
    } catch (error) {
      setWaitlistStatus(error.message);
    }
  }

  return (
    <>
      <section id="agenda" className="booking-shell">
        <div className="section-heading">
          <p className="eyebrow dark">Agenda online</p>
          <h2>Escolha o barbeiro primeiro. Depois mostramos horarios reais daquela agenda.</h2>
        </div>

        <div className="booking-grid">
          <aside className="selector-panel">
            <label>
              Data
              <input type="date" min={today()} value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label>
              Barbeiro
              <select className="sr-only" value={professionalId} onChange={(event) => setProfessionalId(Number(event.target.value))}>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>{professional.apelido || professional.nome}</option>
                ))}
              </select>
              <div className="professional-picker">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    type="button"
                    className={Number(professionalId) === Number(professional.id) ? "professional-option active" : "professional-option"}
                    onClick={() => setProfessionalId(Number(professional.id))}
                  >
                    <ProfessionalPhoto professional={professional} />
                    <span>{professional.apelido || professional.nome}</span>
                  </button>
                ))}
              </div>
            </label>
            <div className="service-preview">
              <span>{slot ? "Servico escolhido" : "Proximo passo"}</span>
              <strong>{slot ? selectedService?.nome : "Escolha um horario"}</strong>
              <p>{slot ? selectedService?.descricao : "Depois do horario, mostramos apenas os servicos que cabem nessa janela da agenda."}</p>
              <div>
                <b>{slot ? money(selectedService?.preco) : "--"}</b>
                <small>{slot ? duration(selectedService?.duracao_minutos) : "horario primeiro"}</small>
              </div>
            </div>
          </aside>

          <section className="slots-panel">
            <div className="slots-head">
              <div>
                <span>Agenda de</span>
                <strong>{selectedProfessional?.nome}</strong>
              </div>
              <small>{status === "loading" ? "Carregando..." : `${slots.length} horarios livres`}</small>
            </div>
            <div className="slots-grid">
              {slots.map((item) => (
                <button key={item.inicio} type="button" className={slot?.inicio === item.inicio ? "slot active" : "slot"} onClick={() => setSlot(item)}>
                  <strong>{time(item.inicio)}</strong>
                  <span>Livre</span>
                </button>
              ))}
            </div>
            {status !== "loading" && slots.length === 0 && (
              <form className="waitlist-card" onSubmit={submitWaitlist}>
                <div className="checkout-summary">
                  <span>Lista de espera</span>
                  <strong>Nenhum horario livre nessa data</strong>
                  <p>Deixe seu WhatsApp para a recepcao chamar se abrir uma vaga com {selectedProfessional?.apelido || selectedProfessional?.nome}.</p>
                </div>
                <div className="form-pair">
                  <input name="nome" placeholder="Seu nome" required />
                  <input name="telefone" placeholder="WhatsApp com DDD" inputMode="tel" onBlur={(event) => recognizeClient(event.target.value)} required />
                </div>
                <div className="form-pair">
                  <select name="servico_id" value={serviceId} onChange={(event) => setServiceId(Number(event.target.value))}>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.nome} - {money(service.preco)}</option>
                    ))}
                  </select>
                  <select name="periodo" defaultValue="qualquer">
                    <option value="qualquer">Qualquer horario</option>
                    <option value="manha">Manha</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>
                <textarea name="observacoes" placeholder="Preferencia ou observacao opcional" rows="2"></textarea>
                {recognizedClient && (
                  <p className="client-recognition">Cliente reconhecido: {recognizedClient.nome}. Vamos priorizar seu historico no atendimento.</p>
                )}
                {waitlistStatus && <p className="booking-status">{waitlistStatus}</p>}
                <button type="submit">Entrar na lista de espera</button>
              </form>
            )}
            <form className="checkout-card booking-form" onSubmit={submitBooking}>
              <div className="checkout-summary">
                <span>Resumo</span>
                <strong>
                  {slot ? `${selectedProfessional?.apelido || selectedProfessional?.nome} as ${time(slot.inicio)}` : "Selecione um horario"}
                </strong>
                <p>{business.local_titulo} - {business.regiao}</p>
              </div>
              {slot && (
                <>
                  <label>
                    Servico
                    <select value={serviceId} onChange={(event) => setServiceId(Number(event.target.value))}>
                      {slotServices.map((service) => (
                        <option key={service.id} value={service.id}>{service.nome} - {money(service.preco)}</option>
                      ))}
                    </select>
                  </label>
                  <div className="form-pair">
                    <input name="nome" placeholder="Seu nome" required />
                    <input name="telefone" placeholder="WhatsApp com DDD" inputMode="tel" onBlur={(event) => recognizeClient(event.target.value)} required />
                  </div>
                  {recognizedClient && (
                    <p className="client-recognition">
                      Bem-vindo de volta, {recognizedClient.nome}. {recognizedClient.estatisticas?.total_agendamentos ? `${recognizedClient.estatisticas.total_agendamentos} atendimento(s) no historico.` : ""}
                    </p>
                  )}
                  {recognitionStatus && <p className="booking-status">{recognitionStatus}</p>}
                  <div className="form-pair">
                    <input name="email" placeholder="E-mail" type="email" required={onlinePayment} />
                    <input name="cpf_cnpj" placeholder="CPF para pagamento online" inputMode="numeric" required={onlinePayment} />
                  </div>
                  <div className="form-pair">
                    <select value={chargeType} onChange={(event) => setChargeType(event.target.value)}>
                      <option value="total">Pagar total</option>
                      <option value="pagar_na_hora">Pagar na hora</option>
                    </select>
                    <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                      {chargeType === "total" ? (
                        <>
                          <option value="pix_online">Pix online</option>
                          <option value="cartao_online">Cartao online</option>
                        </>
                      ) : (
                        <>
                          <option value="pix_manual">Pix na hora</option>
                          <option value="dinheiro">Dinheiro na hora</option>
                        </>
                      )}
                    </select>
                  </div>
                  <textarea name="observacoes" placeholder="Observacao opcional" rows="2"></textarea>
                </>
              )}
              {bookingStatus && <p className="booking-status">{bookingStatus}</p>}
              {whatsappLink && (
                <a className="whatsapp-button" href={whatsappLink} target="_blank" rel="noreferrer">
                  Continuar pelo WhatsApp
                </a>
              )}
              <button type="submit" disabled={!slot}>Reservar horario</button>
            </form>
          </section>
        </div>
      </section>

      <section id="servicos" className="services-section" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ddd5c6', borderRadius: '24px', padding: '24px 20px', maxWidth: '800px', margin: '40px auto 0', color: '#111' }}>
        <div className="section-heading" style={{ marginBottom: '20px' }}>
          <p className="eyebrow dark">Catalogo de Servicos</p>
          <h2 style={{ color: '#111' }}>Precos e duracoes reais do Studio Mazoni Barber.</h2>
        </div>

        {/* Busca e Filtros */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Pesquisar nome do servico..." 
              value={serviceQuery}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd5c6', fontSize: '14px', background: '#fff', color: '#111' }}
              onChange={(e) => setServiceQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            <button 
              type="button" 
              style={{
                background: selectedCategory === "Todos" ? "#111" : "#fff",
                color: selectedCategory === "Todos" ? "#d7b46a" : "#111",
                border: '1px solid #ddd5c6',
                borderRadius: '999px',
                padding: '8px 16px',
                fontWeight: 'bold',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedCategory("Todos")}
            >
              Todas as categorias
            </button>
            {Array.from(new Set(services.map(s => s.categoria))).map(cat => (
              <button 
                key={cat}
                type="button" 
                style={{
                  background: selectedCategory === cat ? "#111" : "#fff",
                  color: selectedCategory === cat ? "#d7b46a" : "#111",
                  border: '1px solid #ddd5c6',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Categorizada */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {Array.from(new Set(filteredServices.map(s => s.categoria))).map(category => (
            <div key={category}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '12px', textAlign: 'left' }}>{category}</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {filteredServices.filter(s => s.categoria === category).map(service => (
                  <div 
                    key={service.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      padding: '12px 16px', 
                      background: '#fff', 
                      borderRadius: '12px', 
                      border: '1px solid #eee',
                      borderLeft: '4px solid #d7b46a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#111', fontWeight: 'bold' }}>{service.nome}</h4>
                      <span style={{ fontSize: '12px', color: '#706758', display: 'block', marginTop: '2px' }}>{duration(service.duracao_minutos)}</span>
                      {service.descricao && <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{service.descricao}</p>}
                    </div>
                    <strong style={{ fontSize: '16px', color: '#111', marginLeft: '12px', whiteSpace: 'nowrap' }}>{money(service.preco)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!filteredServices.length && <div className="empty-column">Nenhum servico encontrado.</div>}
        </div>
      </section>
    </>
  );
}

function AdminPreview({ professionals }) {
  return (
    <section id="admin" className="admin-shell">
      <div className="section-heading">
        <p className="eyebrow dark">Painel da Franciele</p>
        <h2>Recepcao com agenda por barbeiro, encaixe rapido e controle do dia.</h2>
      </div>
      <div className="admin-summary">
        <div><strong>18</strong><span>agendados hoje</span></div>
        <div><strong>R$ 615</strong><span>previsto</span></div>
        <div><strong>4</strong><span>pendentes</span></div>
        <div><strong>3</strong><span>barbeiros</span></div>
      </div>
      <div className="barber-columns">
        {professionals.map((professional) => (
          <div className="barber-column" key={professional.id}>
            <header>
              <div className="barber-headline">
                <ProfessionalPhoto professional={professional} />
                <div>
                  <strong>{professional.apelido || professional.nome}</strong>
                  <span>agenda</span>
                </div>
              </div>
            </header>
            {demoAppointments
              .filter((appointment) => Number(appointment.profissional_id) === Number(professional.id))
              .map((appointment) => (
                <article key={appointment.id} className="appointment-card">
                  <time>{appointment.hora}</time>
                  <strong>{appointment.cliente}</strong>
                  <span>{appointment.servico}</span>
                  <small>{appointment.status} - {appointment.pago ? "pago" : "pendente"}</small>
                </article>
              ))}
            <button type="button" className="ghost-button">+ Encaixe rapido</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPanel({ data, setData, businessHours, setBusinessHours, bookingRules, setBookingRules }) {
  const { professionals, services, demo } = data;
  const [tab, setTab] = useState("agenda");
  const [notice, setNotice] = useState("");

  function updateData(kind, next) {
    setData((current) => ({ ...current, [kind]: next }));
  }

  async function saveProfessional(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      apelido: form.get("apelido"),
      bio: form.get("bio"),
      dono: form.get("dono") === "on",
      comissao_percentual: Number(form.get("comissao_percentual") || 50),
      ordem: Number(form.get("ordem") || professionals.length + 1),
    };
    try {
      const saved = demo ? { ...payload, id: Date.now(), ativo: true } : await apiRequest("/api/profissionais", { method: "POST", body: payload });
      updateData("professionals", [...professionals, saved]);
      event.currentTarget.reset();
      setNotice("Barbeiro salvo.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function toggleProfessional(professional) {
    try {
      if (!demo) await apiRequest(`/api/profissionais/${professional.id}`, { method: "PATCH", body: { ativo: !professional.ativo } });
      updateData("professionals", professionals.map((item) => (
        Number(item.id) === Number(professional.id) ? { ...item, ativo: !item.ativo } : item
      )));
      setNotice("Barbeiro atualizado.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function saveService(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      categoria: form.get("categoria"),
      duracao_minutos: Number(form.get("duracao_minutos")),
      preco: Number(form.get("preco")),
      descricao: form.get("descricao"),
    };
    try {
      const saved = demo ? { ...payload, id: Date.now(), ativo: true } : await apiRequest("/api/servicos", { method: "POST", body: payload });
      updateData("services", [...services, saved]);
      event.currentTarget.reset();
      setNotice("Servico salvo.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function removeService(service) {
    try {
      if (!demo) await apiRequest(`/api/servicos/${service.id}`, { method: "DELETE" });
      updateData("services", services.filter((item) => Number(item.id) !== Number(service.id)));
      setNotice("Servico removido da agenda.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function saveHour(event, day) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      aberto: form.get("aberto") === "on",
      abertura: form.get("abertura"),
      fechamento: form.get("fechamento"),
    };
    try {
      const saved = demo ? { ...day, ...payload } : await apiRequest(`/api/horarios-funcionamento/${day.dia_semana}`, { method: "PATCH", body: payload });
      setBusinessHours(businessHours.map((item) => Number(item.dia_semana) === Number(day.dia_semana) ? saved : item));
      setNotice("Horario atualizado.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <section id="admin" className="admin-shell">
      <div className="section-heading">
        <p className="eyebrow dark">Painel da Franciele</p>
        <h2>Recepcao com agenda por barbeiro, servicos e jornada em um painel mobile.</h2>
      </div>
      <div className="admin-tabs" aria-label="Areas do painel">
        {[
          ["agenda", "Agenda"],
          ["espera", "Espera"],
          ["pacotes", "Pacotes"],
          ["estoque", "Estoque"],
          ["clientes", "Clientes"],
          ["barbeiros", "Barbeiros"],
          ["jornada", "Configuracoes"],
          ["servicos", "Servicos"],
          ["relatorios", "Relatorios"],
          ["comissoes", "Comissoes"],
        ].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {notice && <div className="admin-notice">{notice}</div>}
      <div className="admin-summary">
        <div><strong>18</strong><span>agendados hoje</span></div>
        <div><strong>R$ 615</strong><span>previsto</span></div>
        <div><strong>4</strong><span>pendentes</span></div>
        <div><strong>{professionals.length}</strong><span>barbeiros</span></div>
      </div>
      {tab === "agenda" && <AgendaBoard professionals={professionals} demo={demo} />}
      {tab === "espera" && <WaitlistPanel demo={demo} />}
      {tab === "pacotes" && <PackagesPanel demo={demo} services={services} />}
      {tab === "estoque" && <InventoryPanel demo={demo} />}
      {tab === "clientes" && <ClientsPanel demo={demo} />}
      {tab === "barbeiros" && (
        <AdminPanelGrid>
          <form className="admin-form" onSubmit={saveProfessional}>
            <h3>Novo barbeiro</h3>
            <input name="nome" placeholder="Nome" required />
            <input name="apelido" placeholder="Apelido" />
            <input name="comissao_percentual" type="number" min="0" max="100" step="0.01" placeholder="Comissao %" defaultValue="50" />
            <label className="switch-line">
              <input name="dono" type="checkbox" />
              Dono
            </label>
            <input name="ordem" type="number" min="0" placeholder="Ordem" />
            <textarea name="bio" placeholder="Bio curta" rows="3"></textarea>
            <button className="primary" type="submit">Salvar barbeiro</button>
          </form>
          <div className="admin-list">
            {professionals.map((professional) => (
              <article key={professional.id} className="admin-row">
                <ProfessionalPhoto professional={professional} />
                <div>
                  <strong>{professional.nome}</strong>
                  <span>
                    {professional.apelido || "Sem apelido"} - {professional.dono ? "dono" : `${professional.comissao_percentual ?? 50}%`} - {professional.ativo === false ? "inativo" : "ativo"}
                  </span>
                </div>
                <button type="button" className="ghost-button compact" onClick={() => toggleProfessional(professional)}>
                  {professional.ativo === false ? "Ativar" : "Pausar"}
                </button>
              </article>
            ))}
          </div>
        </AdminPanelGrid>
      )}
      {tab === "jornada" && (
        <AdminPanelGrid>
          <div className="hours-grid">
            {businessHours.map((day) => (
              <form key={day.dia_semana} className="hour-card" onSubmit={(event) => saveHour(event, day)}>
                <div>
                  <strong>{day.nome || weekdayName(day.dia_semana)}</strong>
                  <label className="switch-line">
                    <input name="aberto" type="checkbox" defaultChecked={day.aberto} />
                    Aberto
                  </label>
                </div>
                <input name="abertura" type="time" defaultValue={String(day.abertura).slice(0, 5)} />
                <input name="fechamento" type="time" defaultValue={String(day.fechamento).slice(0, 5)} />
                <button className="ghost-button compact" type="submit">Salvar</button>
              </form>
            ))}
          </div>
          <RulesConfig rules={bookingRules} setRules={setBookingRules} demo={demo} setNotice={setNotice} />
        </AdminPanelGrid>
      )}
      {tab === "servicos" && (
        <AdminPanelGrid>
          <form className="admin-form" onSubmit={saveService}>
            <h3>Novo servico</h3>
            <input name="nome" placeholder="Nome do servico" required />
            <select name="categoria" defaultValue="Hair">
              <option>Combo</option>
              <option>Hair</option>
              <option>Barba</option>
              <option>Limpeza de pele</option>
              <option>Quimica</option>
              <option>Detalhes</option>
            </select>
            <input name="duracao_minutos" type="number" min="5" step="5" placeholder="Duracao em minutos" required />
            <input name="preco" type="number" min="0" step="0.01" placeholder="Preco" required />
            <textarea name="descricao" placeholder="Descricao curta" rows="3"></textarea>
            <button className="primary" type="submit">Salvar servico</button>
          </form>
          <div className="admin-list">
            {services.map((service) => (
              <article key={service.id} className="service-admin-row">
                <div>
                  <span>{service.categoria}</span>
                  <strong>{service.nome}</strong>
                  <small>{duration(service.duracao_minutos)} - {money(service.preco)}</small>
                </div>
                <button type="button" className="ghost-button compact" onClick={() => removeService(service)}>Remover</button>
              </article>
            ))}
          </div>
        </AdminPanelGrid>
      )}
      {tab === "relatorios" && <ReportsPanel demo={demo} />}
      {tab === "comissoes" && <CommissionsPanel demo={demo} />}
    </section>
  );
}

function ClientsPanel({ demo }) {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");

  async function loadClients() {
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const result = await apiRequest(`/api/clientes${query ? `?busca=${encodeURIComponent(query)}` : ""}`);
      setClients(result);
    } catch {
      setClients([
        { id: 1, nome: "Rafael", telefone: "51999990000", email: "rafael@email.com" },
        { id: 2, nome: "Bruno", telefone: "51888880000", email: "" },
      ]);
      setNotice("Demo de clientes com dados simulados.");
    }
  }

  async function openClient(client) {
    try {
      if (demo) throw new Error("demo");
      setSelected(await apiRequest(`/api/clientes/${client.id}`));
    } catch {
      setSelected({
        ...client,
        estatisticas: { total_agendamentos: 3, atendimentos_concluidos: 2, total_pago: 120 },
        historico: demoAppointments.map((appointment) => ({
          id: appointment.id,
          inicio: `${today()}T${appointment.hora}:00-03:00`,
          servico_nome: appointment.servico,
          profissional_nome: "Studio Mazoni",
          status: appointment.status,
          pagamento_status: appointment.pago ? "pago" : "pendente",
          valor_pago: appointment.pago ? 35 : 0
        }))
      });
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <AdminPanelGrid>
      <div className="admin-form">
        <h3>Clientes</h3>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou telefone" />
        <button className="primary" type="button" onClick={loadClients}>Buscar</button>
        {notice && <p className="booking-status">{notice}</p>}
      </div>
      <div className="admin-list">
        {clients.map((client) => (
          <article key={client.id} className="admin-row">
            <div className="client-avatar">{client.nome.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{client.nome}</strong>
              <span>{client.telefone} {client.email ? `- ${client.email}` : ""}</span>
            </div>
            <button className="ghost-button compact" type="button" onClick={() => openClient(client)}>Historico</button>
          </article>
        ))}
        {selected && (
          <section className="client-history">
            <h3>{selected.nome}</h3>
            {(() => {
              const score = selected.score_confianca || (demo ? {
                pontos: selected.nome === "Rafael" ? 95 : 40,
                classificacao: selected.nome === "Rafael" ? "vip" : "risco_de_falta",
                acao_recomendada: selected.nome === "Rafael" ? "Prioridade para encaixe e retorno." : "Pedir confirmacao manual ou pagamento antecipado."
              } : null);
              if (!score) return null;
              
              const isVip = score.classificacao === "vip";
              const isRisco = score.classificacao === "risco_de_falta" || score.classificacao === "bloqueado_online";
              
              const style = {
                margin: "8px 0 12px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                background: isVip ? "#e8f5e9" : isRisco ? "#ffebee" : "#f7f4ee",
                color: isVip ? "#2e7d32" : isRisco ? "#c62828" : "#555",
                border: "1px solid currentColor"
              };
              
              return (
                <div style={style}>
                  Classificacao: {score.classificacao.replace("_", " ").toUpperCase()} · Pontuacao: {score.pontos}/100
                  <div style={{ fontWeight: "normal", fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>
                    Acao recomendada: {score.acao_recomendada}
                  </div>
                </div>
              );
            })()}
            <div className="history-stats">
              <span>{selected.estatisticas?.total_agendamentos || 0} agendamentos</span>
              <span>{selected.estatisticas?.atendimentos_concluidos || 0} concluidos</span>
              <span>{money(selected.estatisticas?.total_pago || 0)} recebido</span>
            </div>
            {selected.historico?.map((item) => (
              <article key={item.id} className="appointment-card">
                <time>{time(item.inicio)}</time>
                <strong>{item.servico_nome}</strong>
                <span>{item.profissional_nome || item.profissional_apelido}</span>
                <small>{item.status} - {item.pagamento_status} - {money(item.valor_pago)}</small>
              </article>
            ))}
          </section>
        )}
      </div>
    </AdminPanelGrid>
  );
}

function ReportsPanel({ demo }) {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [notice, setNotice] = useState("");

  async function loadReports() {
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const [resumo, lembretes] = await Promise.all([
        apiRequest(`/api/resumo?data=${date}`),
        apiRequest("/api/lembretes/retorno"),
      ]);
      setSummary(resumo);
      setReminders(lembretes);
    } catch {
      setSummary({ total: 18, concluidos: 10, faturamento: 615, recebido: 615, cancelados: 1, pagamentos_pendentes: 4 });
      setReminders([
        { agendamento_id: 1, cliente_nome: "Rafael", cliente_telefone: "51999990000", servico_nome: "Corte degrade", data_retorno: date, dias_restantes: 0 },
      ]);
      setNotice("Demo de relatorios com dados simulados.");
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="commission-panel">
      <div className="agenda-toolbar">
        <label>
          Data
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="ghost-button compact" type="button" onClick={loadReports}>Atualizar</button>
      </div>
      {notice && <div className="admin-notice">{notice}</div>}
      {summary && (
        <div className="commission-totals">
          <div><strong>{summary.total}</strong><span>marcados</span></div>
          <div><strong>{summary.concluidos}</strong><span>concluidos</span></div>
          <div><strong>{money(summary.recebido || summary.faturamento)}</strong><span>recebido</span></div>
          <div><strong>{summary.pagamentos_pendentes}</strong><span>pendentes</span></div>
        </div>
      )}
      <section className="pending-strip">
        <h3>Lembretes de retorno</h3>
        <div className="pending-list">
          {reminders.length ? reminders.map((item) => (
            <article key={item.agendamento_id} className="pending-card">
              <div>
                <time>{item.data_retorno}</time>
                <strong>{item.cliente_nome}</strong>
                <span>{item.servico_nome} - {item.cliente_telefone}</span>
              </div>
              <span>{Number(item.dias_restantes) <= 0 ? "Hoje/atrasado" : `${item.dias_restantes} dias`}</span>
            </article>
          )) : <div className="empty-column">Nenhum lembrete no periodo.</div>}
        </div>
      </section>
    </div>
  );
}

function CommissionsPanel({ demo }) {
  const [range, setRange] = useState({ inicio: today(), fim: today() });
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState("");

  async function loadCommissions() {
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const fim = new Date(`${range.fim}T00:00:00-03:00`);
      fim.setDate(fim.getDate() + 1);
      const fimIso = fim.toISOString();
      const result = await apiRequest(`/api/comissoes?inicio=${encodeURIComponent(`${range.inicio}T00:00:00-03:00`)}&fim=${encodeURIComponent(fimIso)}`);
      setSummary(result);
    } catch {
      setSummary({
        totais: { valor_recebido: 615, comissao_barbeiros: 180, repasse_dono: 435, atendimentos: 18 },
        profissionais: [
          { profissional_id: 2, profissional_nome: "Leo Mazoni", dono: true, atendimentos: 7, valor_recebido: 280, percentual_comissao: 0, comissao_barbeiro: 0, repasse_dono: 280 },
          { profissional_id: 1, profissional_nome: "Deryck", dono: false, atendimentos: 6, valor_recebido: 200, percentual_comissao: 50, comissao_barbeiro: 100, repasse_dono: 100 },
          { profissional_id: 3, profissional_nome: "Gustavo", dono: false, atendimentos: 5, valor_recebido: 135, percentual_comissao: 50, comissao_barbeiro: 67.5, repasse_dono: 67.5 },
        ]
      });
      setNotice("Demo de comissoes com dados simulados.");
    }
  }

  useEffect(() => {
    loadCommissions();
  }, []);

  return (
    <div className="commission-panel">
      <div className="agenda-toolbar">
        <label>
          Inicio
          <input type="date" value={range.inicio} onChange={(event) => setRange((current) => ({ ...current, inicio: event.target.value }))} />
        </label>
        <label>
          Fim
          <input type="date" value={range.fim} onChange={(event) => setRange((current) => ({ ...current, fim: event.target.value }))} />
        </label>
        <button className="ghost-button compact" type="button" onClick={loadCommissions}>Atualizar</button>
      </div>
      {notice && <div className="admin-notice">{notice}</div>}
      {summary && (
        <>
          <div className="commission-totals">
            <div><strong>{money(summary.totais.valor_recebido)}</strong><span>recebido</span></div>
            <div><strong>{money(summary.totais.comissao_barbeiros)}</strong><span>comissoes</span></div>
            <div><strong>{money(summary.totais.repasse_dono)}</strong><span>parte do Leo</span></div>
            <div><strong>{summary.totais.atendimentos}</strong><span>atendimentos</span></div>
          </div>
          <div className="admin-list">
            {summary.profissionais.map((item) => (
              <article key={item.profissional_id} className="service-admin-row">
                <div>
                  <span>{item.dono ? "Dono" : `${item.percentual_comissao}% comissao`}</span>
                  <strong>{item.profissional_nome}</strong>
                  <small>{item.atendimentos} atendimentos - recebido {money(item.valor_recebido)}</small>
                </div>
                <div className="commission-values">
                  <b>{money(item.comissao_barbeiro)}</b>
                  <small>barbeiro</small>
                  <b>{money(item.repasse_dono)}</b>
                  <small>Leo</small>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function localDateRange(date) {
  return {
    inicio: `${date}T00:00:00-03:00`,
    fim: `${date}T23:59:59-03:00`,
  };
}

function appointmentTime(appointment) {
  return appointment.hora || time(appointment.inicio);
}

function normalizeDemoAppointment(appointment, professional) {
  return {
    ...appointment,
    cliente_nome: appointment.cliente,
    servico_nome: appointment.servico,
    profissional_id: professional.id,
    pagamento_status: appointment.pago ? "pago" : "pendente",
    aprovacao_pendente: appointment.status === "agendado",
  };
}

function AgendaBoard({ professionals, demo }) {
  const [date, setDate] = useState(today());
  const [appointments, setAppointments] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState({});

  async function loadAppointments() {
    setLoading(true);
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const range = localDateRange(date);
      const [dayItems, pendingItems] = await Promise.all([
        apiRequest(`/api/agendamentos?inicio=${encodeURIComponent(range.inicio)}&fim=${encodeURIComponent(range.fim)}`),
        apiRequest("/api/agendamentos?aprovacao_pendente=true"),
      ]);
      setAppointments(dayItems);
      setPending(pendingItems);
    } catch {
      setAppointments(demoAppointments.map((item) => normalizeDemoAppointment(
        item,
        professionals.find((professional) => Number(professional.id) === Number(item.profissional_id)) || professionals[0],
      )));
      setPending(demoAppointments
        .filter((item) => item.status === "agendado")
        .map((item) => normalizeDemoAppointment(
          item,
          professionals.find((professional) => Number(professional.id) === Number(item.profissional_id)) || professionals[0],
        )));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [date, demo, professionals.length]);

  async function decide(appointment, action) {
    try {
      if (!demo) {
        const result = await apiRequest(`/api/agendamentos/${appointment.id}/${action}`, { method: "POST" });
        if (result?._whatsapp) {
          if (result._whatsapp.enviado) {
            setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "enviado" }));
          } else if (result._whatsapp.url) {
            setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "link_gerado" }));
            window.open(result._whatsapp.url, "_blank", "noopener,noreferrer");
          }
        }
      }
      setNotice(action === "aprovar" ? "Horario aprovado." : "Horario recusado.");
      await loadAppointments();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function reenviarWhatsapp(appointment, tipo = "confirmacao") {
    setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "enviando" }));
    try {
      if (demo) {
        setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "enviado" }));
        setNotice("Reenvio de WhatsApp simulado.");
        window.open(`https://wa.me/5551989849691?text=Ola%2C%20confirmamos%20seu%20horario`, "_blank");
        return;
      }
      const result = await apiRequest(`/api/agendamentos/${appointment.id}/whatsapp`, {
        method: "POST",
        body: { tipo }
      });
      if (result.enviado) {
        setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "enviado" }));
        setNotice("WhatsApp enviado com sucesso!");
      } else if (result.url) {
        setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "link_gerado" }));
        setNotice("Redirecionando para o WhatsApp Web...");
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setWhatsappStatus((prev) => ({ ...prev, [appointment.id]: "erro" }));
      setNotice(error.message);
    }
  }

  function byProfessional(list, professional) {
    return list.filter((appointment) => Number(appointment.profissional_id) === Number(professional.id));
  }

  return (
    <div className="agenda-board">
      <div className="agenda-toolbar">
        <label>
          Data da agenda
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="ghost-button compact" type="button" onClick={loadAppointments}>
          Atualizar
        </button>
        <span>{loading ? "Carregando..." : `${pending.length} pendentes`}</span>
      </div>
      {notice && <div className="admin-notice">{notice}</div>}
      {pending.length > 0 && (
        <section className="pending-strip">
          <h3>Reservas pendentes de aprovacao</h3>
          <div className="pending-list">
            {pending.map((appointment) => (
              <article key={appointment.id} className="pending-card">
                <div>
                  <time>{appointmentTime(appointment)}</time>
                  <strong>{appointment.cliente_nome}</strong>
                  <span>{appointment.servico_nome} - {appointment.profissional_nome || appointment.profissional_apelido || "Barbeiro"}</span>
                </div>
                <div className="pending-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="primary compact" onClick={() => decide(appointment, "aprovar")}>Aprovar</button>
                    <button type="button" className="ghost-button compact" onClick={() => decide(appointment, "recusar")}>Recusar</button>
                  </div>
                  {whatsappStatus[appointment.id] === "enviado" && <span style={{ fontSize: "11px", color: "#4caf81", fontWeight: "bold" }}>✓ WhatsApp Enviado</span>}
                  {whatsappStatus[appointment.id] === "link_gerado" && <span style={{ fontSize: "11px", color: "#8c6a2e", fontWeight: "bold" }}>⚠ Link gerado (wa.me)</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="barber-columns">
        {professionals.map((professional) => {
          const professionalAppointments = byProfessional(appointments, professional);
          return (
            <div className="barber-column" key={professional.id}>
              <header>
                <div className="barber-headline">
                  <ProfessionalPhoto professional={professional} />
                  <div>
                    <strong>{professional.apelido || professional.nome}</strong>
                    <span>{professionalAppointments.length} horarios</span>
                  </div>
                </div>
              </header>
              {professionalAppointments.length ? professionalAppointments.map((appointment) => (
                <article key={appointment.id} className={appointment.aprovacao_pendente ? "appointment-card pending" : "appointment-card"}>
                  <time>{appointmentTime(appointment)}</time>
                  <strong>{appointment.cliente_nome}</strong>
                  <span>{appointment.servico_nome}</span>
                  <small>{appointment.status} - {appointment.pagamento_status || "pendente"}</small>
                  {appointment.aprovacao_pendente ? (
                    <div className="inline-actions" style={{ marginTop: '8px' }}>
                      <button type="button" className="primary compact" onClick={() => decide(appointment, "aprovar")}>Aprovar</button>
                      <button type="button" className="ghost-button compact" onClick={() => decide(appointment, "recusar")}>Recusar</button>
                    </div>
                  ) : (
                    appointment.status !== 'cancelado' && (
                      <div className="inline-actions" style={{ marginTop: '8px', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {whatsappStatus[appointment.id] === "enviado" && <span style={{ fontSize: "10px", color: "#4caf81", fontWeight: "bold" }}>✓ WhatsApp Enviado</span>}
                          {whatsappStatus[appointment.id] === "link_gerado" && <span style={{ fontSize: "10px", color: "#8c6a2e", fontWeight: "bold" }}>⚠ Link wa.me</span>}
                          {whatsappStatus[appointment.id] === "enviando" && <span style={{ fontSize: "10px", color: "#888" }}>Enviando...</span>}
                        </div>
                        <button
                          type="button"
                          className="ghost-button compact"
                          style={{ width: 'auto', minHeight: '28px', padding: '0 8px', fontSize: '11px', margin: 0 }}
                          onClick={() => reenviarWhatsapp(appointment, "confirmacao")}
                          disabled={whatsappStatus[appointment.id] === "enviando"}
                        >
                          {whatsappStatus[appointment.id] === "enviado" ? "Reenviar WhatsApp" : "Enviar WhatsApp"}
                        </button>
                      </div>
                    )
                  )}
                </article>
              )) : (
                <div className="empty-column">Nenhum horario nesta data.</div>
              )}
              <button type="button" className="ghost-button">+ Encaixe rapido</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaitlistPanel({ demo }) {
  const [items, setItems] = useState([]);
  const [intelligentItems, setIntelligentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadWaitlist() {
    setLoading(true);
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const [geral, intel] = await Promise.all([
        apiRequest("/api/lista-espera"),
        apiRequest("/api/lista-espera/inteligente")
      ]);
      setItems(geral);
      setIntelligentItems(intel);
    } catch {
      setItems([
        { id: 1, nome: "Carlos Eduardo", telefone: "51988887777", servico_nome: "Corte degrade", profissional_nome: "Deryck", data_preferida: today(), periodo: "tarde", status: "aguardando" },
        { id: 2, nome: "Guilherme Santos", telefone: "51977776666", servico_nome: "Corte e Barba", profissional_nome: "Leo", data_preferida: today(), periodo: "noite", status: "aguardando" }
      ]);
      setIntelligentItems([
        { id: 1, nome: "Carlos Eduardo", telefone: "51988887777", servico_nome: "Corte degrade", profissional_nome: "Deryck", data_preferida: today(), periodo: "tarde", status: "aguardando", vaga_disponivel: true, horario_vaga: "14:00" }
      ]);
      setNotice("Demo de lista de espera conectada a dados simulados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWaitlist();
  }, []);

  async function changeStatus(id, newStatus) {
    try {
      if (!demo) {
        await apiRequest(`/api/lista-espera/${id}`, {
          method: "PATCH",
          body: { status: newStatus }
        });
      }
      setNotice(`Status atualizado para ${newStatus}.`);
      await loadWaitlist();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="waitlist-panel" style={{ display: 'grid', gap: '16px' }}>
      {notice && <div className="admin-notice">{notice}</div>}
      
      <section className="pending-strip" style={{ background: '#f0f9eb', borderColor: '#e1f3d8' }}>
        <h3 style={{ color: '#67c23a' }}>💡 Encaixes Inteligentes</h3>
        <p style={{ fontSize: '13px', color: '#606266', marginBottom: '10px' }}>
          Clientes na fila com barbeiro e serviço correspondentes a horários vagos recém-liberados na agenda:
        </p>
        <div className="pending-list">
          {intelligentItems.length ? intelligentItems.map((item) => (
            <article key={item.id} className="pending-card" style={{ borderColor: '#e1f3d8' }}>
              <div>
                <strong>{item.nome}</strong>
                <span>{item.servico_nome} com {item.profissional_nome || "Qualquer Barbeiro"}</span>
                <small>Preferencia: {item.data_preferida} ({item.periodo}) · Sugestão às {item.horario_vaga || "Horario livre"}</small>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a 
                  href={`https://wa.me/${String(item.telefone).replace(/\D/g, "")}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary compact" 
                  style={{ background: '#67c23a', color: '#fff', fontSize: '12px', minHeight: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  WhatsApp
                </a>
                <button type="button" className="ghost-button compact" style={{ fontSize: '12px', minHeight: '32px' }} onClick={() => changeStatus(item.id, "convertido")}>Reservar</button>
              </div>
            </article>
          )) : <div className="empty-column">Nenhum encaixe inteligente sugerido no momento.</div>}
        </div>
      </section>

      <AdminPanelGrid>
        <div className="admin-list" style={{ gridColumn: 'span 2' }}>
          <h3>Aguardando na Fila</h3>
          {items.map((item) => (
            <article key={item.id} className="admin-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', padding: '16px' }}>
              <div>
                <strong>{item.nome}</strong>
                <span style={{ fontSize: '13px', color: '#666' }}>WhatsApp: {item.telefone} · Preferência: {item.data_preferida} ({item.periodo})</span>
                <span style={{ fontSize: '13px', color: '#666' }}>Barbeiro: {item.profissional_nome || "Qualquer Barbeiro"} · Serviço: {item.servico_nome || "Qualquer"}</span>
                <small style={{ display: 'inline-block', marginTop: '4px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.status}
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button" className="ghost-button compact" onClick={() => changeStatus(item.id, "avisado")}>Avisar</button>
                <button type="button" className="ghost-button compact" onClick={() => changeStatus(item.id, "convertido")}>Reservar</button>
                <button type="button" className="ghost-button compact" style={{ color: '#e05555' }} onClick={() => changeStatus(item.id, "cancelado")}>Desistir</button>
              </div>
            </article>
          ))}
          {!items.length && <div className="empty-column">Nenhum cliente na lista de espera.</div>}
        </div>
      </AdminPanelGrid>
    </div>
  );
}

function RulesConfig({ rules, setRules, demo, setNotice }) {
  const [formData, setFormData] = useState({
    antecedencia_cancelamento_horas: 2,
    antecedencia_reagendamento_horas: 2,
    no_show_limite: 2,
    no_show_bloqueio_dias: 30,
    sinal_habilitado: false,
    sinal_percentual: 0,
  });

  useEffect(() => {
    if (rules) {
      setFormData(rules);
    }
  }, [rules]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (demo) {
        setNotice("Configuracoes salvas na demo simulada.");
        return;
      }
      const updated = await apiRequest("/api/regras-agendamento", {
        method: "PATCH",
        body: {
          antecedencia_cancelamento_horas: Number(formData.antecedencia_cancelamento_horas),
          antecedencia_reagendamento_horas: Number(formData.antecedencia_reagendamento_horas),
          no_show_limite: Number(formData.no_show_limite),
          no_show_bloqueio_dias: Number(formData.no_show_bloqueio_dias),
          sinal_habilitado: Boolean(formData.sinal_habilitado),
          sinal_percentual: Number(formData.sinal_percentual),
        }
      });
      setRules(updated);
      setNotice("Regras de agendamento salvas com sucesso.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ height: 'fit-content' }}>
      <h3>Configuração de Regras</h3>
      <label>
        Antecedência Cancelamento (horas)
        <input
          type="number"
          min="0"
          max="168"
          value={formData.antecedencia_cancelamento_horas}
          onChange={(e) => setFormData({ ...formData, antecedencia_cancelamento_horas: e.target.value })}
        />
      </label>
      <label>
        Antecedência Reagendamento (horas)
        <input
          type="number"
          min="0"
          max="168"
          value={formData.antecedencia_reagendamento_horas}
          onChange={(e) => setFormData({ ...formData, antecedencia_reagendamento_horas: e.target.value })}
        />
      </label>
      <label>
        Limite de No-Show
        <input
          type="number"
          min="0"
          max="20"
          value={formData.no_show_limite}
          onChange={(e) => setFormData({ ...formData, no_show_limite: e.target.value })}
        />
      </label>
      <label>
        Bloqueio de No-Show (dias)
        <input
          type="number"
          min="0"
          max="365"
          value={formData.no_show_bloqueio_dias}
          onChange={(e) => setFormData({ ...formData, no_show_bloqueio_dias: e.target.value })}
        />
      </label>
      <label className="switch-line">
        <input
          type="checkbox"
          checked={formData.sinal_habilitado}
          onChange={(e) => setFormData({ ...formData, sinal_habilitado: e.target.checked })}
        />
        Cobrar Sinal Antecipado
      </label>
      {formData.sinal_habilitado && (
        <label>
          Percentual do Sinal
          <select
            value={formData.sinal_percentual}
            onChange={(e) => setFormData({ ...formData, sinal_percentual: Number(e.target.value) })}
          >
            <option value={0}>0%</option>
            <option value={30}>30%</option>
            <option value={50}>50%</option>
          </select>
        </label>
      )}
      <button className="primary" type="submit">Salvar Regras</button>
    </form>
  );
}

function InventoryPanel({ demo }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [movementForm, setMovementForm] = useState({ tipo: "entrada", quantidade: 1, valor_unitario: 0, observacoes: "" });

  async function loadProducts() {
    setLoading(true);
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const result = await apiRequest("/api/produtos");
      setProducts(result);
    } catch {
      setProducts([
        { id: 1, nome: "Pomada Modeladora Efeito Seco", categoria: "Pomada", preco_venda: 45, custo_unitario: 20, estoque_atual: 15, estoque_minimo: 5, controla_estoque: true, observacoes: "Fixacao forte, efeito mate." },
        { id: 2, nome: "Oleo para Barba Wood & Spice", categoria: "Oleo", preco_venda: 60, custo_unitario: 28, estoque_atual: 3, estoque_minimo: 5, controla_estoque: true, observacoes: "Hidratacao e perfume amadeirado." },
        { id: 3, nome: "Shampoo de Cabelo e Barba 2 em 1", categoria: "Shampoo", preco_venda: 35, custo_unitario: 15, estoque_atual: 22, estoque_minimo: 10, controla_estoque: true, observacoes: "Uso diario para limpeza profunda." }
      ]);
      setNotice("Demo de estoque com dados simulados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function saveProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      categoria: form.get("categoria") || "Retail",
      preco_venda: Number(form.get("preco_venda")),
      custo_unitario: Number(form.get("custo_unitario")),
      estoque_atual: Number(form.get("estoque_atual")),
      estoque_minimo: Number(form.get("estoque_minimo")),
      controla_estoque: form.get("controla_estoque") === "on",
      observacoes: form.get("observacoes")
    };

    try {
      if (demo) {
        const mock = { ...payload, id: Date.now() };
        setProducts([...products, mock]);
        event.currentTarget.reset();
        setNotice("Produto criado com sucesso na demo.");
        return;
      }
      const saved = await apiRequest("/api/produtos", {
        method: "POST",
        body: payload
      });
      setProducts([...products, saved]);
      event.currentTarget.reset();
      setNotice("Produto cadastrado com sucesso.");
      await loadProducts();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function handleMovement(event) {
    event.preventDefault();
    if (!selectedProduct) return;
    try {
      if (demo) {
        const nextQty = movementForm.tipo === "entrada"
          ? selectedProduct.estoque_atual + Number(movementForm.quantidade)
          : Math.max(selectedProduct.estoque_atual - Number(movementForm.quantidade), 0);
        
        setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, estoque_atual: nextQty } : p));
        setNotice("Movimentacao registrada na demo.");
        setSelectedProduct(null);
        return;
      }
      await apiRequest(`/api/produtos/${selectedProduct.id}/movimentos`, {
        method: "POST",
        body: {
          tipo: movementForm.tipo,
          quantidade: Number(movementForm.quantidade),
          valor_unitario: Number(movementForm.valor_unitario || selectedProduct.custo_unitario),
          observacoes: movementForm.observacoes
        }
      });
      setNotice("Estoque movimentado com sucesso.");
      setSelectedProduct(null);
      await loadProducts();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="inventory-panel">
      {notice && <div className="admin-notice">{notice}</div>}

      <AdminPanelGrid>
        {/* Formulario lateral */}
        <div style={{ display: 'grid', gap: '14px', alignContent: 'start' }}>
          {!selectedProduct ? (
            <form className="admin-form" onSubmit={saveProduct}>
              <h3>Novo Produto</h3>
              <input name="nome" placeholder="Nome do produto" required />
              <input name="categoria" placeholder="Categoria (Ex: Pomada, Oleo)" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input name="preco_venda" type="number" step="0.01" placeholder="Venda (R$)" required />
                <input name="custo_unitario" type="number" step="0.01" placeholder="Custo (R$)" required />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input name="estoque_atual" type="number" placeholder="Estoque Inicial" defaultValue="0" required />
                <input name="estoque_minimo" type="number" placeholder="Estoque Minimo" defaultValue="5" required />
              </div>
              <label className="switch-line">
                <input name="controla_estoque" type="checkbox" defaultChecked />
                Controlar estoque
              </label>
              <textarea name="observacoes" placeholder="Observacoes" rows="2"></textarea>
              <button className="primary" type="submit">Cadastrar Produto</button>
            </form>
          ) : (
            <form className="admin-form" onSubmit={handleMovement}>
              <h3>Movimentar Estoque</h3>
              <p style={{ fontSize: '13px', color: '#666' }}>Produto: <strong>{selectedProduct.nome}</strong></p>
              <p style={{ fontSize: '12px', color: '#888' }}>Estoque atual: {selectedProduct.estoque_atual} unidades</p>
              
              <label>
                Tipo de movimentacao
                <select 
                  value={movementForm.tipo} 
                  onChange={(e) => setMovementForm({ ...movementForm, tipo: e.target.value })}
                >
                  <option value="entrada">Entrada (Compra/Reposicao)</option>
                  <option value="saida">Saida (Ajuste/Perda/Uso)</option>
                  <option value="ajuste">Ajuste de Estoque</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{ flex: 1 }}>
                  Quantidade
                  <input 
                    type="number" 
                    min="1" 
                    value={movementForm.quantidade} 
                    onChange={(e) => setMovementForm({ ...movementForm, quantidade: e.target.value })} 
                    required 
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Valor Unit. (R$)
                  <input 
                    type="number" 
                    step="0.01" 
                    value={movementForm.valor_unitario} 
                    onChange={(e) => setMovementForm({ ...movementForm, valor_unitario: e.target.value })} 
                  />
                </label>
              </div>

              <textarea 
                placeholder="Observacoes/Motivo" 
                rows="2"
                value={movementForm.observacoes} 
                onChange={(e) => setMovementForm({ ...movementForm, observacoes: e.target.value })}
              ></textarea>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="primary" type="submit" style={{ flex: 1 }}>Registrar</button>
                <button className="ghost-button compact" type="button" style={{ flex: 1 }} onClick={() => setSelectedProduct(null)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>

        {/* Tabela de produtos */}
        <div className="admin-list" style={{ display: 'grid', gap: '12px' }}>
          <h3>Itens no Inventario</h3>
          {products.map(prod => {
            const isLowStock = prod.controla_estoque && prod.estoque_atual <= prod.estoque_minimo;
            return (
              <article 
                key={prod.id} 
                className="admin-row" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  borderLeft: isLowStock ? '5px solid #e05555' : '5px solid #d7b46a'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c6a2e', fontWeight: 'bold' }}>{prod.categoria}</span>
                    {isLowStock && (
                      <span style={{ background: '#ffebee', color: '#c62828', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Estoque Baixo</span>
                    )}
                  </div>
                  <strong style={{ fontSize: '15px', display: 'block', marginTop: '2px' }}>{prod.nome}</strong>
                  <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                    Preco: {money(prod.preco_venda)} · Custo: {money(prod.custo_unitario)}
                  </small>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Qtd: <span style={{ fontSize: '18px', color: isLowStock ? '#e05555' : '#111' }}>{prod.estoque_atual}</span> / {prod.estoque_minimo} (min)
                  </div>
                  <button 
                    type="button" 
                    className="ghost-button compact" 
                    style={{ width: 'auto', minHeight: '30px', fontSize: '12px', padding: '0 10px' }}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setMovementForm({ tipo: "entrada", quantidade: 1, valor_unitario: prod.custo_unitario, observacoes: "" });
                    }}
                  >
                    Movimentar
                  </button>
                </div>
              </article>
            );
          })}
          {!products.length && <div className="empty-column">Nenhum produto cadastrado no inventario.</div>}
        </div>
      </AdminPanelGrid>
    </div>
  );
}

function PackagesPanel({ demo, services }) {
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState("pacotes"); // "pacotes" ou "titulares"
  const [buyers, setBuyers] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadPackages() {
    setLoading(true);
    setNotice("");
    try {
      if (demo) throw new Error("demo");
      const result = await apiRequest("/api/pacotes?incluir_inativos=true");
      setPackages(result);
    } catch {
      setPackages([
        { id: 1, nome: "PLANO CORTE", valor: 120, quantidade_sessoes: 4, servico_nome: "Corte degrade", descricao: "4 cortes no mes (1 corte por semana).", ativo: true },
        { id: 2, nome: "PLANO BARBA", valor: 85, quantidade_sessoes: 4, servico_nome: "Barba", descricao: "4 barbas no mes (1x por semana).", ativo: true },
        { id: 3, nome: "PLANO LUXO", valor: 160, quantidade_sessoes: 4, servico_nome: "Corte e Barba", descricao: "4 cortes simples + 4 barbas no mes.", ativo: true },
        { id: 4, nome: "PLANO GOLD", valor: 220, quantidade_sessoes: 6, servico_nome: "Combo", descricao: "Plano combo especial com desconto.", ativo: true },
        { id: 5, nome: "PLANO PREMIUM", valor: 240, quantidade_sessoes: 10, servico_nome: "Combo", descricao: "Corte ilimitado no mes ou maximo 10 sessoes.", ativo: true }
      ]);
      setNotice("Demo de pacotes com dados simulados.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBuyers() {
    try {
      if (demo) throw new Error("demo");
      setBuyers([
        { id: 1, cliente_nome: "Rafael", pacote_nome: "PLANO CORTE", sessoes_restantes: 3, sessoes_totais: 4, pago: true, criado_em: today() },
        { id: 2, cliente_nome: "Bruno", pacote_nome: "PLANO BARBA", sessoes_restantes: 4, sessoes_totais: 4, pago: false, criado_em: today() }
      ]);
    } catch {
      setBuyers([
        { id: 1, cliente_nome: "Rafael", pacote_nome: "PLANO CORTE", sessoes_restantes: 3, sessoes_totais: 4, pago: true, criado_em: today() },
        { id: 2, cliente_nome: "Bruno", pacote_nome: "PLANO BARBA", sessoes_restantes: 4, sessoes_totais: 4, pago: false, criado_em: today() }
      ]);
    }
  }

  useEffect(() => {
    loadPackages();
    loadBuyers();
  }, []);

  async function savePackage(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: form.get("nome"),
      descricao: form.get("descricao"),
      valor: Number(form.get("valor")),
      quantidade_sessoes: Number(form.get("quantidade_sessoes")),
      servico_id: Number(form.get("servico_id")),
      validade_dias: Number(form.get("validade_dias") || 30)
    };

    try {
      if (demo) {
        const mock = { ...payload, id: Date.now(), servico_nome: services.find(s => s.id === payload.servico_id)?.nome || "Servico", ativo: true };
        setPackages([...packages, mock]);
        event.currentTarget.reset();
        setNotice("Plano criado com sucesso na demo.");
        return;
      }
      const saved = await apiRequest("/api/pacotes", {
        method: "POST",
        body: payload
      });
      setPackages([...packages, saved]);
      event.currentTarget.reset();
      setNotice("Plano criado com sucesso.");
      await loadPackages();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function togglePackage(pkg) {
    try {
      if (!demo) {
        await apiRequest(`/api/pacotes/${pkg.id}`, {
          method: "PATCH",
          body: { ativo: !pkg.ativo }
        });
      }
      setPackages(packages.map(p => p.id === pkg.id ? { ...p, ativo: !p.ativo } : p));
      setNotice("Plano atualizado.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="packages-panel">
      <div className="admin-tabs" style={{ background: '#f7f4ee', border: '1px solid #ddd5c6', borderRadius: '12px', padding: '4px', display: 'flex', gap: '4px', marginBottom: '16px' }}>
        <button type="button" className={activeTab === "pacotes" ? "active" : ""} style={{ flex: 1, borderRadius: '8px', padding: '8px', border: 0 }} onClick={() => setActiveTab("pacotes")}>Pacotes</button>
        <button type="button" className={activeTab === "titulares" ? "active" : ""} style={{ flex: 1, borderRadius: '8px', padding: '8px', border: 0 }} onClick={() => setActiveTab("titulares")}>Titulares / Clientes</button>
      </div>

      {notice && <div className="admin-notice">{notice}</div>}

      {activeTab === "pacotes" ? (
        <AdminPanelGrid>
          <form className="admin-form" onSubmit={savePackage}>
            <h3>Criar novo Pacote</h3>
            <input name="nome" placeholder="Nome do plano (Ex: PLANO CORTE)" required />
            <textarea name="descricao" placeholder="Descricao (Ex: 4 cortes no mes)" rows="2"></textarea>
            <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" required />
            <input name="quantidade_sessoes" type="number" min="1" placeholder="Qtd. de sessoes inclusas" required />
            <select name="servico_id" required>
              <option value="">Selecione o servico base</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.nome} - {money(s.preco)}</option>
              ))}
            </select>
            <input name="validade_dias" type="number" min="1" placeholder="Validade em dias" defaultValue="30" />
            <button className="primary" type="submit">Salvar Pacote</button>
          </form>

          <div className="admin-list" style={{ display: 'grid', gap: '12px' }}>
            <h3>Pacotes Cadastrados</h3>
            {packages.map(pkg => (
              <article key={pkg.id} className="admin-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderLeft: '5px solid #d7b46a' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#111', color: '#d7b46a', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>⚡</span>
                    <strong style={{ fontSize: '16px' }}>{pkg.nome}</strong>
                  </div>
                  <span style={{ fontSize: '13px', color: '#666', display: 'block', marginTop: '4px' }}>{pkg.descricao}</span>
                  <small style={{ color: '#8c6a2e', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
                    {pkg.quantidade_sessoes} atendimentos inclusos de {pkg.servico_nome}
                  </small>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <strong style={{ fontSize: '20px', color: '#111' }}>{money(pkg.valor)}</strong>
                  <button type="button" className="ghost-button compact" onClick={() => togglePackage(pkg)}>
                    {pkg.ativo ? "Pausar" : "Ativar"}
                  </button>
                </div>
              </article>
            ))}
            {!packages.length && <div className="empty-column">Nenhum pacote cadastrado.</div>}
          </div>
        </AdminPanelGrid>
      ) : (
        <div className="admin-list" style={{ display: 'grid', gap: '12px' }}>
          <h3>Clientes Titulares de Pacotes</h3>
          {buyers.map(b => (
            <article key={b.id} className="admin-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
              <div>
                <strong>{b.cliente_nome}</strong>
                <span>Pacote: {b.pacote_nome}</span>
                <small style={{ color: '#8c6a2e', fontWeight: 'bold' }}>
                  Restam {b.sessoes_restantes} de {b.sessoes_totais} sessoes contratadas
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${b.pago ? "confirmado" : "cancelado"}`} style={{ padding: '4px 10px', borderRadius: '100px', display: 'inline-block' }}>
                  {b.pago ? "Pago" : "Pagamento Pendente"}
                </span>
                <span style={{ display: 'block', fontSize: '12px', color: '#888', marginTop: '6px' }}>Comprado em: {b.criado_em}</span>
              </div>
            </article>
          ))}
          {!buyers.length && <div className="empty-column">Nenhum cliente ativo possui pacote contratado.</div>}
        </div>
      )}
    </div>
  );
}

function AdminPanelGrid({ children }) {
  return <div className="admin-panel-grid">{children}</div>;
}

function weekdayName(day) {
  return ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"][Number(day) - 1] || "Dia";
}

function ProfessionalPhoto({ professional }) {
  const fallback = (professional.apelido || professional.nome || "M").slice(0, 1).toUpperCase();
  if (!professional.foto_url) {
    return <span className="professional-photo fallback">{fallback}</span>;
  }
  return (
    <span className="professional-photo">
      <img src={professional.foto_url} alt={`Foto de ${professional.nome}`} loading="lazy" />
    </span>
  );
}

createRoot(document.getElementById("root")).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
