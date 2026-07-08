const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PREVIEW_PORT || 3200);
const HOST = process.env.PREVIEW_HOST || '127.0.0.1';
const root = path.join(__dirname, '..', 'public');
const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const profissionais = [
    { id: 1, nome: 'Deryck', apelido: 'Deryck', bio: 'Barbeiro do Studio Mazoni Barber.', ordem: 1, ativo: true },
    { id: 2, nome: 'Leo Mazoni', apelido: 'Leo', bio: 'Barbeiro e referencia do Studio Mazoni Barber.', ordem: 2, ativo: true },
    { id: 3, nome: 'Gustavo', apelido: 'Gustavo', bio: 'Barbeiro do Studio Mazoni Barber.', ordem: 3, ativo: true }
];

const servicos = [
    { id: 1, nome: 'Corte degrade', descricao: 'Corte degrade com acabamento alinhado ao estilo do cliente.', categoria: 'Hair', duracao_minutos: 30, preco: 35 },
    { id: 2, nome: 'Corte e Barba', descricao: 'Combo classico com corte, barba e finalizacao.', categoria: 'Combo', duracao_minutos: 60, preco: 55 },
    { id: 3, nome: 'Combo', descricao: 'Combo completo do Studio Mazoni Barber para renovar o visual.', categoria: 'Combo', duracao_minutos: 65, preco: 65 },
    { id: 4, nome: 'Sobrancelha', descricao: 'Acabamento rapido para alinhar a expressao.', categoria: 'Detalhes', duracao_minutos: 5, preco: 10 },
    { id: 5, nome: 'Barba', descricao: 'Modelagem e acabamento de barba.', categoria: 'Barba', duracao_minutos: 30, preco: 25 },
    { id: 6, nome: 'Limpeza de pele', descricao: 'Cuidado facial para complementar o atendimento.', categoria: 'Limpeza de pele', duracao_minutos: 30, preco: 40 }
];

const clientes = [
    { id: 1, nome: 'Marcos Silva', telefone: '51999887766', email: 'marcos@email.com' },
    { id: 2, nome: 'Rafael Costa', telefone: '51988776655', email: '' },
    { id: 3, nome: 'Pedro Almeida', telefone: '51977665544', email: 'pedro@email.com' }
];

function dayParam(url) {
    return (url.searchParams.get('inicio') || new Date().toISOString()).slice(0, 10);
}

function isoAt(date, hour) {
    return `${date}T${hour}:00-03:00`;
}

function demoAppointments(date) {
    return [
        {
            id: 101,
            cliente_id: 1,
            cliente_nome: 'Marcos Silva',
            cliente_telefone: '51999887766',
            servico_id: 1,
            servico_nome: 'Corte degrade',
            profissional_id: 1,
            profissional_nome: 'Deryck',
            inicio: isoAt(date, '09:00'),
            fim: isoAt(date, '09:30'),
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
            profissional_nome: 'Leo Mazoni',
            inicio: isoAt(date, '10:30'),
            fim: isoAt(date, '11:30'),
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
            profissional_nome: 'Gustavo',
            inicio: isoAt(date, '15:30'),
            fim: isoAt(date, '16:00'),
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

function json(res, data, status = 200) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(data));
}

function demoSlots(url) {
    const data = url.searchParams.get('data') || new Date().toISOString().slice(0, 10);
    const profissionalId = Number(url.searchParams.get('profissional_id') || 1);
    const base = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '15:30', '17:00', '18:30', '19:00'];
    const ocupados = {
        1: new Set(['10:30', '18:30']),
        2: new Set(['09:30', '15:30']),
        3: new Set(['11:00', '17:00'])
    }[profissionalId] || new Set();
    return base
        .filter((hora) => !ocupados.has(hora))
        .map((hora) => ({
            inicio: `${data}T${hora}:00-03:00`,
            disponivel: true,
            servicos,
            motivo: null
        }));
}

function handleApi(req, res) {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (url.pathname === '/api/publico') {
        return json(res, {
            nome: 'Studio Mazoni Barber',
            subtitulo: 'Corte, barba e atendimento com hora marcada.',
            negocio: {
                nome: 'Studio Mazoni Barber',
                nome_curto: 'Mazoni Barber',
                proprietaria: 'Franciele',
                inicial: 'M',
                segmento: 'Barbearia premium',
                subtitulo: 'Corte, barba e atendimento com hora marcada.',
                regiao: 'Santa Tereza, Rio Grande do Sul',
                frase_agendamento: 'Escolha Deryck, Leo Mazoni ou Gustavo e veja os horarios livres em tempo real.',
                local_titulo: 'Rua Abelardo Marques 180',
                local_descricao: 'Santa Tereza, Rio Grande do Sul. Segunda 13:30-20:00, terca a sabado 09:00-20:00.'
            },
            profissionais,
            whatsapp: '5551989849691',
            setup: {
                whatsapp_configurado: true,
                pagamento_online_configurado: false,
                public_base_url_configurada: false,
                public_base_url_https: false,
                pix_disponivel: false
            }
        });
    }
    if (url.pathname === '/api/servicos') return json(res, servicos);
    if (url.pathname === '/api/profissionais') return json(res, profissionais);
    if (url.pathname === '/api/disponibilidade/horarios') return json(res, demoSlots(url));
    if (url.pathname === '/api/publico/agendamentos' && req.method === 'POST') {
        return json(res, {
            agendamento: { id: Date.now(), status: 'agendado' },
            pagamento: null,
            aviso_whatsapp: { enviado: false, url: 'https://wa.me/5551989849691' }
        }, 201);
    }
    if (url.pathname === '/api/admin/status') {
        return json(res, { protegido: false, autenticado: true, usuario_obrigatorio: false });
    }
    if (url.pathname === '/api/clientes') return json(res, clientes);
    if (url.pathname === '/api/repasses') return json(res, []);
    if (url.pathname === '/api/lembretes/retorno') {
        return json(res, [{
            agendamento_id: 103,
            cliente_nome: 'Pedro Almeida',
            cliente_telefone: '51977665544',
            servico_nome: 'Barba',
            data_retorno: new Date().toISOString().slice(0, 10),
            dias_restantes: 0,
            lembrete_retorno_observacoes: 'Chamar para retorno de acabamento.'
        }]);
    }
    if (url.pathname === '/api/resumo') {
        return json(res, {
            total: 3,
            concluidos: 1,
            faturamento: 35,
            cancelados: 0,
            pagamentos_pendentes: 2
        });
    }
    if (url.pathname === '/api/agendamentos') {
        return json(res, demoAppointments(dayParam(url)));
    }
    if (url.pathname === '/api/configuracoes/negocio') {
        return json(res, {
            nome: 'Studio Mazoni Barber',
            nome_curto: 'Mazoni Barber',
            proprietaria: 'Franciele',
            inicial: 'M',
            segmento: 'Barbearia premium',
            subtitulo: 'Corte, barba e atendimento com hora marcada.',
            regiao: 'Santa Tereza, Rio Grande do Sul',
            frase_agendamento: 'Escolha Deryck, Leo Mazoni ou Gustavo e veja os horarios livres em tempo real.',
            local_titulo: 'Rua Abelardo Marques 180',
            local_descricao: 'Santa Tereza, Rio Grande do Sul. Segunda 13:30-20:00, terca a sabado 09:00-20:00.'
        });
    }
    return json(res, { erro: 'Endpoint indisponivel no preview estatico.' }, 404);
}

function resolveFile(url) {
    const clean = decodeURIComponent(String(url || '/').split('?')[0]);
    let file = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
    if (file === 'admin') file = 'admin.html';
    if (file === 'produto') file = 'produto.html';
    if (file === 'demo') file = 'index.html';
    const target = path.normalize(path.join(root, file));
    return target.startsWith(root) ? target : null;
}

http.createServer((req, res) => {
    if (String(req.url || '').startsWith('/api/')) {
        handleApi(req, res);
        return;
    }
    const target = resolveFile(req.url);
    if (!target) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(target, (error, data) => {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': types[path.extname(target)] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(data);
    });
}).listen(PORT, HOST, () => {
    console.log(`Preview estatico em http://${HOST}:${PORT}`);
});
