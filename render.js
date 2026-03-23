/**
 * TACK - Core Engine
 * Gestión de persistencia en archivo local, cronómetro de precisión y biometría.
 */

const { ipcRenderer } = require('electron');

// 1. ESTADO GLOBAL Y PERSISTENCIA
let db = { tareas: [], registros: [] };
let currentId = null;
let timerInt = null;
let breakInt = null;
let acum = 0;
let inicio = null;

// Métricas de Sesión
let cBreaks = 0;
let cStretch = 0;
let uResetStretch = -1; 
let vasosAgua = 0;

// Carga inicial desde el archivo físico (tack_db.json)
async function loadDB() {
    db = await ipcRenderer.invoke('read-db');
    renderUI();
}

async function saveDB() {
    await ipcRenderer.invoke('save-db', db);
    renderUI();
}

// 2. MOTOR DEL CRONÓMETRO (ALTA PRECISIÓN)
function actualizarDisplay(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);

    const display = document.getElementById('display');
    if (display) {
        display.innerHTML = `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}<span class="mili">${Math.floor((ms % 1000) / 10).toString().padStart(2, '0')}</span>`;
    }

    // A. BARRA DE CARGA COGNITIVA (Meta 8hs)
    const loadFill = document.getElementById('loadFill');
    if (loadFill) {
        const progreso = Math.min((ms / (8 * 3600000)) * 100, 100);
        loadFill.style.height = `${progreso}%`;
    }

    // B. MODO DEEP FOCUS (25 min) - Efecto visual en la tarjeta
    const focusRing = document.getElementById('focusRing');
    if (m >= 25) {
        focusRing.classList.add('deep-focus-active');
    } else {
        focusRing.classList.remove('deep-focus-active');
    }

    // C. CICLO DE ESTIRAMIENTO (50 min)
    const t = db.tareas.find(x => x.id === currentId);
    const btnStretch = document.getElementById('btnStretch');
    
    if (t && t.postura === 'sentado' && btnStretch) {
        let bloqueActual = Math.floor(m / 50);
        
        if (bloqueActual > uResetStretch) {
            let segundosEnElBloque = s % 3000; 
            
            if (m > 0 && m % 50 === 0) {
                btnStretch.className = "btn-quick-action stretch-critical";
            } else if (segundosEnElBloque >= 2990) { // 10 segundos antes de los 50min
                btnStretch.className = "btn-quick-action stretch-pre-alert";
            } else {
                btnStretch.className = "btn-quick-action";
            }
        }
    }
}

// 3. GESTIÓN DE BREAKS Y BIOMETRÍA
function iniciarBreak(tipo) {
    if (timerInt) controlTimer('pause');

    if (tipo === 'STRETCH') {
        cStretch++;
        // Marcamos el bloque actual como "hecho" para que el botón deje de latir
        uResetStretch = Math.floor((acum / 60000) / 50);
        document.getElementById('btnStretch').className = "btn-quick-action";
        document.getElementById('countStretch').innerText = cStretch;
    } else {
        cBreaks++;
        document.getElementById('countBreaks').innerText = cBreaks;
    }

    document.getElementById('breakOverlay').style.display = 'flex';
    document.getElementById('breakIcon').innerText = { 'ALMUERZO': '🍱', 'STRETCH': '🧘', 'BAÑO': '🧻' }[tipo] || '⏳';

    let bInic = Date.now();
    if (breakInt) clearInterval(breakInt);
    breakInt = setInterval(() => {
        let ms = Date.now() - bInic;
        let s = Math.floor(ms / 1000);
        let m = Math.floor(s / 60);
        document.getElementById('breakTimer').innerText = `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }, 1000);
}

function terminarBreak() {
    clearInterval(breakInt);
    document.getElementById('breakOverlay').style.display = 'none';
    // No reiniciamos el timer automáticamente para que el usuario decida cuándo volver
}

function addWater() {
    if (vasosAgua < 8) {
        vasosAgua++;
        document.getElementById('waterFill').style.height = `${(vasosAgua / 8) * 100}%`;
    }
}

// 4. CONTROL DE OPERACIONES
function controlTimer(tipo) {
    const sBtn = document.getElementById('startBtn');
    const pBtn = document.getElementById('pauseBtn');
    const tBtn = document.getElementById('stopBtn');

    if (tipo === 'start') {
        inicio = Date.now();
        timerInt = setInterval(() => actualizarDisplay(acum + (Date.now() - inicio)), 10);
        sBtn.disabled = true; pBtn.disabled = false; tBtn.disabled = false;
    } else if (tipo === 'pause') {
        acum += (Date.now() - inicio);
        clearInterval(timerInt);
        timerInt = null;
        sBtn.disabled = false; pBtn.disabled = true;
    } else if (tipo === 'stop') {
        clearInterval(timerInt);
        timerInt = null;
        acum = 0;
        actualizarDisplay(0);
        sBtn.disabled = false; pBtn.disabled = true; tBtn.disabled = true;
    }
}

function seleccionar(id) {
    currentId = id;
    const t = db.tareas.find(x => x.id === id);
    document.getElementById('taskLabel').innerText = t.n.toUpperCase();
    document.getElementById('startBtn').disabled = false;
    renderUI();
}

function abrirModal() { document.getElementById('modalTarea').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modalTarea').style.display = 'none'; }

async function procesarTarea() {
    const n = document.getElementById('mNombre').value;
    const p = document.getElementById('mPostura').value;
    if (n) {
        db.tareas.push({ id: Date.now(), n: n.toUpperCase(), postura: p });
        await saveDB(); // Guarda en tack_db.json
        cerrarModal();
        document.getElementById('mNombre').value = "";
    }
}

function renderUI() {
    const lista = document.getElementById('listaTareas');
    if (!lista) return;
    lista.innerHTML = db.tareas.map(t => `
        <div class="tarea-item ${currentId === t.id ? 'active' : ''}" onclick="seleccionar(${t.id})">
            <span>${t.n}</span>
            <small style="color:#222; font-size:0.5rem; font-weight:800">${t.postura.toUpperCase()}</small>
        </div>
    `).join('');
}

// Comunicación con el proceso principal para Pantalla Completa
function toggleFullScreen() {
    ipcRenderer.send('toggle-fullscreen');
}

// 5. INICIALIZACIÓN AL CARGAR
document.addEventListener('DOMContentLoaded', () => {
    loadDB();
    
    // Reloj de pared (Tiempo Real)
    setInterval(() => {
        const clock = document.getElementById('realClock');
        if(clock) clock.innerText = new Date().toLocaleTimeString('es-AR', { hour12: false });
    }, 1000);
});