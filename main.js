const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// Usamos 'userData' para que funcione en versiones instaladas/portables
const userDataPath = app.getPath('userData'); 
const DB_PATH = path.join(userDataPath, 'tack_db.json');

// Verificación inicial: Si no existe el archivo en la carpeta de usuario, lo creamos
if (!fs.existsSync(DB_PATH)) {
    const initialData = { tareas: [], registros: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        // Tamaño = área de la página (sin barra de título extra en el cálculo); coincide con el layout CSS
        useContentSize: true,
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 760,
        backgroundColor: '#050505',
        title: 'Tack',
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // Enviamos la nueva ruta segura al render
            additionalArguments: [`--db-path=${DB_PATH}`]
        }
    });

    mainWindow.loadFile('index.html');
}

// --- COMUNICACIÓN IPC ---

ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});

// Lectura de DB
ipcMain.handle('read-db', () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (error) {
        console.error("Error leyendo la DB:", error);
    }
    return { tareas: [], registros: [] };
});

// Escritura de DB
ipcMain.handle('save-db', (event, data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error("Error guardando la DB:", error);
        return false;
    }
});

// Ciclo de vida
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});