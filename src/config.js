// Настройки Котомага: значения по умолчанию, слияние с сохранённым файлом, проверка границ.
const DEFAULTS = {
  lang: 'ru',            // ru | en
  sarcasm: 1,            // 0 милый, 1 с лёгкой иронией, 2 саркастичный, 3 ядовитый
  say: true,             // реплики-облачка
  sayTime: 1.5,          // во сколько раз дольше обычного висят реплики
  sayGap: 2,             // пауза между репликами, секунд (в портале паузы нет)
  chat: true, chatMin: 6, chatMax: 14,   // болтовня от скуки: раз в N–M минут
  sayChance: 100,        // % случаев, когда кот комментирует занятие
  sound: true, follow: true, jokes: true, play: true,
  jokeFilter: true,      // не показывать грубые шутки (в публичной версии включено)
  autostart: false,      // запускать вместе с системой
  laserKey: 'CommandOrControl+Alt+L', laserKeyOn: true,   // горячая клавиша лазерной указки
  welcome: true,         // радуется, когда вы вернулись
  sleep: true,           // засыпает, если долго нет дел
  actMin: 8, actMax: 18,        // занятия сами: раз в N–M минут
  jokeMin: 25, jokeMax: 50,     // анекдот/картинка сами: раз в N–M минут
  acts: {                // 0 выкл, 1 редко, 2 обычно, 3 часто
    yarn: 2, coffee: 2, book: 2, portal: 2, levit: 2, bubbles: 2, clones: 2, fireworks: 2,
    mouse: 2, fish: 2, hat: 2, potion: 2, yawn: 1, dance: 1, run: 2,
  },
  quiet: { manual: false, schedule: false, from: '23:00', to: '08:00' },
  sys: {
    on: true, cooldownMin: 30,
    trash: { on: true, everyMin: 60, minMB: 200 },
    mem: { on: true, pct: 88, holdMin: 2 },
    cpu: { on: true, pct: 85, holdMin: 2 },
    disk: { on: true, freeGB: 15 },
    battery: { on: true, pct: 20 },
    uptime: { on: true, days: 14 },
    brk: { on: true, everyMin: 90 },
  },
};
const ACT_KEYS = Object.keys(DEFAULTS.acts);

function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
function merge(base, patch) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(patch || {})) {
    if (isObj(base[k]) && isObj(patch[k])) out[k] = merge(base[k], patch[k]);
    else if (k in base) out[k] = patch[k];
  }
  return out;
}
const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
const hhmm = (v, d) => (/^\d{1,2}:\d{2}$/.test(String(v)) ? String(v) : d);
const MODS = new Set(['CommandOrControl', 'Command', 'Control', 'Alt', 'Option', 'Shift', 'Super']);
const KEYS = /^([A-Z0-9]|F([1-9]|1[0-9]|2[0-4])|Return|Space|Tab|Up|Down|Left|Right|Backspace|Delete|Home|End|PageUp|PageDown|Plus|Minus|Comma|Period|Slash|Backslash|Semicolon|Quote|Backquote|BracketLeft|BracketRight|Equal)$/;
// сочетание клавиш для Electron: хотя бы один модификатор (не только Shift) и одна обычная клавиша
function validAccel(a, platform = process.platform) {
  if (typeof a !== 'string') return false;
  const p = a.split('+'); if (p.length < 2) return false;
  const key = p.pop();
  if (!(KEYS.test(key) && p.every((m) => MODS.has(m)) && p.some((m) => m !== 'Shift') && new Set(p).size === p.length)) return false;
  return !isReserved(p, key, platform);
}
// сочетания, которые нужны системе и программам: их нельзя забирать глобально (⌘A, ⌘C, ⌘Tab, ⌘Пробел и т. п.)
function isReserved(mods, key, platform = process.platform) {
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(key)) return false;
  if (platform !== 'darwin') {   // Windows и Linux: нужен Alt вместе с Ctrl или Shift; Alt+Tab, Alt+F4 и подобное занято
    const w = new Set(mods.map((x) => (x === 'CommandOrControl' ? 'Control' : x === 'Option' ? 'Alt' : x === 'Command' ? 'Super' : x)));
    if (!w.has('Alt') || (!w.has('Control') && !w.has('Shift'))) return true;
    return ['Tab', 'Space', 'Escape'].includes(key) || key === 'F4';
  }
  const m = new Set(mods.map((x) => (x === 'CommandOrControl' || x === 'Super' ? 'Command' : x === 'Option' ? 'Alt' : x)));
  if (!m.has('Alt') && !m.has('Control')) return true;                 // только ⌘ или ⌘⇧ с обычной клавишей
  if (m.size === 1 && m.has('Alt')) return true;                       // только ⌥
  if (m.has('Control') && ['Space', 'Up', 'Down', 'Left', 'Right', 'Tab'].includes(key) && m.size <= 2) return true;   // Mission Control, смена раскладки
  if (m.has('Command') && ['Tab', 'Space', 'Backquote'].includes(key)) return true;
  return false;
}
function prettyAccel(a, platform = process.platform) {
  if (platform === 'darwin') {
    const map = { CommandOrControl: '⌘', Command: '⌘', Control: '⌃', Alt: '⌥', Option: '⌥', Shift: '⇧', Super: '⌘' };
    return String(a).split('+').map((x) => map[x] || ({ Plus: '+', Minus: '-', Comma: ',', Period: '.', Slash: '/', Backslash: '\\', Return: 'Return', Space: 'Space' }[x] || x)).join('');
  }
  const map = { CommandOrControl: 'Ctrl', Command: 'Win', Control: 'Ctrl', Alt: 'Alt', Option: 'Alt', Shift: 'Shift', Super: 'Win' };
  return String(a).split('+').map((x) => map[x] || ({ Plus: '+', Minus: '-', Comma: ',', Period: '.', Slash: '/', Backslash: '\\' }[x] || x)).join('+');
}
function clean(c) {
  const D = DEFAULTS;
  c.lang = c.lang === 'en' ? 'en' : 'ru';
  c.autostart = !!c.autostart; c.jokeFilter = !!c.jokeFilter;
  c.laserKey = validAccel(c.laserKey) ? c.laserKey : D.laserKey; c.laserKeyOn = c.laserKeyOn !== false;
  c.sarcasm = Math.round(num(c.sarcasm, 0, 3, D.sarcasm));
  c.sayChance = Math.round(num(c.sayChance, 0, 100, D.sayChance));
  c.sayGap = Math.round(num(c.sayGap, 0, 120, 2)); c.sayTime = Math.round(num(c.sayTime, 1, 5, 1.5) * 2) / 2;
  c.chat = c.chat !== false; c.chatMin = num(c.chatMin, 1, 240, 6); c.chatMax = Math.max(c.chatMin, num(c.chatMax, 1, 480, 14));
  for (const k of ['say', 'sound', 'follow', 'jokes', 'play', 'welcome', 'sleep']) c[k] = c[k] !== false;
  c.actMin = num(c.actMin, 1, 240, D.actMin); c.actMax = Math.max(c.actMin, num(c.actMax, 1, 480, D.actMax));
  c.jokeMin = num(c.jokeMin, 1, 480, D.jokeMin); c.jokeMax = Math.max(c.jokeMin, num(c.jokeMax, 1, 960, D.jokeMax));
  for (const k of ACT_KEYS) c.acts[k] = Math.round(num(c.acts[k], 0, 3, D.acts[k]));
  c.quiet.manual = !!c.quiet.manual; c.quiet.schedule = !!c.quiet.schedule;
  c.quiet.from = hhmm(c.quiet.from, D.quiet.from); c.quiet.to = hhmm(c.quiet.to, D.quiet.to);
  const s = c.sys; s.on = s.on !== false; s.cooldownMin = num(s.cooldownMin, 1, 600, D.sys.cooldownMin);
  for (const k of ['trash', 'mem', 'cpu', 'disk', 'battery', 'uptime', 'brk']) s[k].on = s[k].on !== false;
  s.trash.everyMin = num(s.trash.everyMin, 5, 1440, 60); s.trash.minMB = num(s.trash.minMB, 0, 100000, 200);
  s.mem.pct = num(s.mem.pct, 50, 99, 88); s.mem.holdMin = num(s.mem.holdMin, 0, 60, 2);
  s.cpu.pct = num(s.cpu.pct, 30, 100, 85); s.cpu.holdMin = num(s.cpu.holdMin, 0, 60, 2);
  s.disk.freeGB = num(s.disk.freeGB, 1, 2000, 15); s.battery.pct = num(s.battery.pct, 5, 60, 20);
  s.uptime.days = num(s.uptime.days, 1, 365, 14); s.brk.everyMin = num(s.brk.everyMin, 15, 480, 90);
  return c;
}
// «не беспокоить» сейчас действует? (ручной переключатель или ночное расписание)
function isQuiet(c, d = new Date()) {
  const q = c.quiet; if (q.manual) return true; if (!q.schedule) return false;
  const [fh, fm] = q.from.split(':').map(Number), [th, tm] = q.to.split(':').map(Number);
  const now = d.getHours() * 60 + d.getMinutes(), a = fh * 60 + fm, b = th * 60 + tm;
  return a === b ? false : a < b ? now >= a && now < b : now >= a || now < b;
}
module.exports = { DEFAULTS, ACT_KEYS, merge, clean, isQuiet, validAccel, prettyAccel, isReserved };
