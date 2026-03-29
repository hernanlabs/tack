const state = require('./state');
const db = require('./db');
const timer = require('./timer');
const {
    porcentajeHaciaObjetivo,
    etiquetaPostura,
    textoObjetivoHoras,
    esPosturaSentado
} = require('./task-helpers');

function sincronizarHexColor() {
    const picker = document.getElementById('task-color-input');
    const hex = document.getElementById('color-hex-display');
    if (picker && hex) hex.value = picker.value.toUpperCase();
}

function setModalModoCrear() {
    state.editingTaskId = null;
    document.getElementById('modal-seq-label').innerText = 'NEW_SEQUENCE';
    document.getElementById('modal-seq-title').innerText = 'CREATE TASK';
    document.getElementById('modal-btn-delete').style.display = 'none';
    document.getElementById('modal-btn-submit').innerText = 'INITIALIZE';
}

function setModalModoEditar() {
    document.getElementById('modal-seq-label').innerText = 'EDIT_SEQUENCE';
    document.getElementById('modal-seq-title').innerText = 'EDIT TASK';
    document.getElementById('modal-btn-delete').style.display = 'inline-block';
    document.getElementById('modal-btn-submit').innerText = 'SAVE';
}

function abrirModal() {
    setModalModoCrear();
    const nameInput = document.getElementById('task-name-input');
    nameInput.value = '';
    nameInput.style.borderColor = '';
    document.querySelector('input[name="activity-type"][value="sitting"]').checked = true;
    document.getElementById('task-color-input').value = '#2d6a4f';
    sincronizarHexColor();
    const objIn = document.getElementById('task-objetivo-horas');
    if (objIn) {
        objIn.value = '2';
        objIn.style.borderColor = '';
    }
    document.getElementById('modalTarea').style.display = 'flex';
    nameInput.focus();
}

function abrirModalEditar(id) {
    if (timer.sesionDeTareaEnCurso() && id !== state.currentId) return;
    const t = state.db.tareas.find(x => x.id === id);
    if (!t) return;

    state.editingTaskId = id;
    setModalModoEditar();

    const nameInput = document.getElementById('task-name-input');
    nameInput.value = t.n;
    nameInput.style.borderColor = '';

    const sentado = esPosturaSentado(t.postura);
    document.querySelector(`input[name="activity-type"][value="${sentado ? 'sitting' : 'moving'}"]`).checked = true;

    const col = t.color && /^#[0-9A-Fa-f]{6}$/.test(t.color) ? t.color : '#2d6a4f';
    document.getElementById('task-color-input').value = col;
    sincronizarHexColor();

    const objIn = document.getElementById('task-objetivo-horas');
    if (objIn) {
        const oh = typeof t.objetivoHoras === 'number' && t.objetivoHoras > 0 ? t.objetivoHoras : 2;
        objIn.value = String(oh);
        objIn.style.borderColor = '';
    }

    document.getElementById('modalTarea').style.display = 'flex';
    nameInput.focus();
}

function cerrarModal() {
    state.editingTaskId = null;
    setModalModoCrear();
    document.getElementById('modalTarea').style.display = 'none';
    const nameInput = document.getElementById('task-name-input');
    if (nameInput) nameInput.style.borderColor = '';
    const objIn = document.getElementById('task-objetivo-horas');
    if (objIn) objIn.style.borderColor = '';
}

async function procesarTarea() {
    const nameInput = document.getElementById('task-name-input');
    const name = nameInput.value.trim();

    const type = document.querySelector('input[name="activity-type"]:checked').value;
    const color = document.getElementById('task-color-input').value;
    const objInput = document.getElementById('task-objetivo-horas');
    const objetivoHoras = objInput ? parseFloat(objInput.value, 10) : NaN;

    if (name === '') {
        nameInput.style.borderColor = 'var(--info)';
        return;
    }

    if (!Number.isFinite(objetivoHoras) || objetivoHoras < 0.25 || objetivoHoras > 24) {
        if (objInput) objInput.style.borderColor = 'var(--info)';
        return;
    }
    if (objInput) objInput.style.borderColor = '';

    if (state.editingTaskId !== null) {
        const t = state.db.tareas.find(x => x.id === state.editingTaskId);
        if (!t) {
            cerrarModal();
            return;
        }
        t.n = name.toUpperCase();
        t.postura = type;
        t.color = color;
        t.objetivoHoras = objetivoHoras;
        await db.saveDB();
        if (state.currentId === state.editingTaskId) {
            document.getElementById('taskLabel').innerText = t.n.toUpperCase();
            timer.actualizarDisplay();
        }
        cerrarModal();
        return;
    }

    const newTask = {
        id: Date.now(),
        n: name.toUpperCase(),
        postura: type,
        color: color,
        objetivoHoras: objetivoHoras,
        timeSpent: 0
    };

    state.db.tareas.push(newTask);
    await db.saveDB();
    cerrarModal();
}

async function eliminarTareaModal() {
    if (state.editingTaskId === null) return;

    const ok = confirm('¿Seguro que querés eliminar esta secuencia? No se puede deshacer.');
    if (!ok) return;

    const idBorrar = state.editingTaskId;
    const idx = state.db.tareas.findIndex(x => x.id === idBorrar);
    if (idx === -1) {
        cerrarModal();
        return;
    }

    if (state.currentId === idBorrar) {
        if (state.timerInt) {
            timer.controlTimer('stop');
        } else {
            state.acum = 0;
            state.inicio = null;
        }
        state.currentId = null;
        document.getElementById('taskLabel').innerText = 'STANDBY_ENGINE';
        document.getElementById('startBtn').disabled = true;
        timer.actualizarDisplay();
    }

    state.db.tareas.splice(idx, 1);
    await db.saveDB();
    cerrarModal();
}

function seleccionar(id) {
    if (timer.sesionDeTareaEnCurso() && id !== state.currentId) return;
    state.currentId = id;
    const t = state.db.tareas.find(x => x.id === id);
    if (!t) return;
    document.getElementById('taskLabel').innerText = t.n.toUpperCase();
    document.getElementById('startBtn').disabled = false;
    renderUI();
    timer.actualizarDisplay();
}

function renderUI() {
    const lista = document.getElementById('listaTareas');
    if (!lista) return;

    const bloquearOtras = timer.sesionDeTareaEnCurso();

    lista.innerHTML = state.db.tareas
        .map(t => {
            const pctLista = porcentajeHaciaObjetivo(t, t.timeSpent || 0);
            const pctTxt = pctLista !== null ? ` · ${pctLista}%` : '';
            return `
        <div class="tarea-item ${state.currentId === t.id ? 'active' : ''} ${bloquearOtras && t.id !== state.currentId ? 'tarea-item--locked' : ''}" style="border-left-color: ${t.color}">
            <div class="tarea-item-body" onclick="seleccionar(${t.id})">
                <div style="display: flex; flex-direction: column;">
                    <span style="color: ${state.currentId === t.id ? '#fff' : 'rgba(255,255,255,0.7)'}">${t.n}</span>
                    <small style="color: rgba(255,255,255,0.2); font-size:0.5rem; font-weight:800; letter-spacing:1px;">
                        ${etiquetaPostura(t.postura)} · OBJ ${textoObjetivoHoras(t.objetivoHoras)}${pctTxt}
                    </small>
                </div>
                <div class="status-dot" style="background: ${t.color}; width: 6px; height: 6px; border-radius: 50%; opacity: 0.5;"></div>
            </div>
            <button type="button" class="btn-edit-task" title="Editar" aria-label="Editar tarea" onclick="event.stopPropagation(); abrirModalEditar(${t.id})">✎</button>
        </div>
    `;
        })
        .join('');
}

module.exports = {
    sincronizarHexColor,
    abrirModal,
    abrirModalEditar,
    cerrarModal,
    procesarTarea,
    eliminarTareaModal,
    seleccionar,
    renderUI
};
