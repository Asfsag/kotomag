// Kotomag: a transparent strip window above the Dock/taskbar with a pixel-art wizard cat inside.
const { app, BrowserWindow, screen, ipcMain, Menu, shell, powerMonitor, globalShortcut, systemPreferences, Tray, nativeImage } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');
const C = require('./config');
const { S, LOCAL_JOKES_EN } = require('./i18n');
const sysmon = require('./sysmon');
const { spawn } = require('child_process');

const H = 400;
let mon = null;
let tall = false;                 // во время перетаскивания окно растягивается на всю высоту экрана
let win = null;
let cfg = C.clean(C.merge(C.DEFAULTS, {}));
let cfgFile = null;

if (!app.requestSingleInstanceLock()) app.quit();

function loadCfg() {
  let first = true;
  try {
    const saved = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); first = false;
    if ('auto' in saved && !('jokes' in saved)) saved.jokes = saved.auto;   // старое имя настройки
    if (saved.sayGap === 15) saved.sayGap = 2;   // прежнее значение по умолчанию (v0.13.6) заменено: пауза 2 секунды
    cfg = C.clean(C.merge(C.DEFAULTS, saved));
  } catch (e) { /* первый запуск */ }
  if (first) { try { cfg.lang = /^ru/i.test(app.getLocale()) ? 'ru' : 'en'; } catch (e) { /* язык системы неизвестен */ } }
}
const L = () => S[cfg.lang] || S.ru;
function cfgForUi() { return { ...cfg, platform: process.platform, hotkeyOk, trusted: trusted(), quietNow: C.isQuiet(cfg), version: app.getVersion(), logPath: path.join(app.getPath('userData'), 'log.txt') }; }
let settingsWin = null, lastQuiet = false, hotkeyOk = null, regKey = '', probeUntil = 0;
const trusted = () => { try { return process.platform === 'darwin' ? systemPreferences.isTrustedAccessibilityClient(false) : true; } catch (e) { return null; } };
// горячая клавиша лазерной указки: берётся из настроек. Работают сразу два способа: системная регистрация (globalShortcut)
// и опрос состояния клавиш вспомогательной программой kotomag-keys (ей не нужны особые разрешения macOS); двойные срабатывания гасятся
const VK = { A: 0, S: 1, D: 2, F: 3, H: 4, G: 5, Z: 6, X: 7, C: 8, V: 9, B: 11, Q: 12, W: 13, E: 14, R: 15, Y: 16, T: 17, 1: 18, 2: 19, 3: 20, 4: 21, 6: 22, 5: 23, Equal: 24, 9: 25, 7: 26, Minus: 27, 8: 28, 0: 29, BracketRight: 30, O: 31, U: 32, BracketLeft: 33, I: 34, P: 35, Return: 36, L: 37, J: 38, Quote: 39, K: 40, Semicolon: 41, Backslash: 42, Comma: 43, Slash: 44, N: 45, M: 46, Period: 47, Tab: 48, Space: 49, Backquote: 50, Backspace: 51, Delete: 117, Left: 123, Right: 124, Down: 125, Up: 126, Home: 115, End: 119, PageUp: 116, PageDown: 121, F1: 122, F2: 120, F3: 99, F4: 118, F5: 96, F6: 97, F7: 98, F8: 100, F9: 101, F10: 109, F11: 103, F12: 111, F13: 105, F14: 107, F15: 113 };
function accelToKeys(a) {
  const p = String(a).split('+'), key = p.pop(); let mods = 0;
  for (const x of p) mods |= { CommandOrControl: 1, Command: 1, Super: 1, Alt: 2, Option: 2, Control: 4, Shift: 8 }[x] || 0;
  return key in VK ? { code: VK[key], mods } : null;
}
let keyProc = null, lastFire = 0;
function fireLaser(src) {
  const now = Date.now(); if (now - lastFire < 700) return; lastFire = now;
  logLine('горячая клавиша ' + cfg.laserKey + ': нажата (' + src + ')');
  if (now < probeUntil) { probeUntil = 0; if (settingsWin && !settingsWin.isDestroyed()) settingsWin.webContents.send('hotkey-fired'); return; }
  send('act', 'laser');
}
function stopKeyPoll() { if (keyProc) { try { keyProc.kill(); } catch (e) { /* уже завершён */ } keyProc = null; } }
function startKeyPoll() {
  stopKeyPoll();
  if (process.platform !== 'darwin') return;   // вспомогательная программа опроса клавиш есть только для macOS
  const kk = accelToKeys(cfg.laserKey), bin = path.join(__dirname, 'kotomag-keys');
  if (!cfg.laserKeyOn || !kk || !fs.existsSync(bin)) return;
  try {
    keyProc = spawn(bin, [String(kk.code), String(kk.mods)], { stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    keyProc.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (line === 'FIRE') fireLaser('опрос'); else if (line === 'READY') logLine('опрос клавиш запущен: код ' + kk.code + ' модификаторы ' + kk.mods); } });
    keyProc.on('exit', () => { keyProc = null; });
  } catch (e) { logLine('опрос клавиш: ' + e.message); }
}
function registerLaser() {
  try { if (regKey) globalShortcut.unregister(regKey); } catch (e) { /* не была зарегистрирована */ }
  regKey = ''; hotkeyOk = null;
  startKeyPoll();
  if (!cfg.laserKeyOn) return;
  let ok = false;
  try { ok = globalShortcut.register(cfg.laserKey, () => fireLaser('системная регистрация')); } catch (e) { logLine('горячая клавиша ' + cfg.laserKey + ': ошибка ' + e.message); }
  if (ok) regKey = cfg.laserKey;
  hotkeyOk = ok || !!keyProc; logLine('горячая клавиша ' + cfg.laserKey + ': ' + (ok ? 'зарегистрирована' : 'занята или недоступна') + (keyProc ? ', опрос клавиш включён' : ''));
}
function applyAutostart() { try { app.setLoginItemSettings({ openAtLogin: !!cfg.autostart }); } catch (e) { logLine('автозапуск: ' + e.message); } }
let tray = null;
function makeTray() {   // в Windows и Linux нет дока: значок в трее с меню
  if (process.platform === 'darwin' || tray) return;
  try {
    const f = [path.join(__dirname, 'icon.png'), path.join(__dirname, '..', 'build', 'icon.png')].find((p) => fs.existsSync(p));
    if (!f) return;
    tray = new Tray(nativeImage.createFromPath(f).resize({ width: 20, height: 20 }));
    tray.setToolTip('Kotomag');
    const build = () => Menu.buildFromTemplate([{ label: L().settings, click: openSettings }, { label: L().quit, click: () => app.quit() }]);
    tray.setContextMenu(build()); tray.on('click', openSettings);
  } catch (e) { logLine('трей: ' + e.message); }
}
function sendCfg() {
  send('config', cfgForUi());
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.webContents.send('cfg', cfgForUi());
}
function saveCfg() {
  try { fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 1)); } catch (e) { /* не критично */ }
}
function send(ch, data) {
  if (win && !win.isDestroyed()) win.webContents.send(ch, data);
}
function place() {
  if (!win) return;
  const wa = screen.getPrimaryDisplay().workArea;
  win.setBounds({ x: process.env.KOTOMAG_OFFSCREEN ? -6000 : wa.x, y: tall ? wa.y : wa.y + wa.height - H, width: wa.width, height: tall ? wa.height : H });   // KOTOMAG_OFFSCREEN: тестовые запуски не показывают второго кота на экране
}

// ---------- анекдоты и смешные картинки ----------
const LOCAL_JOKES = [
  'Колдун говорит коту: «Сегодня у меня новое заклинание!» Кот: «Сначала налей молока, а потом колдуй».',
  'Программист спрашивает кота: «Почему ты сидишь на клавиатуре?» Кот: «Я оптимизирую твой код: удаляю всё лишнее».',
  '— Доктор, я всё время путаю котов с коробками! — А коробки? — А коробки с котами тоже.',
  'Кот сбросил со стола кружку и смотрит в глаза. Это не баг, это тестирование гравитации.',
  'Волшебник превратил кота в тигра. Тигр съел волшебника. Мораль: не лечи кота от лени, а то будет ещё хуже.',
  '— Алло, это служба доставки? Мы заказывали дождь, а нам привезли град. — Ничего не знаю, колдуйте обратно.',
  'Пришёл кот к мудрецу: «Скажи, в чём смысл жизни?» — «Греться на солнышке». — «А если нет солнышка?» — «Тогда на ноутбуке».',
  'Хозяин: «Я купил тебе новую лежанку!» Кот залез в коробку от лежанки. Классика.',
  '— Как ты меня нашёл? — Я же кот, я всегда знаю, где холодильник.',
  'Дедлайн похож на кота: всё время сидит на твоей клавиатуре и мешает работать.',
  'Если кот смотрит в пустой угол, он не видит призраков. Он следит за тем, чтобы ты не расслаблялся.',
  'Волшебная палочка у кота есть: хвост. Взмахнёт, и миска сама наполняется. Ну, почти.',
  '— Почему ты не колдуешь? — Не хватает маны. — Попробуй поспать 16 часов, как кот.',
  'Тёмный маг: «Я заберу твою душу!» Кот: «Забери, только вон ту сосиску не трогай».',
  'Программист: «У меня нет багов, только фичи». Кот ночью: «Теперь будет ещё одна фича на твоём ковре».',
  'Кот провёл ревизию на столе: упало всё, кроме моего терпения. Оно упало вторым.',
  'Если долго смотреть на кота, кот начнёт смотреть на тебя. И тогда ты станешь его питомцем.',
  'Самое страшное заклинание: «Встань, у меня еда закончилась» в 5:00 утра.',
  'Волшебник запрограммировал заклинание на 100 строк. Кот прошёл по клавиатуре и всё починил.',
  '— Сколько тебе лет? — Девять жизней, три потрачено. Остальное при себе.'
];
const pick = (a) => a[(Math.random() * a.length) | 0];
// грубые шутки: необязательный фильтр (в настройках «Фильтровать грубые шутки»)
const RUDE = /(?<![а-яё])(?:на|по|за|вы|от|до|ох|о)?х[уy](?:й|е|ё|я)|пизд|(?<![а-яё])(?:вы|за|на|по|до|об|съ|у|от|ра[зс]|под|пере|при)?[её]б(?:а|у|л|н|т|ё)|бляд|блят|муд[аи]к|залуп|говн|дерьм|(?<![а-яё])сра(?:ть|л|н)|жоп[аыуе]|трахн|трахал|трахат|шлюх|проститу|минет|порно|оргазм|fuck|\b(?:shit\w*|dick|cock|pussy|bitch\w*|asshole|whore|porn\w*|sex)\b/i;
const rude = (t) => cfg.jokeFilter && RUDE.test(t);
async function fetchJokeEn() {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch('https://v2.jokeapi.dev/joke/Programming,Misc,Pun?blacklistFlags=religious,political,racist,sexist' + (cfg.jokeFilter ? ',nsfw,explicit' : '') + '&type=single', { signal: AbortSignal.timeout(7000) });
      const j = await r.json();
      const t = String(j.joke || '').replace(/\r/g, '').trim();
      if (j.error || t.length < 20 || t.length > 420 || rude(t)) continue;
      return { text: t, source: 'jokeapi.dev' };
    } catch (e) { logLine('joke: ' + (e && e.message)); }
  }
  return { text: pick(LOCAL_JOKES_EN), source: 'local' };
}
async function fetchJoke() {
  if (cfg.lang === 'en') return fetchJokeEn();
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch('http://rzhunemogu.ru/RandJSON.aspx?CType=1', { signal: AbortSignal.timeout(7000) });
      const txt = new TextDecoder('windows-1251').decode(Buffer.from(await r.arrayBuffer()));
      const mt = txt.match(/"content":"([\s\S]*)"\}\s*$/);
      if (!mt) continue;
      const t = mt[1].replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim();
      if (t.length < 20 || t.length > 420 || rude(t)) continue;
      return { text: t, source: 'rzhunemogu.ru' };
    } catch (e) { logLine('анекдот: ' + (e && e.message)); }
  }
  return { text: pick(LOCAL_JOKES), source: 'local' };
}
async function toDataUrl(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
  const ct = (r.headers.get('content-type') || '').split(';')[0];
  if (!/^image\/(png|jpe?g|gif|webp)$/.test(ct)) throw new Error('не картинка: ' + ct);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 2_500_000) throw new Error('слишком большая');
  return `data:${ct};base64,${buf.toString('base64')}`;
}
async function fetchPic() {
  for (let i = 0; i < 3; i++) {
    try {
      if (Math.random() < 0.65) {   // смешные котомемы
        const j = await (await fetch('https://meme-api.com/gimme/catmemes', { signal: AbortSignal.timeout(5000) })).json();
        if (j.nsfw || j.spoiler || !j.url) continue;   // откровенные картинки (пометка NSFW на Reddit) пропускаем
        return { src: await toDataUrl(j.url), caption: '' };
      }
      const j = await (await fetch('https://api.thecatapi.com/v1/images/search', { signal: AbortSignal.timeout(5000) })).json();
      return { src: await toDataUrl(j[0].url), caption: '' };
    } catch (e) { logLine('картинка: ' + (e && e.message)); }
  }
  return null;
}
ipcMain.handle('joke', () => fetchJoke());
ipcMain.handle('pic', () => fetchPic());

// ---------- окно ----------
app.whenReady().then(() => {
  cfgFile = path.join(app.getPath('userData'), 'config.json');
  loadCfg();
  if (app.dock) app.dock.hide();
  win = new BrowserWindow({
    x: 0, y: 0, width: 800, height: H,
    transparent: true, frame: false, hasShadow: false, resizable: false, movable: false,
    focusable: false, skipTaskbar: true, alwaysOnTop: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  place();
  win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  win.webContents.on('did-finish-load', () => { sendCfg(); win.showInactive(); });
  screen.on('display-metrics-changed', place);
  screen.on('display-added', place);
  screen.on('display-removed', place);
  setInterval(pollCursor, 33);
  setInterval(() => { const q = C.isQuiet(cfg); if (q !== lastQuiet) { lastQuiet = q; sendCfg(); } }, 20000);
  mon = sysmon.create(() => cfg, (ev) => { if (!C.isQuiet(cfg)) send('sys', ev); }, () => { try { return powerMonitor.getSystemIdleTime(); } catch (e) { return 0; } }, logLine);
  mon.start();
  registerLaser();
  makeTray(); if (app.isPackaged) applyAutostart();
  let wasIdle = false;   // радость, когда вы вернулись после долгого отсутствия
  setInterval(() => {
    try {
      const idle = powerMonitor.getSystemIdleTime();
      if (idle > 1200) wasIdle = true;
      else if (wasIdle && idle < 6) { wasIdle = false; if (cfg.play && cfg.welcome && !C.isQuiet(cfg)) send('act', 'joy'); }
    } catch (e) { /* нет данных об простое */ }
  }, 3000);
});

function logLine(msg) {
  try {
    const f = path.join(app.getPath('userData'), 'log.txt');
    try { if (fs.statSync(f).size > 200000) fs.truncateSync(f, 0); } catch (e) { /* файла ещё нет */ }
    fs.appendFileSync(f, `${new Date().toISOString()} ${msg}\n`);
  } catch (e) { /* журнал необязателен */ }
}
ipcMain.on('log', (_e, msg) => { if (process.env.KOTOMAG_DEBUG) logLine('[окно] ' + msg); });   // подробный журнал окна только в режиме отладки
ipcMain.on('win-tall', (_e, v) => { tall = !!v; place(); });

ipcMain.on('ignore', (_e, flag) => {
  if (win) win.setIgnoreMouseEvents(!!flag, { forward: true });
});

// положение курсора берём у системы, а не из переданных окну событий мыши: так клик по баннеру работает всегда,
// даже если macOS перестала пересылать движения мыши сквозь прозрачное окно
// красная точка лазера в месте курсора: отдельное прозрачное окно на весь экран, клики проходят насквозь
let dotWin = null, dotOn = false;
function ensureDot() {
  if (dotWin && !dotWin.isDestroyed()) return;
  const b = screen.getPrimaryDisplay().bounds;
  dotWin = new BrowserWindow({
    x: process.env.KOTOMAG_OFFSCREEN ? -9000 : b.x, y: b.y, width: b.width, height: b.height,
    transparent: true, frame: false, hasShadow: false, resizable: false, movable: false, focusable: false, skipTaskbar: true, alwaysOnTop: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'dotpreload.js'), contextIsolation: true },
  });
  dotWin.setAlwaysOnTop(true, 'screen-saver');
  dotWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  dotWin.setIgnoreMouseEvents(true);
  dotWin.loadFile(path.join(__dirname, 'ui', 'dot.html'));
}
ipcMain.on('laser', (_e, on) => {
  dotOn = !!on; logLine('лазер: точка ' + (dotOn ? 'показана' : 'скрыта'));
  if (dotOn) { ensureDot(); dotWin.showInactive(); } else if (dotWin && !dotWin.isDestroyed()) dotWin.hide();
});

let lastCur = '';
function pollCursor() {
  if (!win || win.isDestroyed()) return;
  const p = screen.getCursorScreenPoint(), b = win.getBounds();
  const x = Math.round(p.x - b.x), y = Math.round(p.y - b.y);
  if (dotOn && dotWin && !dotWin.isDestroyed()) { const db = dotWin.getBounds(); dotWin.webContents.send('dot', { x: p.x - db.x, y: p.y - db.y }); }
  const key = `${x},${y}`;
  if (key === lastCur) return;
  lastCur = key;
  win.webContents.send('cursor', { x, y, inside: x >= 0 && y >= 0 && x < b.width && y < b.height });
}

// ---------- окно настроек ----------
function openSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.show(); settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 880, height: 700, minWidth: 720, minHeight: 520, title: 'Kotomag', backgroundColor: '#150d29', show: false,
    webPreferences: { preload: path.join(__dirname, 'settingsPreload.js'), contextIsolation: true },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, 'settings', 'settings.html'));
  settingsWin.once('ready-to-show', () => { try { if (app.dock) app.dock.show(); } catch (e) { /* без дока */ } settingsWin.show(); if (process.platform === 'darwin') app.focus({ steal: true }); });
  settingsWin.on('closed', () => { settingsWin = null; try { if (app.dock) app.dock.hide(); } catch (e) { /* без дока */ } });
}
ipcMain.on('open-settings', openSettings);
ipcMain.on('hotkey-probe', () => { probeUntil = Date.now() + 12000; logLine('проверка горячей клавиши: жду нажатие 12 с'); });
ipcMain.on('open-access', (_e, which) => shell.openExternal('x-apple.systempreferences:com.apple.preference.security?' + (which === 'input' ? 'Privacy_ListenEvent' : 'Privacy_Accessibility')));
ipcMain.on('ask-access', () => { try { logLine('запрос доступа к универсальному доступу: ' + systemPreferences.isTrustedAccessibilityClient(true)); } catch (e) { logLine('запрос доступа: ' + e.message); } });
ipcMain.on('open-fda', () => shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'));
ipcMain.on('open-log', () => shell.showItemInFolder(path.join(app.getPath('userData'), 'log.txt')));
ipcMain.handle('cfg-get', () => cfgForUi());
ipcMain.on('cfg-set', (_e, patch) => { const k0 = cfg.laserKey + cfg.laserKeyOn, a0 = cfg.autostart; cfg = C.clean(C.merge(cfg, patch || {})); if (cfg.laserKey + cfg.laserKeyOn !== k0) registerLaser(); if (cfg.autostart !== a0) applyAutostart(); saveCfg(); lastQuiet = C.isQuiet(cfg); sendCfg(); });
ipcMain.on('cfg-reset', () => { const lang = cfg.lang; cfg = C.clean(C.merge(C.DEFAULTS, { lang })); registerLaser(); saveCfg(); sendCfg(); });
ipcMain.on('cfg-act', (_e, kind) => send('act', String(kind)));
ipcMain.handle('sys-now', async () => (mon ? mon.snapshot() : null));
ipcMain.on('sys-test', async (_e, kind) => {
  const s0 = mon ? await mon.snapshot() : {};
  const demo = { trash: { kind: 'trash', count: (s0.trash && s0.trash.count) || 42, mb: s0.trash && s0.trash.mb != null ? s0.trash.mb : 840 }, mem: { kind: 'mem', pct: 93, top: (s0.mem && s0.mem.top) || 'Chrome', topGB: (s0.mem && s0.mem.topGB) || 3.2 }, cpu: { kind: 'cpu', pct: 96, top: (s0.cpu && s0.cpu.top) || 'node', topPct: 180 }, disk: { kind: 'disk', freeGB: 9.4 }, battery: { kind: 'battery', pct: 14 }, uptime: { kind: 'uptime', days: 21 }, brk: { kind: 'brk', minutes: 95 } };
  if (demo[kind]) send('sys', demo[kind]);
});

ipcMain.on('menu', () => {
  const t = L(), q = C.isQuiet(cfg);
  const act = (k) => ({ label: k === 'laser' && cfg.laserKeyOn ? `${t.a[k]} (${C.prettyAccel(cfg.laserKey)})` : t.a[k], click: () => send('act', k) });
  const tpl = [
    { label: t.settings, click: openSettings },
    { label: q ? t.quietOn : t.quietOff, click: () => { cfg.quiet.manual = !cfg.quiet.manual; saveCfg(); lastQuiet = C.isQuiet(cfg); sendCfg(); } },
    { label: t.report, click: async () => { const snap = mon ? await mon.snapshot() : null; if (snap) send('sys', { kind: 'report', ...snap }); } },
    { type: 'separator' },
    { label: t.joke, click: () => send('act', 'joke') },
    { label: t.pic, click: () => send('act', 'pic') },
    { label: t.acts, submenu: ['yarn', 'coffee', 'book', 'dance', 'fish', 'hat', 'potion', 'yawn', 'levit', 'bubbles', 'mouse', 'clones', 'fireworks', 'run', 'laser', 'portal', 'joy'].map(act) },
    { type: 'separator' },
    { label: t.quit, click: () => app.quit() },
  ];
  Menu.buildFromTemplate(tpl).popup({ window: win });
});

app.on('second-instance', () => send('say', L().here));
app.on('will-quit', () => { globalShortcut.unregisterAll(); stopKeyPoll(); });
app.on('window-all-closed', () => { /* кот живёт, пока не выбрали «Выйти» */ });
