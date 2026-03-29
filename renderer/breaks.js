const state = require('./state');
const timer = require('./timer');

function iniciarBreak(tipo) {
    if (state.timerInt) timer.controlTimer('pause');

    if (tipo === 'STRETCH') {
        state.uResetStretch = Math.floor(Math.floor(timer.msSesionActual() / 60000) / 50);
        const btn = document.getElementById('btnStretch');
        if (btn) btn.className = 'btn-quick-action';
    }

    const overlay = document.getElementById('breakOverlay');
    const icon = document.getElementById('breakIcon');
    if (overlay) overlay.style.display = 'flex';
    if (icon) icon.innerText = { ALMUERZO: '🍱', STRETCH: '🧘' }[tipo] || '⏳';

    let bInic = Date.now();
    if (state.breakInt) clearInterval(state.breakInt);
    state.breakInt = setInterval(() => {
        const ms = Date.now() - bInic;
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const el = document.getElementById('breakTimer');
        if (el) el.innerText = `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }, 1000);
}

function terminarBreak() {
    clearInterval(state.breakInt);
    state.breakInt = null;
    const overlay = document.getElementById('breakOverlay');
    if (overlay) overlay.style.display = 'none';
}

module.exports = {
    iniciarBreak,
    terminarBreak
};
