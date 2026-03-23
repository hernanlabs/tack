const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // Configuramos la ventana con un look moderno
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        backgroundColor: '#0d0d0d', // Evita el flash blanco al cargar
        titleBarStyle: 'hiddenInset', // Oculta barra de título en macOS/algunos Linux
        autoHideMenuBar: true, // Oculta la barra de menú clásica de Ubuntu (Alt para ver)
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Permite usar require('electron') en el renderer.js
        }
    });

    mainWindow.loadFile('index.html');

    // Opcional: Abrir herramientas de desarrollo al iniciar
    // mainWindow.webContents.openDevTools();
}

// --- LÓGICA DE COMUNICACIÓN (IPC) ---

// Manejo del Modo Focus (Pantalla completa)
ipcMain.on('toggle-fullscreen', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
});

// Ciclo de vida de la App
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});