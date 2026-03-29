/**
 * Tack — punto de entrada del renderer.
 * Los módulos en ./ viven en renderer/ y se cargan con require (CommonJS, sin bundler).
 */

const { ipcRenderer } = require('electron');
const db = require('./db');
const tasks = require('./tasks');
const timer = require('./timer');
const breaks = require('./breaks');
const hydration = require('./hydration');
const navigation = require('./navigation');
const fx = require('./fx');

db.setAfterPersist(() => tasks.renderUI());

const g = typeof window !== 'undefined' ? window : globalThis;
Object.assign(g, {
    seleccionar: tasks.seleccionar,
    abrirModal: tasks.abrirModal,
    abrirModalEditar: tasks.abrirModalEditar,
    cerrarModal: tasks.cerrarModal,
    procesarTarea: tasks.procesarTarea,
    eliminarTareaModal: tasks.eliminarTareaModal,
    controlTimer: timer.controlTimer,
    iniciarBreak: breaks.iniciarBreak,
    terminarBreak: breaks.terminarBreak,
    confirmarHidratacion: hydration.confirmarHidratacion,
    irASeccionPanel: navigation.irASeccionPanel,
    toggleFullScreen: () => ipcRenderer.send('toggle-fullscreen')
});

document.addEventListener('DOMContentLoaded', () => {
    db.loadDB().then(() => timer.actualizarDisplay());

    fx.setupFxParticles();
    fx.setMenuParticlesActive(true);

    const colorPicker = document.getElementById('task-color-input');
    if (colorPicker) colorPicker.addEventListener('input', tasks.sincronizarHexColor);

    setInterval(() => {
        const clock = document.getElementById('realClock');
        if (clock) clock.innerText = new Date().toLocaleTimeString('es-AR', { hour12: false });
    }, 1000);

    hydration.actualizarHidratacionUI();
    setInterval(hydration.actualizarHidratacionUI, 1000);
});
