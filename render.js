/**
 * TACK.LOG - Core Render Engine
 * Manejo de lógica de precisión, estados de salud y persistencia.
 */

// 1. ESTADO GLOBAL Y PERSISTENCIA
const DB_KEY = 'tack_v2_db';
let db = JSON.parse(localStorage.getItem(DB_KEY)) || { tareas: [], registros: [] };

let currentId = null;
let timerInt = null;
let acum = 0;
let inicio = null;

// Métricas de Sesión
let cBreaks = 0;
let cStretch = 0;
let uResetStretch = -1; // Bloque de 50m cumplido
let vasosAgua = 0;

// 2. MOTOR DEL CRONÓMETRO (ALTA PRECISIÓN)
function actualizarDisplay(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);

    // Formateo del Timer Principal
    const display = document.getElementById('display');
    if (display) {
        display.innerHTML = `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}<span class="mili">${Math.floor((ms % 1000) / 10).toString().padStart(2, '0')}</span>`;
    }

    // A. BARRA DE CARGA COGNITIVA (Meta 8hs)
    const limiteJornada = 8 * 3600000;
    const porcentajeCarga = Math.min((ms / limiteJornada) * 100, 100);
    document.getElementById('loadFill').style.height = `${porcentajeCarga}%`;

    // B. MODO DEEP FOCUS (25 min sin interrupción)
    const ring = document.getElementById('focusRing');
    if (m >= 25 && !ring.classList.contains('deep-focus-active')) {
        ring.classList.add('deep-focus-active');
        registrarEvento("ESTADO DE FLOW", true);
    } else if (m < 25) {
        ring.classList.remove('deep-focus-active');
    }

    // C. LÓGICA DE STRETCH (Ciclos de 50 min)
    const t = db.tareas.find(x => x.id === currentId);
    const btnStretch = document.getElementById('btnStretch');
    
    if (t && t.postura === 'sentado') {
        const bloqueActual = Math.floor(m / 50);
        const segEnBloque = s % 3000; // 3000s = 50min

        if (bloqueActual > uResetStretch) {
            if (m > 0 && m % 50 === 0) {
                btnStretch.className = "btn-tack stretch-critical";
            } else if (segEnBloque >= 2990) { // Los últimos 10 segundos
                btnStretch.className = "btn-tack stretch-pre-alert";
            } else {
                btnStretch.className = "btn-tack";
            }
        }
    }
}

// 3. GESTIÓN DE TAREAS Y MODAL
function seleccionar(id) {
    if (timerInt) return; // Evitar cambio mientras corre
    currentId = id;
    const t = db.tareas.find(x => x.id === id);
    
    // Reset visual de sesión
    cBreaks = 0;
    cStretch = 0;
    uResetStretch = -1;
    document.getElementById('countBreaks').innerText = "0";
    document.getElementById('countStretch').innerText = "0";
    
    const label = document.getElementById('taskLabel');
    label.innerText = t.n.toUpperCase();
    label.style.color = t.c || 'var(--accent)';
    
    document.getElementById('startBtn').disabled = false;
    renderUI();
}

function procesarTarea() {
    const n = document.getElementById('mNombre').value;
    const p = document.getElementById('mPostura').value;
    if (!n) return;

    db.tareas.push({ 
        id: Date.now(), 
        n: n.toUpperCase(), 
        postura: p, 
        c: 'var(--accent)' 
    });
    
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    renderUI();
    cerrarModal();
}

// 4. CONTROL DE BREAKS E HIDRATACIÓN
function iniciarBreak(tipo) {
    if (timerInt) controlTimer('pause');
    
    registrarEvento(tipo, true);
    
    if (tipo === 'STRETCH') {
        cStretch++;
        // Registrar que este bloque de 50m ya se cumplió
        uResetStretch = Math.floor((acum / 60000) / 50);
        document.getElementById('btnStretch').className = "btn-tack";
    } else {
        cBreaks++;
    }

    document.getElementById('countBreaks').innerText = cBreaks;
    document.getElementById('countStretch').innerText = cStretch;
    
    // Interfaz de Break
    document.getElementById('breakOverlay').style.display = 'flex';
    document.getElementById('breakIcon').innerText = { 'ALMUERZO': '🍱', 'STRETCH': '🧘', 'BAÑO': '🧻' }[tipo];
    
    let bInic = Date.now();
    let breakInt = setInterval(() => {
        let ms = Date.now() - bInic;
        let s = Math.floor(ms / 1000), m = Math.floor(s / 60);
        document.getElementById('breakTimer').innerText = `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }, 1000);

    // Guardar el intervalo para limpiarlo después
    window.currentBreakInterval = breakInt;
}

function terminarBreak() {
    clearInterval(window.currentBreakInterval);
    document.getElementById('breakOverlay').style.display = 'none';
}

function addWater() {
    if (vasosAgua < 8) {
        vasosAgua++;
        document.getElementById('waterFill').style.height = `${(vasosAgua / 8) * 100}%`;
        registrarEvento("AGUA +1", true);
    }
}

// 5. UTILIDADES DE INTERFAZ
function registrarEvento(msg, highlight = false) {
    const log = document.getElementById('sessionLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${highlight ? 'highlight' : ''}`;
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    entry.innerText = `${now} - ${msg}`;
    
    log.appendChild(entry);
    if (log.children.length > 5) log.removeChild(log.firstChild);
}

function controlTimer(tipo) {
    const sBtn = document.getElementById('startBtn');
    const pBtn = document.getElementById('pauseBtn');
    const tBtn = document.getElementById('stopBtn');

    if (tipo === 'start') {
        inicio = Date.now();
        timerInt = setInterval(() => actualizarDisplay(acum + (Date.now() - inicio)), 10);
        sBtn.disabled = true; pBtn.disabled = false; tBtn.disabled = false;
        registrarEvento("PLAY");
    } else if (tipo === 'pause') {
        acum += (Date.now() - inicio);
        clearInterval(timerInt);
        timerInt = null;
        sBtn.disabled = false; pBtn.disabled = true;
        registrarEvento("PAUSE");
    } else if (tipo === 'stop') {
        clearInterval(timerInt);
        timerInt = null;
        acum = 0;
        actualizarDisplay(0);
        sBtn.disabled = false; pBtn.disabled = true; tBtn.disabled = true;
        registrarEvento("STOP Session");
    }
}

function renderUI() {
    const lista = document.getElementById('listaTareas');
    lista.innerHTML = db.tareas.map(t => `
        <div class="tarea-item ${currentId === t.id ? 'active' : ''}" onclick="seleccionar(${t.id})">
            <span>${t.n}</span>
            <small style="color:#333; font-size:0.5rem">${t.postura.toUpperCase()}</small>
        </div>
    `).join('');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderUI();
    registrarEvento("SYSTEM ONLINE");
    
    // Reloj de tiempo real
    setInterval(() => {
        document.getElementById('realClock').innerText = new Date().toLocaleTimeString('es-AR', { hour12: false });
    }, 1000);
});