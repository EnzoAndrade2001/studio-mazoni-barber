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

  useEffect(() => {
    loadInitialData().then((loaded) => {
      setData(loaded);
      setProfessionalId(loaded.professionals[0]?.id || 1);
      setServiceId(loaded.services[0]?.id || 1);
    });
  }, []);

  useEffect(() => {
    if (data.demo) return;
    api("/api/horarios-funcionamento")
      .then(setBusinessHours)
      .catch(() => setBusinessHours(demoBusinessHours));
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

      <section id="servicos" className="services-section">
        <div className="section-heading">
          <p className="eyebrow dark">Servicos</p>
          <h2>Precos e duracoes importados da base atual da barbearia.</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.id} className="service-card">
              <span>{service.categoria}</span>
              <h3>{service.nome}</h3>
              <p>{service.descricao}</p>
              <div>
                <strong>{money(service.preco)}</strong>
                <small>{duration(service.duracao_minutos)}</small>
              </div>
            </article>
          ))}
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

function AdminPanel({ data, setData, businessHours, setBusinessHours }) {
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
          ["clientes", "Clientes"],
          ["barbeiros", "Barbeiros"],
          ["jornada", "Horarios"],
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
