function horasAte(inicio, agora = new Date()) {
    return (new Date(inicio).getTime() - agora.getTime()) / 36e5;
}

function podeAlterarComAntecedencia(inicio, horasMinimas, agora = new Date()) {
    return horasAte(inicio, agora) >= Number(horasMinimas || 0);
}

function bloqueioNoShow({ totalNoShows, ultimoNoShowEm, limite, bloqueioDias, agora = new Date() }) {
    if (!limite || Number(totalNoShows || 0) < Number(limite)) return { bloqueado: false };
    if (!ultimoNoShowEm || !bloqueioDias) return { bloqueado: true, ate: null };
    const ate = new Date(ultimoNoShowEm);
    ate.setDate(ate.getDate() + Number(bloqueioDias));
    return { bloqueado: ate > agora, ate: ate.toISOString() };
}

function sinalAtivo(regras) {
    return Boolean(regras && regras.sinal_habilitado && Number(regras.sinal_percentual) > 0);
}

module.exports = {
    horasAte,
    podeAlterarComAntecedencia,
    bloqueioNoShow,
    sinalAtivo
};
