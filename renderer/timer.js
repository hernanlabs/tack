const state = require('./state');
const db = require('./db');
const {
    textoObjetivoHoras,
    porcentajeHaciaObjetivo,
    formatearDuracionSimple,
    esPosturaSentado
} = require('./task-helpers');

function msSesionActual() {
    return state.acum + (state.timerInt ? Date.now() - state.inicio : 0);
}

/** Tiempo total dedicado a la tarea (persistido + tramo actual del cronómetro). */
function msTotalTareaActual() {
    const task = state.currentId ? state.db.tareas.find(x => x.id === state.currentId) : null;
    const base = task ? (task.timeSpent || 0) : 0;
    const runSeg = state.timerInt ? Date.now() - state.inicio : 0;
    return base + runSeg;
}

function actualizarDisplay() {
    const task = state.currentId ? state.db.tareas.find(x => x.id === state.currentId) : null;
    const msTotal = msTotalTareaActual();
    const msSesion = msSesionActual();

    const s = Math.floor(msTotal / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);

    const display = document.getElementById('display');
    if (display) {
        display.innerHTML = `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}<span class="mili">${Math.floor((msTotal % 1000) / 10).toString().padStart(2, '0')}</span>`;
    }

    const loadFill = document.getElementById('loadFill');
    const cognitiveWrap = document.getElementById('cognitiveWrap');
    if (loadFill && task && typeof task.objetivoHoras === 'number' && task.objetivoHoras > 0) {
        const metaMs = task.objetivoHoras * 3600000;
        const progreso = Math.min((msTotal / metaMs) * 100, 100);
        loadFill.style.height = `${progreso}%`;
        if (cognitiveWrap) {
            cognitiveWrap.classList.toggle('goal-complete', progreso >= 100);
            cognitiveWrap.classList.toggle('goal-near', progreso >= 80 && progreso < 100);
        }
    } else if (loadFill) {
        loadFill.style.height = '0%';
        if (cognitiveWrap) cognitiveWrap.classList.remove('goal-complete', 'goal-near');
    }

    const goalLine = document.getElementById('goalLine');
    if (goalLine && task && typeof task.objetivoHoras === 'number' && task.objetivoHoras > 0) {
        const pct = porcentajeHaciaObjetivo(task, msTotal);
        goalLine.classList.remove('goal-line--hidden');
        goalLine.textContent = `${formatearDuracionSimple(msTotal)} / ${textoObjetivoHoras(task.objetivoHoras)} · ${pct}%`;
        goalLine.classList.toggle('goal-line--done', pct >= 100);
        goalLine.classList.toggle('goal-line--near', pct >= 80 && pct < 100);
    } else if (goalLine) {
        goalLine.classList.add('goal-line--hidden');
        goalLine.textContent = '';
        goalLine.classList.remove('goal-line--done', 'goal-line--near');
    }

    const mSes = Math.floor(msSesion / 60000);
    const focusRing = document.getElementById('focusRing');
    if (focusRing) {
        if (mSes >= 25) focusRing.classList.add('deep-focus-active');
        else focusRing.classList.remove('deep-focus-active');
    }

    const t = task;
    const btnStretch = document.getElementById('btnStretch');
    if (t && esPosturaSentado(t.postura) && btnStretch) {
        const mMin = mSes;
        const bloqueActual = Math.floor(mMin / 50);
        if (bloqueActual > state.uResetStretch) {
            const sSes = Math.floor(msSesion / 1000);
            const segundosEnElBloque = sSes % 3000;
            if (mMin > 0 && mMin % 50 === 0) {
                btnStretch.className = 'btn-quick-action stretch-critical';
            } else if (segundosEnElBloque >= 2990) {
                btnStretch.className = 'btn-quick-action stretch-pre-alert';
            } else {
                btnStretch.className = 'btn-quick-action';
            }
        }
    }
}

/** Hay sesión con la tarea actual: cronómetro corriendo o en pausa con tiempo acumulado (hasta STOP). */
function sesionDeTareaEnCurso() {
    return state.timerInt !== null || state.acum > 0;
}

function controlTimer(tipo) {
    const sBtn = document.getElementById('startBtn');
    const pBtn = document.getElementById('pauseBtn');
    const tBtn = document.getElementById('stopBtn');
    const task = state.currentId ? state.db.tareas.find(x => x.id === state.currentId) : null;

    if (tipo === 'start') {
        state.inicio = Date.now();
        state.timerInt = setInterval(() => actualizarDisplay(), 10);
        sBtn.disabled = true;
        pBtn.disabled = false;
        tBtn.disabled = false;
    } else if (tipo === 'pause') {
        if (!state.timerInt) return;
        const seg = Date.now() - state.inicio;
        if (task) task.timeSpent = (task.timeSpent || 0) + seg;
        state.acum += seg;
        clearInterval(state.timerInt);
        state.timerInt = null;
        void db.saveDB();
        sBtn.disabled = false;
        pBtn.disabled = true;
        actualizarDisplay();
    } else if (tipo === 'stop') {
        if (state.timerInt) {
            const seg = Date.now() - state.inicio;
            if (task) task.timeSpent = (task.timeSpent || 0) + seg;
            state.acum += seg;
            void db.saveDB();
        }
        clearInterval(state.timerInt);
        state.timerInt = null;
        state.acum = 0;
        state.inicio = null;
        sBtn.disabled = false;
        pBtn.disabled = true;
        tBtn.disabled = true;
        actualizarDisplay();
    }
    require('./tasks').renderUI();
}

module.exports = {
    msSesionActual,
    msTotalTareaActual,
    actualizarDisplay,
    controlTimer,
    sesionDeTareaEnCurso
};
