const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kotomag', {
  onSay: (fn) => ipcRenderer.on('say', (_e, d) => fn(d)),
  onConfig: (fn) => ipcRenderer.on('config', (_e, d) => fn(d)),
  setIgnore: (flag) => ipcRenderer.send('ignore', flag),
  menu: () => ipcRenderer.send('menu'),
  setTall: (v) => ipcRenderer.send('win-tall', !!v),
  joke: () => ipcRenderer.invoke('joke'),
  pic: () => ipcRenderer.invoke('pic'),
  onAct: (fn) => ipcRenderer.on('act', (_e, d) => fn(d)),
  laser: (on) => ipcRenderer.send('laser', !!on),
  openSettings: () => ipcRenderer.send('open-settings'),
  onSys: (fn) => ipcRenderer.on('sys', (_e, d) => fn(d)),
  onCursor: (fn) => ipcRenderer.on('cursor', (_e, d) => fn(d)),
  log: (m) => ipcRenderer.send('log', String(m).slice(0, 300)),
});
