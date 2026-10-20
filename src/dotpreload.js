const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dotApi', { onDot: (fn) => ipcRenderer.on('dot', (_e, d) => fn(d)) });
