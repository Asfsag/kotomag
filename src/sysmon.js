// Что происходит с компьютером: корзина, память, процессор, диск, батарея, время работы, перерывы.
// Ничего не отправляется наружу: данные берутся командами macOS и сразу показываются котом.
const { execFile } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const run = (cmd, args, ms = 5000) => new Promise((res) => execFile(cmd, args, { timeout: ms, maxBuffer: 4e6 }, (e, out) => res(e ? '' : String(out))));

const MAC = process.platform === 'darwin', WIN = process.platform === 'win32';
const psh = (script, ms = 12000) => run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], ms);
const cleanProc = (n) => String(n || '').replace(/#\d+$/, '').replace(/\.exe$/i, '').trim();

// память: процент занятой берём быстро, название самого прожорливого приложения — только когда нужно (full)
async function getMem(full = true) {
  let usedPct;
  if (MAC) { const out = await run('/usr/bin/memory_pressure', ['-Q']); const m = out.match(/free percentage:\s*(\d+)%/i); usedPct = m ? 100 - +m[1] : Math.round((1 - os.freemem() / os.totalmem()) * 100); }
  else usedPct = Math.round((1 - os.freemem() / os.totalmem()) * 100);
  const r = { usedPct, totalGB: os.totalmem() / 2 ** 30, top: '', topGB: 0 };
  if (!full) return r;
  if (WIN) {
    const o = await psh("Get-Process | Where-Object { $_.ProcessName -ne 'Idle' } | Sort-Object WorkingSet64 -Descending | Select-Object -First 1 | ForEach-Object { $_.ProcessName + '|' + $_.WorkingSet64 }");
    const m = o.trim().match(/^(.+)\|(\d+)$/); if (m) { r.top = cleanProc(m[1]); r.topGB = +m[2] / 2 ** 30; }
  } else {
    const ps = await run('/bin/ps', MAC ? ['-Aceo', 'rss=,pcpu=,comm=', '-m'] : ['-Aeo', 'rss=,pcpu=,comm=', '--sort=-rss']);
    const line = ps.split('\n').map((l) => l.match(/^\s*(\d+)\s+([\d.]+)\s+(.+?)\s*$/)).find(Boolean);
    if (line) { r.top = line[3]; r.topGB = +line[1] / 2 ** 20; }
  }
  return r;
}
async function topCpu() {
  if (WIN) {
    const o = await psh("Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -ne '_Total' -and $_.Name -ne 'Idle' } | Sort-Object PercentProcessorTime -Descending | Select-Object -First 1 | ForEach-Object { $_.Name + '|' + $_.PercentProcessorTime }");
    const m = o.trim().match(/^(.+)\|(\d+)$/); return m ? { top: cleanProc(m[1]), topPct: +m[2] } : { top: '', topPct: 0 };
  }
  const ps = await run('/bin/ps', MAC ? ['-Aceo', 'pcpu=,comm=', '-r'] : ['-Aeo', 'pcpu=,comm=', '--sort=-pcpu']);
  const line = ps.split('\n').map((l) => l.match(/^\s*([\d.]+)\s+(.+?)\s*$/)).find((m) => m && !['ps', 'Котомаг', 'Kotomag', 'Electron', 'kotomag'].includes(m[2]));
  return line ? { top: line[2], topPct: +line[1] } : { top: '', topPct: 0 };
}
function getDisk() {
  try { const root = WIN ? (process.env.SystemDrive || 'C:') + '\\' : '/'; const s = fs.statfsSync(root); return { freeGB: (s.bavail * s.bsize) / 1e9, totalGB: (s.blocks * s.bsize) / 1e9 }; } catch (e) { return null; }
}
async function getBattery() {
  if (MAC) {
    const out = await run('/usr/bin/pmset', ['-g', 'batt']);
    const m = out.match(/(\d+)%;\s*([a-z ]+)/i);
    return m ? { pct: +m[1], charging: !/discharging/i.test(m[2]), onAC: /AC Power/i.test(out) } : null;
  }
  if (WIN) {
    const o = await psh("Get-CimInstance Win32_Battery | Select-Object -First 1 | ForEach-Object { [string]$_.EstimatedChargeRemaining + '|' + [string]$_.BatteryStatus }");
    const m = o.trim().match(/^(\d+)\|(\d+)$/); return m ? { pct: +m[1], charging: +m[2] !== 1, onAC: +m[2] !== 1 } : null;
  }
  try { const d = '/sys/class/power_supply/BAT0'; const pct = +fs.readFileSync(d + '/capacity', 'utf8'); const st = fs.readFileSync(d + '/status', 'utf8').trim(); return { pct, charging: st !== 'Discharging', onAC: st !== 'Discharging' }; } catch (e) { return null; }
}
// корзина: на Mac читаем папку, а если macOS не пускает (нужен «Полный доступ к диску»), спрашиваем Finder (хотя бы число предметов)
async function getTrash() {
  if (WIN) {
    const o = await psh("$i = (New-Object -ComObject Shell.Application).NameSpace(10).Items(); $n = 0; $s = 0; foreach ($x in $i) { $n++; $s += $x.Size }; [string]$n + '|' + [string]$s", 20000);
    const m = o.trim().match(/^(\d+)\|(-?\d+)$/); return m ? { count: +m[1], mb: +m[2] > 0 ? +m[2] / 2 ** 20 : null, exact: true } : null;
  }
  const dir = MAC ? path.join(os.homedir(), '.Trash') : path.join(os.homedir(), '.local', 'share', 'Trash', 'files');
  try {
    const names = fs.readdirSync(dir).filter((n) => n !== '.DS_Store');
    const du = await run('/usr/bin/du', ['-sk', dir], 15000);
    const kb = +(du.split(/\s/)[0]);
    return { count: names.length, mb: Number.isFinite(kb) && kb >= 0 ? kb / 1024 : null, exact: true };
  } catch (e) { /* нет доступа к папке */ }
  if (!MAC) return null;
  const out = await run('/usr/bin/osascript', ['-e', 'tell application "Finder" to count items of trash'], 8000);
  const n = parseInt(out, 10);
  return Number.isFinite(n) ? { count: n, mb: null, exact: false } : null;
}

function create(getCfg, emit, getIdle, log = () => {}) {
  const cpuSamples = [];   // { t, pct } раз в 5 секунд
  let last = os.cpus().map((c) => ({ ...c.times }));
  const cooldown = {};
  const holdMem = { n: 0 };
  let activeSince = Date.now(), lastTrashAt = 0, timers = [];

  function sampleCpu() {
    const cur = os.cpus().map((c) => ({ ...c.times })); let idle = 0, total = 0;
    cur.forEach((c, i) => { const p = last[i] || c; for (const k of Object.keys(c)) { const d = c[k] - (p[k] || 0); total += d; if (k === 'idle') idle += d; } });
    last = cur;
    if (total > 0) { cpuSamples.push({ t: Date.now(), pct: Math.round((1 - idle / total) * 100) }); if (cpuSamples.length > 400) cpuSamples.shift(); }
  }
  const cpuAvg = (min) => { const from = Date.now() - Math.max(1, min) * 60000, a = cpuSamples.filter((s) => s.t >= from); return a.length ? Math.round(a.reduce((s, x) => s + x.pct, 0) / a.length) : 0; };
  const ready = (kind, cd) => { const c = cd ?? getCfg().sys.cooldownMin * 60000; if (Date.now() - (cooldown[kind] || 0) < c) return false; cooldown[kind] = Date.now(); return true; };

  async function snapshot() {
    const [mem, trash, bat, tc] = await Promise.all([getMem(), getTrash(), getBattery(), topCpu()]);
    return { mem, trash, battery: bat, disk: getDisk(), cpu: { pct: cpuAvg(1) || (cpuSamples.at(-1) || {}).pct || 0, ...tc }, uptimeDays: os.uptime() / 86400 };
  }
  async function tick() {
    const c = getCfg(); if (!c.sys.on) return;
    const s = c.sys;
    try {
      // перерыв: считаем время непрерывной работы за компьютером
      const idle = getIdle();
      if (idle > 300) activeSince = Date.now();
      else if (s.brk.on && Date.now() - activeSince > s.brk.everyMin * 60000 && ready('brk', s.brk.everyMin * 60000)) { emit({ kind: 'brk', minutes: Math.round((Date.now() - activeSince) / 60000) }); activeSince = Date.now(); }
      if (s.mem.on) {
        const m = await getMem(false);
        holdMem.n = m.usedPct >= s.mem.pct ? holdMem.n + 1 : 0;
        if (holdMem.n > s.mem.holdMin && ready('mem')) { const f = await getMem(true); emit({ kind: 'mem', pct: f.usedPct, top: f.top, topGB: f.topGB }); }
      }
      if (s.cpu.on && cpuAvg(Math.max(1, s.cpu.holdMin)) >= s.cpu.pct && cpuSamples.length > 12 && ready('cpu')) { const t = await topCpu(); emit({ kind: 'cpu', pct: cpuAvg(Math.max(1, s.cpu.holdMin)), top: t.top, topPct: t.topPct }); }
      if (s.disk.on) { const d = getDisk(); if (d && d.freeGB <= s.disk.freeGB && ready('disk')) emit({ kind: 'disk', freeGB: d.freeGB }); }
      if (s.battery.on) { const b = await getBattery(); if (b && !b.charging && b.pct <= s.battery.pct && ready('battery', 20 * 60000)) emit({ kind: 'battery', pct: b.pct }); }
      if (s.uptime.on && os.uptime() / 86400 >= s.uptime.days && ready('uptime', 24 * 3600 * 1000)) emit({ kind: 'uptime', days: Math.floor(os.uptime() / 86400) });
      if (s.trash.on && Date.now() - lastTrashAt > s.trash.everyMin * 60000) {
        lastTrashAt = Date.now();
        const t = await getTrash();
        if (t && t.count > 0 && ((t.mb !== null && t.mb >= s.trash.minMB) || (t.mb === null && t.count >= 25)) && ready('trash', s.trash.everyMin * 60000 * 0.9)) emit({ kind: 'trash', count: t.count, mb: t.mb });
      }
    } catch (e) { log('sysmon: ' + (e && e.message)); }
  }
  return {
    start() { timers.push(setInterval(sampleCpu, 5000), setInterval(tick, 60000)); setTimeout(tick, 20000); },
    stop() { timers.forEach(clearInterval); timers = []; },
    snapshot, tick,
  };
}
module.exports = { create, getMem, getTrash, getBattery, getDisk, topCpu };
