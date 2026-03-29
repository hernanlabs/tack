const { PANEL_SLIDE, MAIN_VIEW_ID } = require('./constants');
const fx = require('./fx');
const timer = require('./timer');

function irASeccionPanel(seccion) {
    const idx = PANEL_SLIDE[seccion];
    if (idx === undefined) return;

    const track = document.getElementById('panelTrack');
    if (track) {
        track.style.transform = `translateX(-${idx * 25}%)`;
        track.dataset.index = String(idx);
    }

    Object.entries(MAIN_VIEW_ID).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        const active = key === seccion;
        el.classList.toggle('main-view--active', active);
        el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    fx.setMenuParticlesActive(seccion === 'menu');
    fx.setProductivityParticlesActive(seccion === 'productividad');

    if (seccion === 'productividad') timer.actualizarDisplay();
}

module.exports = {
    irASeccionPanel
};
