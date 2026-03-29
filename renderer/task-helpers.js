function formatearDuracionSimple(ms) {
    if (ms <= 0) return '0m';
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    if (h > 0) return `${h}h ${min}m`;
    return `${min}m`;
}

function porcentajeHaciaObjetivo(task, msTotal) {
    if (!task || typeof task.objetivoHoras !== 'number' || task.objetivoHoras <= 0) return null;
    const metaMs = task.objetivoHoras * 3600000;
    return Math.min(100, Math.round((msTotal / metaMs) * 100));
}

function esPosturaSentado(postura) {
    return postura === 'sitting' || postura === 'sentado';
}

function etiquetaPostura(postura) {
    return esPosturaSentado(postura) ? 'SITTING' : 'MOVING';
}

function textoObjetivoHoras(horas) {
    if (typeof horas !== 'number' || !Number.isFinite(horas) || horas <= 0) return '—';
    const t = horas % 1 === 0 ? horas.toFixed(0) : horas.toFixed(2).replace(/\.?0+$/, '');
    return `${t} h`;
}

module.exports = {
    formatearDuracionSimple,
    porcentajeHaciaObjetivo,
    esPosturaSentado,
    etiquetaPostura,
    textoObjetivoHoras
};
