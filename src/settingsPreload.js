const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ks', {
  get: () => ipcRenderer.invoke('cfg-get'),
  set: (patch) => ipcRenderer.send('cfg-set', patch),
  reset: () => ipcRenderer.send('cfg-reset'),
  act: (k) => ipcRenderer.send('cfg-act', k),
  sysNow: () => ipcRenderer.invoke('sys-now'),
  sysTest: (k) => ipcRenderer.send('sys-test', k),
  probe: () => ipcRenderer.send('hotkey-probe'),
  openAccess: (w) => ipcRenderer.send('open-access', w),
  askAccess: () => ipcRenderer.send('ask-access'),
  onFired: (fn) => ipcRenderer.on('hotkey-fired', () => fn()),
  openFda: () => ipcRenderer.send('open-fda'),
  openLog: () => ipcRenderer.send('open-log'),
  onCfg: (fn) => ipcRenderer.on('cfg', (_e, d) => fn(d)),
});
