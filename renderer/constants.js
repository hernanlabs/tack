/** Intervalo entre recordatorios de hidratación (ms). */
const HYDRATE_INTERVAL_MS = 45 * 60 * 1000;

/** Índice del carrusel del panel (4 columnas = 25% cada una). */
const PANEL_SLIDE = { menu: 0, productividad: 1, habitos: 2, dashboard: 3 };

const MAIN_VIEW_ID = {
    menu: 'viewWelcome',
    productividad: 'viewProductividad',
    habitos: 'viewHabitos',
    dashboard: 'viewDashboard'
};

module.exports = {
    HYDRATE_INTERVAL_MS,
    PANEL_SLIDE,
    MAIN_VIEW_ID
};
