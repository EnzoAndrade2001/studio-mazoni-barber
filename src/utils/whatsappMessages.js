function nomeProfissional(agendamento) {
    return agendamento.profissional_apelido || agendamento.profissional_nome || 'barbeiro';
}

function dataHora(value) {
    const date = new Date(value);
    return {
        data: date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            timeZone: 'America/Sao_Paulo'
        }),
        hora: date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        })
    };
}

function telefoneWaMe(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return null;
    return digits.startsWith('55') ? digits : `55${digits}`;
}

function linksTexto(links = {}) {
    const linhas = [];
    if (links.confirmar) linhas.push(`Confirmar: ${links.confirmar}`);
    if (links.reagendar) linhas.push(`Reagendar: ${links.reagendar}`);
    if (links.cancelar) linhas.push(`Cancelar: ${links.cancelar}`);
    return linhas.length ? `\n\n${linhas.join('\n')}` : '';
}

function mensagemAgendamento(agendamento, tipo = 'confirmacao', negocio = {}, links = {}) {
    const nomeNegocio = negocio.nome || 'Studio Mazoni Barber';
    const responsavel = negocio.proprietaria || 'recepcao';
    const { data, hora } = dataHora(agendamento.inicio);
    const base = `${agendamento.servico_nome} com ${nomeProfissional(agendamento)} no dia ${data} as ${hora}`;
    const nome = agendamento.cliente_nome ? `, ${agendamento.cliente_nome}` : '';

    if (tipo === 'reagendamento') {
        return `Oi${nome}! Aqui e do ${nomeNegocio}. Seu horario foi atualizado: ${base}. Qualquer ajuste, chama a gente por aqui.${linksTexto({ reagendar: links.reagendar, cancelar: links.cancelar })}`;
    }
    if (tipo === 'cancelamento') {
        return `Oi${nome}! Aqui e do ${nomeNegocio}. Passando para avisar que seu horario de ${base} foi cancelado. Se quiser remarcar, ${responsavel} te ajuda por aqui.${linksTexto({ reagendar: links.reagendar })}`;
    }
    if (tipo === 'lembrete') {
        return `Oi${nome}! Aqui e do ${nomeNegocio}. Lembrete do seu horario: ${base}. Te esperamos!${linksTexto({ reagendar: links.reagendar, cancelar: links.cancelar })}`;
    }
    if (tipo === 'pagamento') {
        return `Oi${nome}! Aqui e do ${nomeNegocio}. Confirmamos o pagamento do seu horario: ${base}. Obrigado!`;
    }
    if (tipo === 'recusa') {
        return `Oi${nome}! Aqui e do ${nomeNegocio}. Infelizmente nao conseguimos confirmar seu pedido de horario para ${base}. Se quiser tentar outro dia ou horario, ${responsavel} te ajuda por aqui.${linksTexto({ reagendar: links.reagendar })}`;
    }
    return `Oi${nome}! Aqui e do ${nomeNegocio}. Seu horario esta confirmado: ${base}. Te esperamos!${linksTexto(links)}`;
}

function whatsappUrl(telefone, texto) {
    const numero = telefoneWaMe(telefone);
    if (!numero) return null;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

module.exports = {
    mensagemAgendamento,
    whatsappUrl,
    telefoneWaMe
};
