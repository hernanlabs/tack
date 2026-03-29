const { HYDRATE_INTERVAL_MS } = require('./constants');

/** Estado mutable compartido del renderer (tareas, cronómetro, modal, hidratación). */
module.exports = {
    db: { tareas: [], registros: [] },
    currentId: null,
    timerInt: null,
    breakInt: null,
    acum: 0,
    inicio: null,
    uResetStretch: -1,
    editingTaskId: null,
    hydrateDeadline: Date.now() + HYDRATE_INTERVAL_MS
};
