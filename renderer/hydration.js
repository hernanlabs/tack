const state = require('./state');
const { HYDRATE_INTERVAL_MS } = require('./constants');

function formatearCuentaRegresiva(msRestantes) {
    if (msRestantes <= 0) return '00:00';
    const totalSeg = Math.floor(msRestantes / 1000);
    const m = Math.floor(totalSeg / 60);
    const s = totalSeg % 60;
    if (m >= 60) {
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function actualizarHidratacionUI() {
    const panel = document.getElementById('hydrationPanel');
    const cd = document.getElementById('hydrateCountdown');
    const fill = document.getElementById('hydrateProgress');
    const track = document.getElementById('hydrateTrack');
    const dueLine = document.getElementById('hydrateDueLine');
    if (!panel || !cd || !fill) return;

    const restante = state.hydrateDeadline - Date.now();
    const transcurrido = HYDRATE_INTERVAL_MS - restante;
    let pct = (transcurrido / HYDRATE_INTERVAL_MS) * 100;
    pct = Math.max(0, Math.min(100, pct));

    cd.innerText = formatearCuentaRegresiva(restante);
    fill.style.width = `${pct}%`;

    if (track) {
        track.setAttribute('aria-valuenow', String(Math.round(pct)));
        track.setAttribute('aria-label', `Próximo recordatorio de hidratación en ${formatearCuentaRegresiva(restante)}`);
    }

    const vencido = restante <= 0;
    panel.classList.toggle('hydration-due', vencido);
    if (dueLine) dueLine.classList.toggle('hydrate-due-line--hidden', !vencido);
}

function confirmarHidratacion() {
    state.hydrateDeadline = Date.now() + HYDRATE_INTERVAL_MS;
    actualizarHidratacionUI();
}

module.exports = {
    formatearCuentaRegresiva,
    actualizarHidratacionUI,
    confirmarHidratacion
};
