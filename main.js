const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Definimos la ruta de la base de datos en la misma carpeta del programa
const DB_PATH = path.join(app.getAppPath(), 'tack_db.json');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        backgroundColor: '#050505', // Fondo oscuro nativo
        title: 'Tack',
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // Enviamos la ruta de la DB al render para que sepa dónde guardar
            additionalArguments: [`--db-path=${DB_PATH}`]
        }
    });

    mainWindow.loadFile('index.html');

    // mainWindow.webContents.openDevTools(); // Activar para debugging
}

// --- COMUNICACIÓN IPC ---

// Manejo de Pantalla Completa
ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
        const isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
    }
});

// Lógica de Persistencia Local (Lectura/Escritura de archivos)
ipcMain.handle('read-db', () => {
    if (fs.existsSync(DB_PATH)) {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
    return { tareas: [], registros: [] }; // DB Inicial si no existe
});

ipcMain.handle('save-db', (event, data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
});

// Ciclo de vida
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});