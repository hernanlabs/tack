const { ipcRenderer } = require('electron');
const state = require('./state');

let afterPersist = () => {};

function setAfterPersist(fn) {
    afterPersist = typeof fn === 'function' ? fn : () => {};
}

async function loadDB() {
    state.db = await ipcRenderer.invoke('read-db');
    afterPersist();
}

async function saveDB() {
    await ipcRenderer.invoke('save-db', state.db);
    afterPersist();
}

module.exports = {
    setAfterPersist,
    loadDB,
    saveDB
};
