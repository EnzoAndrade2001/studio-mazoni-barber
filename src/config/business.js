function textoEnv(nome, padrao) {
    const valor = process.env[nome];
    return valor && String(valor).trim() ? String(valor).trim() : padrao;
}

function inicial(nome) {
    const limpa = String(nome || '').trim();
    return limpa ? limpa[0].toUpperCase() : 'A';
}

function dadosNegocio() {
    const nome = textoEnv('BUSINESS_NAME', 'Studio Mazoni Barber');
    const proprietaria = textoEnv('BUSINESS_OWNER_NAME', 'Admin');
    return {
        nome,
        nome_curto: textoEnv('BUSINESS_SHORT_NAME', 'Mazoni Barber'),
        proprietaria,
        inicial: textoEnv('BUSINESS_INITIAL', 'M'),
        segmento: textoEnv('BUSINESS_SEGMENT', 'Barbearia premium'),
        subtitulo: textoEnv('BUSINESS_SUBTITLE', 'Corte, barba e atendimento com hora marcada.'),
        regiao: textoEnv('BUSINESS_REGION', 'Santa Tereza, Rio Grande do Sul'),
        frase_agendamento: textoEnv('BUSINESS_BOOKING_TEXT', 'Escolha Deryck, Leo Mazoni ou Gustavo e veja os horarios livres em tempo real.'),
        local_titulo: textoEnv('BUSINESS_LOCATION_TITLE', 'Rua Abelardo Marques 180'),
        local_descricao: textoEnv('BUSINESS_LOCATION_DESCRIPTION', 'Santa Tereza, Rio Grande do Sul. Segunda 13:30-20:00, terca a sabado 09:00-20:00.')
    };
}

function descricaoPagamento(tipo, servicoNome) {
    const negocio = dadosNegocio();
    return `Pagamento ${negocio.nome} - ${servicoNome}`;
}

function descricaoRepasse() {
    return textoEnv('BUSINESS_TRANSFER_DESCRIPTION', `Repasse ${dadosNegocio().nome}`);
}

function pixPadrao() {
    return {
        tipo: process.env.BUSINESS_PIX_KEY_TYPE || null,
        chave: process.env.BUSINESS_PIX_KEY || null
    };
}

module.exports = {
    dadosNegocio,
    descricaoPagamento,
    descricaoRepasse,
    pixPadrao
};
