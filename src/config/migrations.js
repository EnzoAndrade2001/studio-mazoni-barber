const { pool } = require('./database');

const schema = `
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(160),
    preferencias JSONB NOT NULL DEFAULT '{}'::jsonb,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS clientes_telefone_ativo_idx
    ON clientes (telefone) WHERE ativo = TRUE;

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email VARCHAR(160);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS preferencias JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS servicos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(60) NOT NULL DEFAULT 'Barbearia',
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos BETWEEN 15 AND 480),
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE servicos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS categoria VARCHAR(60) NOT NULL DEFAULT 'Barbearia';

CREATE TABLE IF NOT EXISTS profissionais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    apelido VARCHAR(60),
    bio TEXT,
    dono BOOLEAN NOT NULL DEFAULT FALSE,
    comissao_percentual NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (comissao_percentual BETWEEN 0 AND 100),
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS dono BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS comissao_percentual NUMERIC(5, 2) NOT NULL DEFAULT 50;

CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    servico_id BIGINT NOT NULL REFERENCES servicos(id),
    profissional_id BIGINT REFERENCES profissionais(id),
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'agendado'
        CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado', 'faltou')),
    pagamento_status VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (pagamento_status IN ('pendente', 'parcial', 'pago', 'reembolsado', 'cancelado')),
    forma_pagamento VARCHAR(30),
    valor_pago NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (valor_pago >= 0),
    tipo_cobranca VARCHAR(30) NOT NULL DEFAULT 'pagar_na_hora'
        CHECK (tipo_cobranca IN ('sinal_30', 'sinal_50', 'total', 'pagar_na_hora')),
    percentual_sinal INTEGER NOT NULL DEFAULT 0 CHECK (percentual_sinal IN (0, 30, 50, 100)),
    valor_sinal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (valor_sinal >= 0),
    saldo_restante NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (saldo_restante >= 0),
    metodo_pagamento_preferido VARCHAR(30) NOT NULL DEFAULT 'pix_manual'
        CHECK (metodo_pagamento_preferido IN ('pix_online', 'cartao_online', 'pix_manual', 'dinheiro')),
    origem_publica BOOLEAN NOT NULL DEFAULT FALSE,
    aprovacao_pendente BOOLEAN NOT NULL DEFAULT FALSE,
    confirmado_em TIMESTAMPTZ,
    pago_em TIMESTAMPTZ,
    encaixe BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_encaixe VARCHAR(300),
    lembrete_retorno_em DATE,
    lembrete_retorno_observacoes VARCHAR(300),
    lembrete_retorno_concluido BOOLEAN NOT NULL DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (fim > inicio)
);

ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS pagamento_status VARCHAR(20) NOT NULL DEFAULT 'pendente';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS profissional_id BIGINT REFERENCES profissionais(id);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(30);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS tipo_cobranca VARCHAR(30) NOT NULL DEFAULT 'pagar_na_hora';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS percentual_sinal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS valor_sinal NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS saldo_restante NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS metodo_pagamento_preferido VARCHAR(30) NOT NULL DEFAULT 'pix_manual';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS origem_publica BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS aprovacao_pendente BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS confirmado_em TIMESTAMPTZ;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS encaixe BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS motivo_encaixe VARCHAR(300);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS lembrete_retorno_em DATE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS lembrete_retorno_observacoes VARCHAR(300);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS lembrete_retorno_concluido BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS agendamentos_inicio_idx ON agendamentos (inicio);
CREATE INDEX IF NOT EXISTS agendamentos_cliente_idx ON agendamentos (cliente_id);
CREATE INDEX IF NOT EXISTS agendamentos_profissional_inicio_idx ON agendamentos (profissional_id, inicio);
CREATE INDEX IF NOT EXISTS agendamentos_pagamento_status_idx ON agendamentos (pagamento_status);
CREATE INDEX IF NOT EXISTS agendamentos_lembrete_retorno_idx
    ON agendamentos (lembrete_retorno_em) WHERE lembrete_retorno_em IS NOT NULL;

UPDATE agendamentos
SET saldo_restante = GREATEST(preco - valor_pago, 0)
WHERE saldo_restante = 0 AND valor_pago < preco;

CREATE TABLE IF NOT EXISTS pagamentos (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    provedor VARCHAR(30) NOT NULL DEFAULT 'manual',
    metodo VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'parcial', 'pago', 'reembolsado', 'cancelado', 'falhou')),
    tipo VARCHAR(30) NOT NULL DEFAULT 'total'
        CHECK (tipo IN ('sinal', 'total', 'saldo', 'manual')),
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    mercado_pago_preference_id VARCHAR(120),
    mercado_pago_payment_id VARCHAR(120),
    asaas_payment_id VARCHAR(120),
    checkout_url TEXT,
    sandbox_checkout_url TEXT,
    payload JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'total';
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(120);

CREATE INDEX IF NOT EXISTS pagamentos_agendamento_idx ON pagamentos (agendamento_id);
CREATE UNIQUE INDEX IF NOT EXISTS pagamentos_mp_preference_idx
    ON pagamentos (mercado_pago_preference_id) WHERE mercado_pago_preference_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pagamentos_mp_payment_idx
    ON pagamentos (mercado_pago_payment_id) WHERE mercado_pago_payment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pagamentos_asaas_payment_idx
    ON pagamentos (asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS repasses (
    id BIGSERIAL PRIMARY KEY,
    provedor VARCHAR(30) NOT NULL DEFAULT 'asaas',
    valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
    pix_chave_tipo VARCHAR(20) NOT NULL,
    pix_chave_mascarada VARCHAR(160) NOT NULL,
    descricao VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    asaas_transfer_id VARCHAR(120),
    payload JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS repasses_asaas_transfer_idx
    ON repasses (asaas_transfer_id) WHERE asaas_transfer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS regras_agendamento (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    antecedencia_cancelamento_horas INTEGER NOT NULL DEFAULT 2 CHECK (antecedencia_cancelamento_horas BETWEEN 0 AND 168),
    antecedencia_reagendamento_horas INTEGER NOT NULL DEFAULT 2 CHECK (antecedencia_reagendamento_horas BETWEEN 0 AND 168),
    no_show_limite INTEGER NOT NULL DEFAULT 2 CHECK (no_show_limite BETWEEN 0 AND 20),
    no_show_bloqueio_dias INTEGER NOT NULL DEFAULT 30 CHECK (no_show_bloqueio_dias BETWEEN 0 AND 365),
    sinal_habilitado BOOLEAN NOT NULL DEFAULT FALSE,
    sinal_percentual INTEGER NOT NULL DEFAULT 0 CHECK (sinal_percentual IN (0, 30, 50)),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO regras_agendamento (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS lista_espera (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT REFERENCES clientes(id),
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    servico_id BIGINT REFERENCES servicos(id),
    profissional_id BIGINT REFERENCES profissionais(id),
    data_preferida DATE,
    periodo VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'aguardando'
        CHECK (status IN ('aguardando', 'avisado', 'convertido', 'cancelado')),
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lista_espera_status_idx ON lista_espera (status, data_preferida);
CREATE INDEX IF NOT EXISTS lista_espera_telefone_idx ON lista_espera (telefone);

CREATE TABLE IF NOT EXISTS bloqueios (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT REFERENCES profissionais(id),
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ NOT NULL,
    motivo VARCHAR(200),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (fim > inicio)
);

ALTER TABLE bloqueios ADD COLUMN IF NOT EXISTS profissional_id BIGINT REFERENCES profissionais(id);
CREATE INDEX IF NOT EXISTS bloqueios_profissional_idx ON bloqueios (profissional_id) WHERE profissional_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bloqueios_inicio_idx ON bloqueios (inicio);

CREATE TABLE IF NOT EXISTS configuracoes (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    intervalo_minutos INTEGER NOT NULL DEFAULT 30 CHECK (intervalo_minutos BETWEEN 5 AND 120),
    horario_abertura TIME NOT NULL DEFAULT '09:00',
    horario_fechamento TIME NOT NULL DEFAULT '20:00',
    dias_funcionamento SMALLINT[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6],
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    dia_semana SMALLINT PRIMARY KEY CHECK (dia_semana BETWEEN 1 AND 7),
    aberto BOOLEAN NOT NULL DEFAULT TRUE,
    abertura TIME NOT NULL,
    fechamento TIME NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (fechamento > abertura)
);

INSERT INTO horarios_funcionamento (dia_semana, aberto, abertura, fechamento)
VALUES
    (1, TRUE, '13:30', '20:00'),
    (2, TRUE, '09:00', '20:00'),
    (3, TRUE, '09:00', '20:00'),
    (4, TRUE, '09:00', '20:00'),
    (5, TRUE, '09:00', '20:00'),
    (6, TRUE, '09:00', '20:00'),
    (7, FALSE, '09:00', '20:00')
ON CONFLICT (dia_semana) DO UPDATE SET
    aberto = EXCLUDED.aberto,
    abertura = EXCLUDED.abertura,
    fechamento = EXCLUDED.fechamento,
    atualizado_em = NOW();

CREATE TABLE IF NOT EXISTS negocio_configuracoes (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nome VARCHAR(120),
    nome_curto VARCHAR(40),
    proprietaria VARCHAR(80),
    inicial VARCHAR(2),
    segmento VARCHAR(120),
    subtitulo VARCHAR(240),
    regiao VARCHAR(120),
    frase_agendamento VARCHAR(240),
    local_titulo VARCHAR(160),
    local_descricao VARCHAR(240),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO negocio_configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    categoria VARCHAR(60) NOT NULL DEFAULT 'Retail',
    preco_venda NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (preco_venda >= 0),
    custo_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (custo_unitario >= 0),
    estoque_atual INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
    estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
    controla_estoque BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS produtos_ativo_nome_idx ON produtos (ativo, nome);
CREATE INDEX IF NOT EXISTS produtos_estoque_baixo_idx ON produtos (ativo, estoque_atual, estoque_minimo);

CREATE TABLE IF NOT EXISTS produto_movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'venda', 'ajuste')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (valor_unitario >= 0),
    agendamento_id BIGINT REFERENCES agendamentos(id),
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS produto_movimentacoes_produto_idx ON produto_movimentacoes (produto_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS produto_movimentacoes_agendamento_idx ON produto_movimentacoes (agendamento_id);

ALTER TABLE configuracoes
    ALTER COLUMN horario_abertura SET DEFAULT '09:00';

ALTER TABLE configuracoes
    ALTER COLUMN horario_fechamento SET DEFAULT '20:00';

UPDATE configuracoes
SET horario_abertura = '09:00',
    horario_fechamento = '20:00',
    atualizado_em = NOW()
WHERE id = 1
  AND horario_fechamento <> TIME '20:00';

ALTER TABLE configuracoes
    ALTER COLUMN dias_funcionamento SET DEFAULT ARRAY[1,2,3,4,5,6];

UPDATE configuracoes
SET dias_funcionamento = ARRAY[1,2,3,4,5,6],
    atualizado_em = NOW()
WHERE id = 1
  AND (7 = ANY(dias_funcionamento) OR NOT (6 = ANY(dias_funcionamento)));

CREATE TEMP TABLE IF NOT EXISTS profissionais_base_padrao (
    nome VARCHAR(100),
    apelido VARCHAR(60),
    bio TEXT,
    dono BOOLEAN,
    comissao_percentual NUMERIC(5, 2),
    ordem INTEGER
);

TRUNCATE profissionais_base_padrao;

INSERT INTO profissionais_base_padrao (nome, apelido, bio, dono, comissao_percentual, ordem)
VALUES
    ('Deryck', 'Deryck', 'Barbeiro do Studio Mazoni Barber.', FALSE, 50.00, 1),
    ('Leo Mazoni', 'Leo', 'Dono e barbeiro do Studio Mazoni Barber.', TRUE, 0.00, 2),
    ('Gustavo', 'Gustavo', 'Barbeiro do Studio Mazoni Barber.', FALSE, 50.00, 3);

UPDATE profissionais p
SET apelido = b.apelido,
    bio = b.bio,
    dono = b.dono,
    comissao_percentual = b.comissao_percentual,
    ordem = b.ordem,
    ativo = TRUE,
    atualizado_em = NOW()
FROM profissionais_base_padrao b
WHERE LOWER(p.nome) = LOWER(b.nome);

INSERT INTO profissionais (nome, apelido, bio, dono, comissao_percentual, ordem, ativo)
SELECT b.nome, b.apelido, b.bio, b.dono, b.comissao_percentual, b.ordem, TRUE
FROM profissionais_base_padrao b
WHERE NOT EXISTS (
    SELECT 1 FROM profissionais p WHERE LOWER(p.nome) = LOWER(b.nome)
);

UPDATE agendamentos
SET profissional_id = (SELECT id FROM profissionais WHERE ativo = TRUE ORDER BY ordem, nome LIMIT 1)
WHERE profissional_id IS NULL;

CREATE TEMP TABLE IF NOT EXISTS servicos_base_padrao (
    nome VARCHAR(100),
    descricao TEXT,
    categoria VARCHAR(60),
    duracao_minutos INTEGER,
    preco NUMERIC(10, 2)
);

TRUNCATE servicos_base_padrao;

INSERT INTO servicos_base_padrao (nome, descricao, categoria, duracao_minutos, preco)
VALUES
    ('Corte degrade', 'Corte degrade com acabamento alinhado ao estilo do cliente.', 'Hair', 30, 35.00),
    ('Corte e Barba', 'Combo classico com corte, barba e finalizacao.', 'Combo', 60, 55.00),
    ('Combo', 'Combo completo do Studio Mazoni Barber para renovar o visual.', 'Combo', 65, 65.00),
    ('Sobrancelha', 'Acabamento rapido para alinhar a expressao.', 'Detalhes', 5, 10.00),
    ('Barba', 'Modelagem e acabamento de barba.', 'Barba', 30, 25.00),
    ('Limpeza de pele', 'Cuidado facial para complementar o atendimento.', 'Limpeza de pele', 30, 40.00);

UPDATE servicos s
SET nome = p.nome,
    descricao = p.descricao,
    categoria = p.categoria,
    duracao_minutos = p.duracao_minutos,
    preco = p.preco,
    ativo = TRUE,
    atualizado_em = NOW()
FROM servicos_base_padrao p
WHERE LOWER(s.nome) = LOWER(p.nome);

INSERT INTO servicos (nome, descricao, categoria, duracao_minutos, preco, ativo)
SELECT p.nome, p.descricao, p.categoria, p.duracao_minutos, p.preco, TRUE
FROM servicos_base_padrao p
WHERE NOT EXISTS (
    SELECT 1 FROM servicos s WHERE LOWER(s.nome) = LOWER(p.nome)
);

UPDATE servicos
SET ativo = FALSE,
    atualizado_em = NOW()
WHERE LOWER(nome) NOT IN (
    SELECT LOWER(nome) FROM servicos_base_padrao
);

CREATE TABLE IF NOT EXISTS pacotes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    quantidade_sessoes INTEGER NOT NULL CHECK (quantidade_sessoes > 0),
    servico_id BIGINT REFERENCES servicos(id) ON DELETE SET NULL,
    validade_dias INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pacote_clientes (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    pacote_id BIGINT NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
    sessoes_restantes INTEGER NOT NULL,
    sessoes_totais INTEGER NOT NULL,
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pacote_clientes_cliente_idx ON pacote_clientes (cliente_id);

INSERT INTO pacotes (nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias)
SELECT 'PLANO CORTE', '4 cortes no mes (1 corte por semana). Economia e estilo garantidos.', 120.00, 4, (SELECT id FROM servicos WHERE nome = 'Corte degrade' LIMIT 1), 30
WHERE NOT EXISTS (SELECT 1 FROM pacotes WHERE nome = 'PLANO CORTE');

INSERT INTO pacotes (nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias)
SELECT 'PLANO BARBA', '4 barbas no mes (1x por semana). Barba sempre alinhada e hidratada.', 85.00, 4, (SELECT id FROM servicos WHERE nome = 'Barba' LIMIT 1), 30
WHERE NOT EXISTS (SELECT 1 FROM pacotes WHERE nome = 'PLANO BARBA');

INSERT INTO pacotes (nome, descricao, valor, quantidade_sessoes, servico_id, validade_dias)
SELECT 'PLANO LUXO', '4 cortes simples + 4 barbas no mes. O cuidado completo que voce merece.', 160.00, 4, (SELECT id FROM servicos WHERE nome = 'Corte e Barba' LIMIT 1), 30
WHERE NOT EXISTS (SELECT 1 FROM pacotes WHERE nome = 'PLANO LUXO');

DROP TABLE IF EXISTS servicos_base_padrao;
DROP TABLE IF EXISTS profissionais_base_padrao;
`;

async function executarMigracoes() {
    await pool.query(schema);
    console.log('Estrutura do banco verificada.');
}

module.exports = { executarMigracoes };
