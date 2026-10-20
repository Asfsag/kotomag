// Котомаг: кот-волшебник из нарисованных кадров (96x96). Позы: покой, ходьба, работает, колдует (готово), ответ, гладят.
// Сон = покой, замедленный и приглушённый. Искры, «!», сердечки, Z и тень рисуются кодом поверх кадров.
(() => {
  const S = 1;                       // экранных точек на пиксель спрайта (1 = вдвое меньше прежнего)
  const FW = 96;                     // размер кадра
  const GW = 128, GH = 112;          // сетка холста: поля под искры и символы
  const OX = 16, OY = 14;            // где в сетке стоит кадр
  const CW = GW * S, CH = GH * S;
  const TIP = [69, 12];              // завиток посоха в кадре (для искр)
  const HEAD = [50, 30];             // голова (для сердечек и Z)

  // кот собран из обычных элементов страницы (картинка кадра, тень, слой эффектов): так он всегда перерисовывается
  const cat = document.getElementById('cat');
  const liftEl = document.getElementById('lift');       // всё, что поднимается над землёй (кот и эффекты); тень остаётся внизу
  const spriteEl = document.getElementById('sprite');
  const fxEl = document.getElementById('fx');
  const ctx = fxEl.getContext('2d');           // только искры, «!», сердечки, Z
  const bubble = document.getElementById('bubble');
  cat.style.width = CW + 'px'; cat.style.height = CH + 'px';
  liftEl.style.width = CW + 'px'; liftEl.style.height = CH + 'px';
  fxEl.width = CW; fxEl.height = CH; fxEl.style.width = CW + 'px'; fxEl.style.height = CH + 'px';
  spriteEl.style.transformOrigin = '50% 30%';
  Object.assign(spriteEl.style, { left: OX * S + 'px', top: OY * S + 'px', width: FW * S + 'px', height: FW * S + 'px' });
  const ell = (id, rx, ry, cy) => { const e = document.getElementById(id); Object.assign(e.style, { left: ((OX + FW / 2 - rx) * S) + 'px', width: (2 * rx * S) + 'px', top: ((OY + cy - ry) * S) + 'px', height: (2 * ry * S) + 'px' }); };
  ell('shadow1', 38, 5, 90); ell('shadow2', 26, 3.2, 90);
  bubble.style.bottom = (CH + 4) + 'px';
  ctx.imageSmoothingEnabled = false;

  // ---------- кадры ----------
  const COUNTS = { idle: 8, walk: 12, work: 8, cast: 16, attn: 8, pet: 8, drag: 8, conj: 16, yarn: 16, play: 10, sip: 16, book: 16, joy: 16, dance: 16, trans: 16, run: 16, pout: 15, pdive: 15, pwave: 16, portal: 16, fcast: 16, fwait: 16, fpull: 8, hat1: 16, hat2: 16, pstir: 16, yawn: 16 };   // drag: если кадров нет, берём «ответ»; conj: если нет, берём cast
  const FRAMES = {};
  for (const [name, n] of Object.entries(COUNTS)) {
    FRAMES[name] = [];
    for (let i = 1; i <= n; i++) { const im = new Image(); im.src = `sprites/${name}-${i}.png`; FRAMES[name].push(im); }
  }
  const dbg = (m) => { try { window.kotomag.log(m); } catch (e) { /* нет журнала */ } };
  const hasDrag = () => FRAMES.drag.every((im) => im.complete && im.naturalWidth > 0);
  const hasConj = () => FRAMES.conj.every((im) => im.complete && im.naturalWidth > 0);

  // маски прозрачности кадров: по ним определяем, навёл ли пользователь мышь на кота (холст не читаем: так он остаётся на GPU)
  const MASK = {};
  function maskFor(set, idx) {
    const key = set + idx;
    if (MASK[key]) return MASK[key];
    const im = FRAMES[set][idx % FRAMES[set].length];
    if (!im.complete || !im.naturalWidth) return null;
    const c = document.createElement('canvas'); c.width = c.height = FW;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, FW, FW).data, m = new Uint8Array(FW * FW);
    for (let i = 0; i < FW * FW; i++) m[i] = d[i * 4 + 3] > 24 ? 1 : 0;
    return (MASK[key] = m);
  }
  let cur = { set: 'idle', idx: 0 };

  // ---------- эффекты ----------
  const GLYPH = {
    '!': ['11', '11', '11', '11', '11', '00', '11', '11'],
    Z: ['11111', '00011', '00110', '01100', '11000', '11111'],
    H: ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'],
    N: ['00111', '00101', '00101', '01101', '11100', '11000'],
  };
  const COL = { Y: '#ffd447', W: '#ffffff', G: '#19c37d', p: '#9a74e0', R: '#ff5d73', Z: '#e6dff2', B: '#9ad4f0', S: '#dfe6f2' };
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * S, Math.round(y) * S, w * S, h * S); }
  function glyph(name, x, y, c, sc = 1) {
    GLYPH[name].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') rect(x + i * sc, y + j * sc, sc, sc, c); }));
  }

  // ---------- звук ----------
  let sound = true;
  let CFG = { lang: 'ru', sarcasm: 1, say: true, sayChance: 100, actMin: 8, actMax: 18, jokeMin: 25, jokeMax: 50, sleep: true, quietNow: false, acts: { yarn: 2, coffee: 2, book: 2, portal: 2, levit: 2, bubbles: 2, clones: 2, fireworks: 2, mouse: 2, fish: 2, hat: 2, potion: 2, yawn: 1, dance: 1, run: 2 } };
  const T = (k, p) => PH.T(k, p);
  const quiet = () => !!CFG.quietNow;
  const W_ACT = [0, 0.5, 1, 2];
  let ac = null;
  function blip(seq, wave = 'square', vol = 0.05) {
    if (!sound) return;
    try {
      ac = ac || new AudioContext();
      let t = ac.currentTime;
      for (const [f, d] of seq) {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.type = wave; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
        t += d * 0.9;
      }
    } catch (e) { /* звук необязателен */ }
  }
  const SND = {
    done: () => blip([[523, .09], [659, .09], [784, .09], [1047, .22]]),
    attn: () => blip([[880, .12], [660, .12], [880, .12], [660, .18]], 'square', 0.06),
    nudge: () => blip([[660, .1], [880, .16]], 'triangle', 0.06),
    pet: () => blip([[988, .07], [1319, .1]], 'triangle', 0.05),
    pick: () => blip([[660, .05], [880, .07]], 'triangle', 0.05),
    land: () => blip([[330, .06], [220, .08]], 'triangle', 0.05),
    magic: () => blip([[784, .06], [988, .06], [1319, .14]], 'triangle', 0.05),
  };

  // ---------- состояние ----------
  const busy = new Map();
  const attn = new Map();
  const dones = new Map();   // сессии с готовой задачей: висят, пока пользователь не нажмёт
  let doneRemindAt = 0, doneReminds = 0;
  let nudge = null;        // { until, sid, label, text }
  let catX = 120, dir = 1, target = null;
  const t0 = performance.now();
  let last = t0, lastActivity = t0;
  let wanderAt = t0 + 2500;
  let nextRemind = 0, reminds = 0;
  let petAt = -1e9, castAt = -1e9;
  let bubbleKey = '';
  let sleeping = false;
  const mouse = { x: -9999, y: -9999, t: -1e9 };   // где курсор (видим только над полосой окна)
  let nearSince = 0, lastJoy = -1e9, followOn = true, autoOn = true;
  const picEl = document.getElementById('pic'), picImg = document.getElementById('picimg');
  let needTall = false;       // баннер или картинка не помещаются в обычное окно: растягиваем его
  const BASE_H = 400;         // высота обычного окна (как H в main.js)
  let cursorX = -9999;
  let portal = null;          // портал: { phase: vanish|gone|appear|wave, start, kind, n, i, home, stop, tall }
  let runSeq = null;          // бег на четвереньках: { phase: in|run|out, start }
  let yarn = null;            // занятие: { start, kind } kind: yarn|coffee|book|joy|dance
  let pendingDance = 0, busyStart = new Map(), nextDance = performance.now() + (120 + Math.random() * 120) * 60000, lastMoveAt = 0;
  let yarnOn = true, nextYarn = performance.now() + (8 + Math.random() * 10) * 60000;
  let acting = false;         // идёт «колдовство»: ждём анекдот или картинку
  let note = null;            // анекдот: { text, until }
  let picNote = null;         // картинка: { until }
  let conjAt = -1e9, conjKind = '', conjPending = null, nextAuto = performance.now() + 20 * 60000 + Math.random() * 20 * 60000;
  let dragging = false, down = null, lift = 0, vy = 0, bounces = 0, tall = false;
  const setTall = (v) => { if (tall !== v) { tall = v; window.kotomag.setTall(v); } };
  const parts = [];

  const W = () => window.innerWidth;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const tipPos = () => [OX + (dir > 0 ? TIP[0] : FW - TIP[0]), OY + TIP[1]];
  const headPos = () => [OX + (dir > 0 ? HEAD[0] : FW - HEAD[0]), OY + HEAD[1]];

  const side = (dx) => (dir > 0 ? dx : -dx);
  function dots(x, y, n, rad) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = Math.random() * rad; rect(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.random() < 0.4 ? 2 : 1, Math.random() < 0.4 ? 2 : 1, COL[['Y', 'W', 'G', 'p'][(Math.random() * 4) | 0]]); } }
  function spark(x, y, n, speed, cols) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = rnd(.3, 1) * speed;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.5, 1.1), t: 0, c: cols[(Math.random() * cols.length) | 0] });
    }
  }

  // ---------- режим ----------
  function mode(now) {
    if (window.__forceMode) return window.__forceMode;
    if (dragging) return 'drag';
    if (lift > 0.5 && !portal && !(yarn && yarn.kind === 'levit') && !(runSeq && (runSeq.kind === 'laser' || runSeq.kind === 'mouse'))) return 'fall';
    if (attn.size) return 'attn';
    if (now - castAt < 1700) return 'cast';
    if (now - petAt < 1100) return 'pet';
    if (acting || now - conjAt < 1500) return 'conj';
    if (yarn && (yarn.kind === 'dance' || yarn.kind === 'joy')) return 'yarn';
    if (dones.size) return 'done';
    if (portal) return 'portal';
    if ((note && now < note.until) || (picNote && now < picNote.until)) return 'show';
    // busy.size не влияет на кота: пока идёт работа, он живёт как обычно (прерванные сессии никогда не присылают Stop)
    if (nudge && now < nudge.until) return 'nudge';
    if (yarn) return 'yarn';
    if (runSeq) return 'run';
    if (CFG.sleep !== false && now - lastActivity > 120000) return 'sleep';
    return target !== null ? 'walk' : 'idle';
  }

  // ---------- рисование кадра ----------
  let shown = '';
  function showFrame(set, idx, o = {}) {
    const n = FRAMES[set].length, im = FRAMES[set][((Math.floor(idx) % n) + n) % n];
    if (!im || !im.complete || !im.naturalWidth) return;
    if (im.src !== shown) { spriteEl.src = im.src; shown = im.src; }
    spriteEl.style.transform = ((o.dir ?? dir) < 0 ? 'scaleX(-1)' : '') + (o.rot ? ` rotate(${o.rot}deg)` : '');
    spriteEl.style.filter = o.filter || (o.dim ? 'brightness(0.78) saturate(0.8)' : '');
  }
  const drawLanded = { done: false };
  function draw(now, dt) {
    const m = mode(now);
    const sec = (now - t0) / 1000;

    if (yarn && m !== 'yarn') endYarn(false);

    if (runSeq && m !== 'run') abortRun();
    if (portal && m !== 'portal') abortPortal();

    // интерактив: кот поворачивается к курсору, подходит и радуется, если вы задержались рядом
    let following = false;
    if (followOn && now - mouse.t < 3000 && !dragging && lift <= 0.5) {
      const cx = catX + CW / 2, mdx = mouse.x - cx;
      if (Math.abs(mdx) < 900) {
        if (m === 'sleep' && Math.abs(mdx) < 420) lastActivity = now;
        if (m === 'idle' || m === 'walk') {
          following = true;
          if (Math.abs(mdx) > 150) {
            const tg = mouse.x - Math.sign(mdx) * 105 - CW / 2;
            target = Math.min(Math.max(-OX * S, tg), W() - CW + OX * S); nearSince = 0;
          } else {
            target = null; dir = mdx >= 0 ? 1 : -1;
            if (!nearSince) nearSince = now;
            else if (now - nearSince > 3500 && now - lastJoy > 25000) { petAt = now; lastJoy = now; lastActivity = now; SND.pet(); }
          }
        } else if (Math.abs(mdx) > 30 && m !== 'pet') dir = mdx > 0 ? 1 : -1;
      }
    } else nearSince = 0;

    // бег на четвереньках: после перехода мчится к цели, у цели встаёт обратно
    stepMouse(now, dt);
    if (m === 'run' && runSeq && runSeq.phase === 'run' && (runSeq.kind === 'laser' || runSeq.kind === 'mouse')) {
      if (now > runSeq.until) { runSeq.phase = 'out'; runSeq.start = now; target = null; if (runSeq.kind === 'laser') window.kotomag.laser(false); else removeMouse(true); }
      else {
        const chase = runSeq.kind === 'mouse' ? (mouseObj ? mouseObj.x + 26 : catX + CW / 2) : cursorX;
        const dx = chase - (catX + CW / 2), ax = Math.abs(dx);
        runSeq.moving = ax > 26;
        if (runSeq.moving) { dir = dx >= 0 ? 1 : -1; catX += Math.sign(dx) * Math.min(runSeq.kind === 'mouse' ? 330 : 380, 70 + ax * 3.2) * dt; lastActivity = now; }
        else if (lift <= 0.5 && now > runSeq.pounceAt) {
          vy = -340; lift = 1; lastActivity = now;
          if (runSeq.kind === 'mouse' && mouseObj) {
            if (Math.random() < 0.5) { burstAt(mouseObj.x - catX + 26, OY + 82, 14, ['#ffffff', '#ffb3c1', '#ffd447'], 34); removeMouse(false); runSeq.until = now + 900; say(T('act.mouse.catch'), 250, 1200); runSeq.pounceAt = now + 5000; }
            else { mouseObj.state = 'run'; mouseObj.dir = mouseObj.x > catX ? 1 : -1; mouseObj.v = 330; mouseObj.until = now + 900; runSeq.pounceAt = now + 1400; say(T('act.mouse.miss'), 250, 1000); }
          } else runSeq.pounceAt = now + rnd(1800, 4200);
        }
      }
    } else if (m === 'run' && runSeq && runSeq.phase === 'run') {
      const dx = target - catX;
      if (Math.abs(dx) < 4) { runSeq.phase = 'out'; runSeq.start = now; target = null; }
      else {
        dir = Math.sign(dx); const px = catX; catX += dir * 260 * dt; lastActivity = now;
        if (Math.abs(Math.min(Math.max(-OX * S, W() - CW + OX * S), Math.max(-OX * S, catX)) - px) < 0.01) { runSeq.phase = 'out'; runSeq.start = now; target = null; }
      }
    }

    // движение
    if (m === 'walk') {
      const dx = target - catX;
      if (Math.abs(dx) < 3) { target = null; wanderAt = now + rnd(2500, 8000); }
      else { dir = Math.sign(dx); const px = catX; catX += dir * (following ? 75 : 44) * dt; if (Math.abs(catX - px) > 0.01) { lastMoveAt = now; lastActivity = Math.max(lastActivity, now - 60000); } }
    } else if (m === 'idle' && now > wanderAt && !following) {
      if (Math.random() < 0.65) {
        const lo = -OX * S + 4, hi = Math.max(lo + 60, W() - CW + OX * S - 4);
        // чаще далеко, иногда почти от края до края стола
        target = Math.random() < 0.5 ? (catX < (lo + hi) / 2 ? hi - rnd(0, 120) : lo + rnd(0, 120)) : lo + Math.random() * (hi - lo);
        if (Math.abs(target - catX) < 160) target = null;
        else if (Math.abs(target - catX) > 700 && Math.random() < [0, 0.15, 0.3, 0.6][(CFG.acts || {}).run ?? 2] && yarnOn && !quiet()) startRun(false);
      }
      wanderAt = now + rnd(2500, 7000);
    }
    catX = Math.min(Math.max(-OX * S, W() - CW + OX * S), Math.max(-OX * S, catX));
    // падение после того, как кота отпустили
    if (!dragging && !portal && !(yarn && yarn.kind === 'levit') && lift > 0) {
      vy += 1500 * dt; lift -= vy * dt;
      if (lift <= 0) {
        lift = 0;
        if (vy > 320 && bounces < 1) { vy = -vy * 0.28; lift = 0.6; bounces++; SND.land(); }
        else { vy = 0; bounces = 0; if (!drawLanded.done) SND.land(); lastActivity = now; wanderAt = now + 2500; if (draw._wasDragged && !portal) { draw._wasDragged = false; say(T('mode.land'), 150, 1200); } }
      }
    }
    lift = Math.min(lift, Math.max(0, window.innerHeight - CH - 4));

    stepPortal(m, now);
    stepShout(now);

    // кадр
    potFilter = '';
    ctx.clearRect(0, 0, CW, CH);
    let walkBob = 0;
    let set = 'idle', idx = Math.floor(sec * 6);
    let dim = false;
    if (m === 'walk') {
      if (now - lastMoveAt > 350) { target = null; wanderAt = now + rnd(1500, 4000); set = 'idle'; idx = Math.floor(sec * 6); }   // упёрся: стоит, без шагов
      else { set = 'walk'; idx = Math.floor(sec * 12); }
    }
    else if (m === 'busy') { set = 'work'; idx = Math.floor(sec * 8); }
    else if (m === 'attn') { set = 'attn'; idx = Math.floor(sec * 9); }
    else if (m === 'cast') { set = 'cast'; idx = Math.min(15, Math.floor((now - castAt) / 105)); }
    else if (m === 'pet') { set = 'pet'; idx = Math.min(7, Math.floor((now - petAt) / 135)); }
    else if (m === 'sleep') { set = 'idle'; idx = Math.floor(sec * 1.4); dim = true; }
    else if (m === 'yarn') {
      const t = now - yarn.start, k = yarn.kind;
      if (k === 'yarn') {
        if (t < YARN_MAKE) { set = 'yarn'; idx = Math.floor(t / 130); }
        else if (t < YARN_MAKE + YARN_PLAY) { set = 'play'; idx = Math.floor((t - YARN_MAKE) / 110) % 10; }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'coffee') {
        if (t < 260) { set = 'sip'; idx = Math.floor(t / 130); }
        else if (t < 260 + 14 * 130 * 3) { set = 'sip'; idx = 2 + (Math.floor((t - 260) / 130) % 14); }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'book') {
        if (t < 390) { set = 'book'; idx = Math.floor(t / 130); }
        else if (t < 390 + 13 * 130 * 3) { set = 'book'; idx = 3 + (Math.floor((t - 390) / 130) % 13); }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'joy') {
        if (t < 16 * 110 * 2) { set = 'joy'; idx = Math.floor(t / 110) % 16; } else { endYarn(false); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'levit') {
        const T = 9500;
        if (t < T) {
          set = 'idle'; idx = Math.floor(sec * 2.2);
          const f = Math.min(1, t / 1400, (T - t) / 1100), ease = 0.5 - 0.5 * Math.cos(Math.PI * f);
          lift = 38 * ease + 3 * Math.sin(t / 400) * f;
        } else { lift = 0; endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'bubbles') {
        if (t < 7800) { set = 'cast'; idx = Math.floor(t / 105) % 16; }
        else { endYarn(false); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'clones') {
        if (t < 6200) { if (t < 1700) { set = 'cast'; idx = Math.min(15, Math.floor(t / 105)); } else { set = 'joy'; idx = Math.floor(t / 110) % 16; } }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'yawn') {
        if (t < 16 * 110) { set = 'yawn'; idx = Math.floor(t / 110); if (!yarn.said && t > 450) { yarn.said = 1; say(T('act.yawn'), 0, 1500); } }
        else { endYarn(false); set = 'idle'; idx = Math.floor(sec * 6); }
      } else if (k === 'potion') {
        const Z = yarn.pot || (yarn.pot = { color: pick(['#3ddc84', '#b06cff', '#ff6fb0', '#4fd8ff', '#ffd447']), bad: window.__pbad !== undefined ? !!window.__pbad : Math.random() < 0.3, stir: rnd(4600, 6600) });
        const IN = 700, tS = t - IN, tR = tS - Z.stir;
        if (t < IN) { Z.phase = 'in'; set = 'pstir'; idx = 0; }
        else if (tS < Z.stir) { Z.phase = 'stir'; set = 'pstir'; idx = Math.floor(tS / 110) % 16; }
        else if (!Z.bad) {
          if (tR < 1900) { Z.phase = 'good'; set = 'joy'; idx = Math.min(15, Math.floor(tR / 110)); }
          else if (tR < 2500) { Z.phase = 'out'; set = 'joy'; idx = 15; }
          else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
        } else {
          if (tR < 800) { Z.phase = 'fuse'; set = 'pstir'; idx = Math.floor(tS / 70) % 16; }
          else if (tR < 3300) { Z.phase = 'boom'; set = 'attn'; idx = Math.floor(sec * 9); potFilter = `brightness(${(0.6 + Math.min(1, Math.max(0, (tR - 2600) / 700)) * 0.4).toFixed(2)}) sepia(.35) saturate(.6)`; }
          else if (tR < 3700) { Z.phase = 'out'; set = 'idle'; idx = Math.floor(sec * 6); }
          else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
        }
        Z.t = t; Z.tR = tR;
      } else if (k === 'hat') {
        const H = yarn.hat || (yarn.hat = { item: pick(['rabbit', 'rabbit', 'duck', 'flower', 'star', 'heart']) });
        const T1 = 16 * 110, T2 = T1 + 560, tt = t - T2, HOLD = 2400;
        if (t < T1) { H.phase = 'off'; set = 'hat1'; idx = Math.min(15, Math.floor(t / 110)); }
        else if (t < T2) { H.phase = 'pause'; set = 'hat1'; idx = 15; }
        else if (tt < 660) { H.phase = 'reach'; set = 'hat2'; idx = Math.floor(tt / 110); }
        else if (tt < 660 + HOLD) { H.phase = 'show'; set = 'hat2'; idx = 6 + (Math.floor((tt - 660) / 140) % 5); }
        else if (tt < 660 + HOLD + 6 * 110) { H.phase = 'on'; set = 'hat2'; idx = Math.min(15, 11 + Math.floor((tt - 660 - HOLD) / 110)); }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
        H.t = t; H.tt = tt;
      } else if (k === 'fish') {
        const F = yarn.fish || (yarn.fish = { wait: rnd(4300, 7500), item: window.__fi || pickCatch(), tip: [90, 22] });
        const CAST = 16 * 110, PULL = 8 * 135, SHOW = 1900, BACK = 16 * 90, tw = t - CAST, tp = tw - F.wait, ts = tp - PULL, tb = ts - SHOW;
        F.t = t; F.phase = t < CAST ? 'cast' : tw < F.wait ? 'wait' : tp < PULL ? 'pull' : ts < SHOW ? 'show' : tb < BACK ? 'back' : 'end';
        if (F.phase === 'cast') { set = 'fcast'; idx = Math.min(15, Math.floor(t / 110)); }
        else if (F.phase === 'wait') { set = 'fwait'; idx = Math.floor(tw / 110) % 16; }
        else if (F.phase === 'pull') { set = 'fpull'; idx = Math.min(7, Math.floor(tp / 135)); }
        else if (F.phase === 'show') { set = 'fwait'; idx = Math.floor(ts / 110) % 16; }
        else if (F.phase === 'back') { set = 'fcast'; idx = 15 - Math.min(15, Math.floor(tb / 90)); }
        else { endYarn(true); set = 'idle'; idx = Math.floor(sec * 6); }
        F.cur = { set, idx };
      } else if (k === 'fireworks') {
        if (t < 10200) { set = 'cast'; idx = Math.floor(t / 105) % 16; }
        else { endYarn(false); set = 'idle'; idx = Math.floor(sec * 6); }
      } else {
        if (t < 16 * 120 * 3) { set = 'dance'; idx = Math.floor(t / 120) % 16; } else { endYarn(false); set = 'idle'; idx = Math.floor(sec * 6); }
      }
    }
    else if (m === 'run' && runSeq) {
      const t = now - runSeq.start;
      if (runSeq.phase === 'in') { const kk = Math.floor(t / 90); if (kk >= 16) { runSeq.phase = 'run'; runSeq.start = now; set = 'run'; idx = 0; } else { set = 'trans'; idx = kk; } }
      else if (runSeq.phase === 'run') {
        if (runSeq.kind === 'laser' || runSeq.kind === 'mouse') { if (lift > 0.5) { set = 'run'; idx = 4; } else if (runSeq.moving) { set = 'run'; idx = Math.floor(t / 52) % 16; } else { set = 'trans'; idx = 15; } }
        else { set = 'run'; idx = Math.floor(t / 52) % 16; }
      }
      else { const kk = 15 - Math.floor(t / 90); if (kk < 0) { endRun(); set = 'idle'; idx = Math.floor(sec * 6); } else { set = 'trans'; idx = kk; } }
    }
    else if (m === 'portal' && portal) {
      const t = now - portal.start;
      if (portal.phase === 'vanish') { set = portal.kind; idx = Math.min(14, Math.floor(t / PV)); }
      else if (portal.phase === 'gone') { set = 'pout'; idx = 14; }
      else if (portal.phase === 'appear') { set = portal.akind; idx = Math.max(0, 14 - Math.floor(t / PV)); }
      else if (portal.phase === 'drop') { set = 'idle'; idx = 0; }
      else { set = 'pwave'; idx = Math.floor(t / 100) % 16; }
    }
    else if (m === 'conj') { set = hasConj() ? 'conj' : 'cast'; const f = Math.floor((now - conjAt) / 94); idx = f < 16 ? f : 8 + ((f - 8) % 8); }
    let rot = (m === 'portal' && portal && portal.phase === 'drop') ? portal.rot : 0;
    if (m === 'drag' || m === 'fall') { set = hasDrag() ? 'drag' : 'attn'; idx = Math.floor(sec * 9); if (!hasDrag() && m === 'drag') rot = Math.sin(sec * 5.5) * 9; }
    idx = Math.max(0, Math.floor(idx));
    cur = { set, idx: idx % FRAMES[set].length };
    showFrame(set, idx, { dim, rot, filter: potFilter });
    if (!(portal && m === 'portal' && ((portal.phase === 'vanish' && portal.kind === 'pdive') || (portal.phase === 'appear' && portal.akind === 'pdive') || portal.phase === 'drop'))) spriteEl.style.clipPath = '';

    // эффекты
    const [tx, ty] = tipPos();
    if ((m === 'busy') && Math.random() < dt * 24) parts.push({ x: tx, y: ty, vx: rnd(-8, 8), vy: rnd(-18, -4), life: rnd(.5, 1), t: 0, c: ['Y', 'W', 'G', 'p'][(Math.random() * 4) | 0] });
    if (m === 'cast') {
      const k = (now - castAt) / 1700;
      if (k > 0.3 && k < 0.85 && Math.random() < dt * 60) { const a = Math.random() * 6.28, r = rnd(14, 36); parts.push({ x: OX + FW / 2 + Math.cos(a) * r, y: OY + 52 + Math.sin(a) * r * 0.7, vx: rnd(-4, 4), vy: rnd(-12, -2), life: rnd(.4, .9), t: 0, c: ['Y', 'W', 'G'][(Math.random() * 3) | 0] }); }
      if (!draw._burst && k > 0.35) { draw._burst = true; spark(tx, ty, 34, 34, ['Y', 'W', 'G', 'p']); }
      if (k <= 0.05) draw._burst = false;
    }
    if (m === 'conj') {
      const k = (now - conjAt) / 1500;
      if (k > 0.25 && (k < 0.9 || acting) && Math.random() < dt * (k < 0.9 ? 50 : 22)) parts.push({ x: tx + rnd(-6, 6), y: ty + rnd(-6, 6), vx: rnd(-10, 10), vy: rnd(-22, -4), life: rnd(.4, .9), t: 0, c: ['Y', 'W', 'G', 'p'][(Math.random() * 4) | 0] });
      if (!draw._cburst && k > 0.4) { draw._cburst = true; spark(tx, ty, 30, 32, ['Y', 'W', 'G', 'p']); }
      if (k <= 0.05) draw._cburst = false;
    }
    if (m === 'portal' && portal) drawPortal(now, sec, dt); else hidePortal();
    if (m === 'attn') { const [hx, hy] = headPos(); glyph('!', hx + side(37) - (dir > 0 ? 0 : 3), hy - 22 - (Math.floor(sec * 6) % 2) * 2, COL.R, 2); }
    if (m === 'sleep') {
      const [hx, hy] = headPos(); const k = Math.floor(sec * 1.2) % 3;
      glyph('Z', hx + side(8), hy - 16 - k * 3, COL.Z, 1); if (k > 0) glyph('Z', hx + side(17), hy - 26 - k * 3, COL.p, 1);
    }
    if (m === 'run' && runSeq && runSeq.phase === 'run' && (!runSeq.kind || runSeq.moving) && Math.random() < dt * 16) parts.push({ x: OX + (dir > 0 ? 24 : FW - 24) + rnd(-3, 3), y: OY + rnd(82, 88), vx: -dir * rnd(6, 16), vy: rnd(-6, -1), life: rnd(.3, .6), t: 0, c: 'S', float: true });
    if (m === 'yarn' && yarn) {
      const t = now - yarn.start, [hx, hy] = headPos();
      if (yarn.kind === 'coffee' && t > 260) {
        const li = Math.floor((t - 260) / 130) % 14;   // кружка внизу: кадры цикла 0–1 и 9–13
        if ((li <= 1 || li >= 9) && Math.random() < dt * 9) parts.push({ x: OX + (dir > 0 ? 58 : FW - 58) + rnd(-1, 1), y: OY + 63, vx: 0, vy: rnd(-9, -5), life: rnd(.9, 1.5), t: 0, c: 'S', float: true, sway: true, ph: Math.random() * 6 });
      }
      if (yarn.kind === 'joy' && Math.random() < dt * 7) parts.push({ x: hx + side(rnd(-10, 14)), y: hy - 4, vx: rnd(-3, 3), vy: rnd(-12, -6), life: 1.1, t: 0, c: 'R', heart: true });
      if (yarn.kind === 'joy' && Math.random() < dt * 9) parts.push({ x: hx + side(rnd(-18, 22)), y: hy + rnd(-10, 20), vx: rnd(-6, 6), vy: rnd(-14, -4), life: .8, t: 0, c: ['Y', 'W', 'G', 'p'][(Math.random() * 4) | 0] });
      if (yarn.kind === 'dance' && Math.random() < dt * 4.5) parts.push({ x: hx + side(rnd(-16, 24)), y: hy - 2, vx: rnd(-2, 2), vy: rnd(-12, -7), life: 1.5, t: 0, c: ['Y', 'G', 'p', 'W'][(Math.random() * 4) | 0], note: true, float: true, sway: true, ph: Math.random() * 6 });
    }
    if (m === 'yarn' && yarn) stepShows(now, dt, sec);
    if (m === 'pet' && Math.random() < dt * 10) { const [hx, hy] = headPos(); parts.push({ x: hx + side(rnd(-8, 12)), y: hy - 6, vx: rnd(-3, 3), vy: rnd(-10, -6), life: 1, t: 0, c: 'R', heart: true }); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i];
      q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.sway) q.x += Math.sin(q.t * 5 + q.ph) * 6 * dt; if (!q.heart && !q.float) q.vy += 24 * dt;
      if (q.t > q.life) { parts.splice(i, 1); continue; }
      if (q.note) glyph('N', q.x, q.y, COL[q.c], 1); else if (q.heart) glyph('H', q.x, q.y, COL.R, 1); else rect(q.x, q.y, q.t < q.life * 0.5 ? 2 : 1, q.t < q.life * 0.5 ? 2 : 1, COL[q.c]);
    }

    // диагностика: смена режима и «ходьба на месте» (в журнал)
    if (draw._pm !== m) {
      if (draw._pm === 'sleep' && m !== 'drag' && m !== 'attn') say(T('mode.wake'), 100, 1300);
      else if (m === 'pet') say(T('mode.pet'), 0, 1000);
      else if (m === 'sleep') say(T('mode.sleep'), 300, 1800);
      else if (m === 'conj') say(T('mode.conj'), 150, 1400);
      else if (draw._pm === 'run' && m === 'idle' && !window.__noRunSay) say(T('mode.runEnd'), 100, 1000);
    }
    if (draw._pm !== m) { dbg(`режим ${draw._pm || '-'} -> ${m} кадры=${set} x=${Math.round(catX)} цель=${target === null ? 'нет' : Math.round(target)} следит=${following ? 1 : 0} занят=${busy.size} ждёт=${attn.size} готово=${dones.size} занятие=${yarn ? yarn.kind : '-'}`); draw._pm = m; }
    if (set === 'walk') { if (draw._wx === undefined || Math.abs(catX - draw._wx) > 0.5) { draw._wx = catX; draw._wt = now; } else if (now - draw._wt > 900 && !draw._wl) { draw._wl = 1; dbg(`ходьба на месте >0.9с: x=${Math.round(catX)} цель=${target === null ? 'нет' : Math.round(target)} следит=${following ? 1 : 0} мышь=${Math.round(mouse.x)}`); } } else { draw._wx = undefined; draw._wl = 0; }
    // диагностика: движение без кадров ходьбы (в журнал, не чаще 25 раз за запуск)
    if (draw._px !== undefined && Math.abs(catX - draw._px) > 0.05 && set !== 'walk' && m !== 'drag' && m !== 'fall' && m !== 'portal' && (draw._anom = (draw._anom || 0) + 1) <= 25) dbg(`движение без шага: режим=${m} кадры=${set} dx=${(catX - draw._px).toFixed(2)} цель=${target === null ? 'нет' : Math.round(target)} следит=${following ? 1 : 0} мышь=${Math.round(mouse.x)} с_последнего_шага=${Math.round(now - lastMoveAt)}мс`);
    draw._px = catX;
    if (window.__rec) window.__rec.push([Math.round(now), m, set, +catX.toFixed(2), target === null ? null : Math.round(target), following ? 1 : 0, Math.round(now - lastMoveAt)]);
    cat.style.transform = `translateX(${catX}px)`;
    liftEl.style.transform = `translateY(${-Math.round(lift) + walkBob}px)`;
    const sh = 1 - Math.min(0.55, lift / 380);
    const noShadow = portal && (lift > 20 || portal.phase === 'gone');
    for (const id of ['shadow1', 'shadow2']) { const e = document.getElementById(id); e.style.transform = `scale(${sh})`; e.style.opacity = noShadow ? '0' : String(Math.max(0.3, sh)); }
    updateBubble(now, m);
    updatePic(now);
    const wantTall = dragging || lift > 160 || needBubble || needPic || !!(portal && portal.tall);
    if (wantTall !== tall) setTall(wantTall);
    sleeping = m === 'sleep';
    return m;
  }

  // ---------- облачко ----------
  let needBubble = false, needPic = false;
  function updateBubble(now, m) {
    let kind = '', who = '', text = '';
    if (m === 'attn') {
      const [first] = attn.values();
      kind = 'attn'; who = first.label + (attn.size > 1 ? ` (+${attn.size - 1})` : ''); text = first.text;
    } else if (dones.size && (m === 'done' || m === 'cast' || m === 'pet' || m === 'drag' || m === 'fall' || m === 'yarn')) {
      const [first] = dones.values();
      kind = 'done'; who = first.label + (dones.size > 1 ? ` (+${dones.size - 1})` : ''); text = first.text;
    }
    else if (m === 'nudge') { who = nudge.label; text = nudge.text; if (nudge.sid === 'sys') kind = 'sys'; }
    else if (note && now < note.until) { kind = 'joke'; who = PH.ui('joke'); text = note.text; }
    const key = kind + who + text;
    if (!text) { bubble.className = 'hidden'; bubbleKey = ''; needBubble = false; return; }
    if (key !== bubbleKey) {
      bubbleKey = key;
      bubble.className = (kind + ' pop').trim();
      bubble.innerHTML = '';
      const w = document.createElement('span'); w.className = 'who'; w.textContent = who;
      const tx = document.createElement('span'); tx.className = 'txt'; tx.textContent = kind === 'joke' || kind === 'sys' ? text : (text.length > 110 ? text.slice(0, 107) + '...' : text);
      const hint = document.createElement('span'); hint.className = 'hint'; hint.textContent = kind === 'joke' ? PH.ui('nextJoke') : kind === 'sys' ? PH.ui('close') : PH.ui('open');
      bubble.appendChild(w); bubble.appendChild(tx); bubble.appendChild(hint);
      for (let i = 0; i < 9; i++) {   // мерцающие искры вокруг рамки
        const sp = document.createElement('i'); sp.className = 'sp' + (i % 3 === 0 ? ' alt' : '');
        const edge = Math.random() * 4 | 0, t = Math.random() * 100;
        const [x, y] = edge === 0 ? [t + '%', '-6px'] : edge === 1 ? ['calc(100% + 4px)', t + '%'] : edge === 2 ? [t + '%', 'calc(100% + 2px)'] : ['-7px', t + '%'];
        sp.style.setProperty('--x', x); sp.style.setProperty('--y', y);
        sp.style.setProperty('--d', (1.2 + Math.random() * 1.4).toFixed(2) + 's'); sp.style.setProperty('--w', (Math.random() * 2).toFixed(2) + 's');
        bubble.appendChild(sp);
      }
    }
    bubble.classList.remove('hidden');
    bubble.style.bottom = (CH + 4 + Math.round(lift)) + 'px';
    needBubble = bubble.offsetHeight + CH + 4 + Math.round(lift) + 14 > BASE_H;
    const bw = bubble.offsetWidth;
    const centre = catX + CW / 2;
    const left = Math.min(Math.max(8, centre - bw / 2), W() - bw - 8);
    bubble.style.left = left + 'px';
    bubble.style.setProperty('--tail', Math.min(bw - 20, Math.max(8, centre - left - 4)) + 'px');
  }
  let picKey = '';
  function updatePic(now) {
    const vis = !!(picNote && now < picNote.until && picImg.src && !attn.size && !dones.size && !(nudge && now < nudge.until) && !(note && now < note.until));
    if (!vis) { if (!picEl.classList.contains('hidden')) picEl.className = 'hidden'; picKey = ''; needPic = false; return; }
    if (picKey !== picImg.src) { picKey = picImg.src; picEl.className = 'pop'; }
    picEl.style.bottom = (CH + 4 + Math.round(lift)) + 'px';
    needPic = picEl.offsetHeight + CH + 4 + Math.round(lift) + 14 > BASE_H;
    const pw = picEl.offsetWidth, centre = catX + CW / 2;
    picEl.style.left = Math.min(Math.max(8, centre - pw / 2), W() - pw - 8) + 'px';
  }

  // ---------- клубок: кот колдует себе клубок, играет с ним и отпускает в искрах ----------
  const YARN_MAKE = 16 * 130, YARN_PLAY = 7500;
  const ACT_BURST = { yarn: [81, 83], coffee: [58, 66], book: [58, 62], levit: [48, 90], clones: [48, 56] };
  let nextChat = performance.now() + rnd(4, 9) * 60000;
  function chatter() {
    const hr = new Date().getHours(), slot = hr >= 5 && hr < 11 ? 'morning' : hr >= 11 && hr < 17 ? 'day' : hr >= 17 && hr < 23 ? 'evening' : 'night';
    say(T(Math.random() < 0.45 ? 'chat.any' : 'chat.' + slot), 0, 3600);
  }
  window.__chat = chatter; window.__say = (t, d, m) => say(t, d, m, 0, true);
  const AUTO_KEYS = ['yarn', 'coffee', 'book', 'portal', 'levit', 'bubbles', 'clones', 'fireworks', 'mouse', 'fish', 'hat', 'potion', 'yawn'];
  function pickAct() {
    const ws = AUTO_KEYS.map((k) => W_ACT[(CFG.acts || {})[k] ?? 2] || 0), sum = ws.reduce((x, y) => x + y, 0);
    if (!sum) return null;
    let r = Math.random() * sum; for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r < 0) return AUTO_KEYS[i]; }
    return AUTO_KEYS[0];
  }
  window.__pickStats = () => { const c = {}; for (let i = 0; i < 600; i++) { const k = pickAct() || 'none'; c[k] = (c[k] || 0) + 1; } return c; };
  const danceEvery = (w) => ({ 1: rnd(120, 240), 2: rnd(60, 120), 3: rnd(30, 60) }[w] || rnd(120, 240)) * 60000;
  const ACT_KINDS = ['yarn', 'coffee', 'book', 'joy', 'dance', 'levit', 'bubbles', 'clones', 'fireworks', 'fish', 'hat', 'potion', 'yawn'];
  function startYarn(kind = 'yarn', force = false) {
    const now = performance.now();
    if (yarn || attn.size || acting || dragging || lift > 0.5) return;
    if (!force && dones.size) return;
    if (kind === 'fish') dir = catX > W() / 2 ? -1 : 1;
    const prevLA = lastActivity;
    yarn = { start: now, kind }; target = null; lastActivity = kind === 'yawn' ? prevLA : now; if (kind !== 'yawn') SND.magic(); say(T(PH.has('act.' + kind) ? 'act.' + kind : 'act.yarn'), 250, 1400);
  }
  function endYarn(burst) {
    if (!yarn) return;
    const b = ACT_BURST[yarn.kind];
    if (burst && b) { spark(OX + (dir > 0 ? b[0] : FW - b[0]), OY + b[1], 26, 28, ['Y', 'W', 'G', 'p', 'R']); SND.magic(); }
    if (yarn.kind === 'levit') lift = 0;
    if (yarn.kind === 'clones') clearShows();
    if (yarn.kind === 'fish') clearFish();
    if (yarn.kind === 'hat') clearHat();
    if (yarn.kind === 'potion') clearPotion();
    if (yarn.kind !== 'yawn') lastActivity = performance.now();
    yarn = null;
  }

  // ---------- ещё занятия: левитация, пузыри, двойники, салют, охота на мышь ----------
  const liftEl2 = document.getElementById('lift');
  function mkFx(cls, x, y, css) { const e = document.createElement('i'); e.className = cls; e.style.left = x + 'px'; e.style.top = y + 'px'; if (css) for (const k in css) e.style.setProperty(k, css[k]); liftEl2.appendChild(e); return e; }
  function burstAt(x, y, n, cols, rad) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, d = rnd(.5, 1) * rad;
      const e = mkFx('fxp', x, y, { '--dx': Math.round(Math.cos(a) * d) + 'px', '--dy': Math.round(Math.sin(a) * d + 8) + 'px', '--pc': cols[(Math.random() * cols.length) | 0] });
      setTimeout(() => e.remove(), 1150);
    }
  }
  const SHOW_COLS = ['#ffd447', '#ffffff', '#19c37d', '#9a74e0', '#ff5d73', '#6fb8ff'];
  function spawnBubble(x, y) {
    const sz = Math.round(rnd(10, 24)), life = rnd(2.4, 4.4), dx = Math.round(rnd(-50, 50));
    const e = mkFx('pbub', x - sz / 2, y - sz / 2, { '--sz': sz + 'px', '--dx': dx + 'px', '--t': life.toFixed(2) + 's', '--rise': Math.round(rnd(90, 190)) + 'px' });
    setTimeout(() => { const r = e.getBoundingClientRect(), p = liftEl2.getBoundingClientRect(); burstAt(r.left - p.left + sz / 2, r.top - p.top + sz / 2, 6, ['#ffffff', '#9ad4f0', '#e0b0ff'], 20); e.remove(); }, life * 1000);
  }
  // частица на Web Animations: летит по дуге с гравитацией и гаснет
  function flyParticle(x, y, dx, dy, col, size, dur, fall) {
    const e = mkFx('fxp', x, y, { '--pc': col }); e.style.animation = 'none'; e.style.width = e.style.height = size + 'px'; e.style.margin = -size / 2 + 'px';
    e.animate([{ transform: 'translate(0,0) scale(1.5)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 1, offset: .55 }, { transform: `translate(${dx * 1.08}px,${dy + fall}px) scale(.1)`, opacity: 0 }], { duration: dur, easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards' });
    setTimeout(() => e.remove(), dur + 60);
  }
  function flashAt(x, y, col, r) {
    const e = mkFx('fxp', x, y, { '--pc': col }); e.style.animation = 'none'; e.style.borderRadius = '50%'; e.style.boxShadow = 'none';
    e.style.background = `radial-gradient(circle, #fff 0%, ${col} 35%, transparent 70%)`; e.style.width = e.style.height = '10px'; e.style.margin = '-5px';
    e.animate([{ transform: 'scale(1)', opacity: .45 }, { transform: `scale(${r / 5})`, opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => e.remove(), 280);
  }
  function explode(x, y, col, col2) {
    const type = pick(['sphere', 'ring', 'star', 'heart', 'willow', 'double']);
    const R = rnd(80, 125), pts = [];
    flashAt(x, y, col, R * 0.3);
    if (type === 'ring') { for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; pts.push([Math.cos(a) * R, Math.sin(a) * R, i % 2 ? col : col2]); } }
    else if (type === 'star') { for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, rr = R * (0.55 + 0.45 * Math.abs(Math.cos(a * 2.5))); pts.push([Math.cos(a - 1.57) * rr, Math.sin(a - 1.57) * rr, i % 3 ? col : '#ffffff']); } }
    else if (type === 'heart') { for (let i = 0; i < 56; i++) { const a = i / 56 * 6.283, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([hx * R / 17, hy * R / 17, i % 2 ? '#ff5d73' : '#ffb3c1']); } }
    else if (type === 'double') { for (let i = 0; i < 36; i++) { const a = i / 36 * 6.283; pts.push([Math.cos(a) * R, Math.sin(a) * R, col]); pts.push([Math.cos(a + .08) * R * .55, Math.sin(a + .08) * R * .55, col2]); } }
    else { for (let i = 0; i < (type === 'willow' ? 46 : 60); i++) { const a = Math.random() * 6.283, d = R * Math.sqrt(Math.random()) * (type === 'willow' ? 1.05 : 1); pts.push([Math.cos(a) * d, Math.sin(a) * d, [col, col2, '#ffffff'][i % 3]]); } }
    const fall = type === 'willow' ? 90 : 38, dur = type === 'willow' ? 2000 : 1400;
    pts.forEach(([dx, dy, cc]) => flyParticle(x, y, dx, dy, cc, rnd(4, 6.5), dur * rnd(.85, 1.1), fall));
    setTimeout(() => { for (let i = 0; i < 22; i++) { const a = Math.random() * 6.283, d = R * rnd(.6, 1.05); flyParticle(x + Math.cos(a) * d * .8, y + Math.sin(a) * d * .8 + 14, rnd(-8, 8), rnd(10, 40), '#ffe9a0', 3, rnd(700, 1200), 40); } }, 380);
    SND.magic();
  }
  function launchRocket(finale) {
    const x = OX + FW / 2 + rnd(-170, 170), top = OY - rnd(60, 235), col = SHOW_COLS[(Math.random() * SHOW_COLS.length) | 0], col2 = SHOW_COLS[(Math.random() * SHOW_COLS.length) | 0];
    const e = mkFx('rocket', x, OY + 70, { '--rise': (top - OY - 70) + 'px', '--pc': col });
    const trail = setInterval(() => { const r = e.getBoundingClientRect(), p = liftEl2.getBoundingClientRect(); flyParticle(r.left - p.left + 1, r.top - p.top + 12, rnd(-6, 6), rnd(6, 22), Math.random() < .5 ? '#ffe9a0' : col, 3, 520, 18); }, 55);
    setTimeout(() => { clearInterval(trail); e.remove(); explode(x, top, col, col2); }, 800);
  }
  let clones = [];
  function stepShows(now, dt, sec) {
    const t = now - yarn.start, k = yarn.kind, [tx, ty] = tipPos();
    if (k === 'fish') { stepFish(now, t); return; }
    if (k === 'hat') { stepHat(now, t); return; }
    if (k === 'potion') { stepPotion(now, t, dt); return; }
    if (k === 'levit') {
      for (let i = 0; i < 6; i++) {
        const a = t / 520 + i * 1.047, x = OX + 48 + Math.cos(a) * 36, y = OY + 56 + Math.sin(a) * 11 - 6 * Math.sin(t / 700 + i), front = Math.sin(a) > 0;
        rect(x, y, front ? 4 : 3, front ? 4 : 3, COL[['Y', 'W', 'p', 'B', 'G', 'R'][i]]); if (front) rect(x - 1, y + 1, 6, 2, COL.W);
      }
      if (Math.random() < dt * 8) parts.push({ x: OX + 48 + rnd(-14, 14), y: OY + 90, vx: rnd(-3, 3), vy: rnd(-14, -6), life: rnd(.5, .9), t: 0, c: ['W', 'B', 'p'][(Math.random() * 3) | 0], float: true });
      if (!yarn.said && t > 4300) { yarn.said = 1; say(T('act.levit2'), 0, 1400); }
    } else if (k === 'bubbles') {
      if (t > 500 && t < 6800 && Math.random() < dt * 4.2) spawnBubble(tx + rnd(-4, 4), ty + rnd(-4, 4));
    } else if (k === 'fireworks') {
      yarn.nextRocket = yarn.nextRocket || 600;
      if (t > yarn.nextRocket && t < 7200) { launchRocket(); if (Math.random() < .35) setTimeout(() => launchRocket(), 180); yarn.nextRocket = t + rnd(650, 1100); }
      if (!yarn.finale && t > 7400) { yarn.finale = 1; for (let i = 0; i < 5; i++) setTimeout(() => launchRocket(true), i * 130); say(T('act.fireworks.end'), 300, 1300); }
    } else if (k === 'clones') {
      if (t > 1100 && !yarn.cl) {
        yarn.cl = true; SND.magic();
        for (let i = 0; i < 3; i++) { const im = document.createElement('img'); im.className = 'clone'; im.style.setProperty('--hue', ['190deg', '300deg', '90deg'][i]); liftEl2.appendChild(im); clones.push({ im, i }); }
        burstAt(OX + 48, OY + 56, 18, SHOW_COLS, 50);
      }
      const ph = Math.min(1, Math.max(0, (t - 1100) / 700)), out = Math.min(1, Math.max(0, (6200 - t) / 500));
      clones.forEach((q) => {
        const base = [-100, 100, 0][q.i], wob = Math.sin(t / 330 + q.i * 2) * 9;
        q.im.src = spriteEl.src; q.im.style.opacity = String(0.62 * out * ph);
        q.im.style.transform = `translate(${base * ph + wob}px, ${q.i === 2 ? -62 * ph + Math.sin(t / 250) * 5 : Math.sin(t / 210 + q.i) * 4}px) scale(${q.i === 2 ? 0.78 : 0.9}) ${dir < 0 ? 'scaleX(-1)' : ''}`;
        q.im.style.left = OX + 'px'; q.im.style.top = OY + 'px';
      });
      if (!yarn.said && t > 2400) { yarn.said = 1; say(T('act.clones'), 0, 1500); }
    }
  }
  function clearShows() { clones.forEach((q) => q.im.remove()); clones = []; }
  // охота на мышь
  let mouseObj = null;
  const MRUN = []; for (let i = 1; i <= 8; i++) { const im = new Image(); im.src = `sprites/mrun-${i}.png`; MRUN.push(im); }
  const MSIT = []; for (let i = 1; i <= 16; i++) { const im = new Image(); im.src = `sprites/msit-${i}.png`; MSIT.push(im); }
  function mouseFramesOld() {
    if (mouseFrames.f) return mouseFrames.f;
    const out = [];
    for (let f = 0; f < 5; f++) {   // 0-2 бег (ноги), 3 стоит, 4 стоит с дёрнутым ухом
      const cv = document.createElement('canvas'); cv.width = 30; cv.height = 15; const g = cv.getContext('2d');
      const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      const E = (cx, cy, rx, ry, col) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) P(x, y, 1, 1, col); };
      const O = '#34343f', B = '#a9afbd', D = '#8a90a1', L = '#dde0e8', K = '#ffb3c1', T = '#ff98ad';
      const ph = f < 3 ? [-2, 0, 2][f] : 0, ear = f === 4 ? 1 : 0;
      // хвост (тонкий, в такт бега)
      for (let i = 0; i < 11; i++) { const x = 4 - i * .9, y = 9 + Math.sin(i * .6 + f * 1.3) * 2.2 - i * .12; P(Math.round(x) - (i > 6 ? 0 : 0), Math.round(y), 1, 1, i > 8 ? '#ffd3dc' : T); }
      // ноги (под телом)
      const leg = (x, dx) => { P(x + dx, 12, 2, 2, O); P(x + dx, 12, 1, 1, D); P(x + dx + 1, 13, 1, 1, K); };
      leg(7, -ph); leg(10, ph * .5 | 0); leg(17, ph); leg(20, -ph * .5 | 0);
      // тело
      E(13, 9, 9.6, 5.2, O); E(13, 9, 8.6, 4.4, B); E(12, 10.4, 6.6, 2.2, L); E(9, 7, 5, 1.6, D);
      // голова
      E(21.5, 8, 6.2, 4.6, O); E(21.5, 8, 5.2, 3.7, B); E(25, 9, 3.4, 2.4, O); E(25, 9, 2.6, 1.7, B);
      // нос, глаз, усы
      P(27, 8, 2, 2, K); P(28, 8, 1, 1, '#ff6f8f'); P(23, 6, 2, 2, '#14131a'); P(23, 6, 1, 1, '#ffffff');
      P(27, 11, 3, 1, '#eef0f5'); P(26, 10, 4, 1, '#eef0f5');
      // уши (круглые, розовая серёдка)
      const ey = 3 - ear; E(18.5, ey + 1, 3.2, 3.2, O); E(18.5, ey + 1, 2.4, 2.4, B); E(18.5, ey + 1, 1.4, 1.4, K);
      E(22.5, ey, 2.8, 2.8, O); E(22.5, ey, 2, 2, D); E(22.5, ey, 1.1, 1.1, K);
      out.push(cv.toDataURL());
    }
    return (mouseFrames.f = out);
  }
  function startMouse() {
    const now = performance.now();
    if (runSeq || yarn || attn.size || acting || dragging || lift > 0.5 || portal) { dbg('охота на мышь отклонена'); return false; }
    const x = catX < W() / 2 ? W() - rnd(160, 320) : rnd(120, 280);
    const el = document.createElement('img'); el.id = 'mouse'; el.src = MRUN[0].src; document.body.appendChild(el);
    mouseObj = { x, dir: catX < x ? 1 : -1, v: 130, state: 'run', until: now + 1200, el };
    runSeq = { phase: 'in', start: now, kind: 'mouse', until: now + 17000, pounceAt: now + 2200 };
    dir = Math.sign(x - catX) || 1; target = null; lastActivity = now; SND.magic(); say(T('act.mouse'), 200, 1300);
    return true;
  }
  function removeMouse(fade) {
    if (!mouseObj) return; const el = mouseObj.el; mouseObj = null;
    if (fade) { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 450); } else el.remove();
  }
  function stepMouse(now, dt) {
    const M = mouseObj; if (!M) return;
    if (M.state === 'run') { M.x += M.dir * M.v * dt; if (M.x < 10) { M.x = 10; M.dir = 1; } if (M.x > W() - 60) { M.x = W() - 60; M.dir = -1; } if (now > M.until) { M.state = 'wait'; M.until = now + rnd(500, 1300); M.v = rnd(100, 190); } }
    else if (now > M.until) { M.state = 'run'; M.dir = Math.random() < 0.5 ? 1 : -1; M.until = now + rnd(800, 1700); }
    const sit = M.state !== 'run', fr = sit ? Math.floor(now / 110) % 16 : Math.floor(now / 80) % 8, key = (sit ? 's' : 'r') + fr;
    if (M.fr !== key) { M.fr = key; M.el.src = (sit ? MSIT : MRUN)[fr].src; }
    M.el.style.left = Math.round(M.x) + 'px';
    M.el.style.transform = M.dir < 0 ? 'scaleX(-1)' : '';
    M.el.style.bottom = (3 + (M.state === 'run' ? Math.abs(Math.sin(now / 55)) * 2 : 0)) + 'px';
  }

  // улов: нарисованные Никитой рыбы (размеры в пикселях) и рисованные кодом мелочи; редкие реже
  const FISH_IMG = {"trout": [88, 30], "sturgeon": [100, 24], "pike": [92, 28], "mandarin": [58, 32], "bluefish": [54, 35], "clown": [54, 33]};
  const CATCH_W = { trout: 3, pike: 2, clown: 2, mandarin: 1.5, bluefish: 1.5, sturgeon: 1, fish: 1, gold: 0.7, boot: 1, star: 0.5 };
  function pickCatch() { const ks = Object.keys(CATCH_W); let r = Math.random() * ks.reduce((a, k) => a + CATCH_W[k], 0); for (const k of ks) { r -= CATCH_W[k]; if (r < 0) return k; } return 'fish'; }
  const FISH_TIPS = {"fcast": [[85, 8], [60, 45], [82, 23], [80, 8], [83, 12], [79, 8], [58, 47], [56, 46], [56, 46], [56, 46], [58, 46], [79, 23], [89, 22], [88, 22], [88, 22], [89, 22]], "fwait": [[90, 22], [90, 22], [90, 22], [90, 22], [90, 23], [90, 23], [90, 23], [90, 22], [90, 22], [90, 22], [90, 22], [90, 22], [90, 23], [90, 23], [89, 23], [90, 22]], "fpull": [[90, 22], [95, 27], [95, 36], [95, 28], [79, 9], [86, 14], [91, 27], [89, 22]]};
  let fishSvg = null, fishItem = null;
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || fishSvg).appendChild(e); return e; }
  function ensureFish() {
    if (fishSvg) return;
    fishSvg = document.createElementNS(NS, 'svg');
    fishSvg.setAttribute('viewBox', '-300 0 640 200'); fishSvg.setAttribute('width', '640'); fishSvg.setAttribute('height', '200');
    fishSvg.style.cssText = 'position:absolute;left:-300px;top:0;overflow:visible;pointer-events:none;z-index:3';
    fishSvg.setAttribute('shape-rendering', 'crispEdges');
    liftEl2.appendChild(fishSvg);
    fishSvg.pond = svgEl('ellipse', { rx: 0, ry: 0, fill: '#2f5ea8', stroke: '#17335f', 'stroke-width': 1, opacity: 0 });
    fishSvg.pond2 = svgEl('ellipse', { rx: 0, ry: 0, fill: '#6fb8ff', opacity: 0 });
    fishSvg.rip = svgEl('g', {});
    fishSvg.line = svgEl('path', { d: '', fill: 'none', stroke: '#eef2ff', 'stroke-width': 1, opacity: 0 });
    fishSvg.bob = svgEl('g', {});
    svgEl('rect', { x: -2, y: -4, width: 4, height: 3, fill: '#ff5d73' }, fishSvg.bob); svgEl('rect', { x: -2, y: -1, width: 4, height: 3, fill: '#ffffff' }, fishSvg.bob);
    fishSvg.bob.setAttribute('opacity', '0');
  }
  function clearFish() { if (fishSvg) { fishSvg.remove(); fishSvg = null; } if (fishItem) { fishItem.remove(); fishItem = null; } }
  function itemUrl(kind) {
    itemUrl.c = itemUrl.c || {};
    if (itemUrl.c[kind]) return itemUrl.c[kind];
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 14; const g = cv.getContext('2d');
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const E = (cx, cy, rx, ry, col) => { for (let y = 0; y < 14; y++) for (let x = 0; x < 16; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) P(x, y, 1, 1, col); };
    if (kind === 'fish' || kind === 'gold') {
      const o = '#1d2f55', b = kind === 'gold' ? '#ffd447' : '#6fb8ff', l = kind === 'gold' ? '#fff3b0' : '#d8f0ff', f = kind === 'gold' ? '#e0a018' : '#4a8fd0';
      E(9, 7, 6.6, 4.4, o); E(9, 7, 5.6, 3.5, b); E(9, 8.3, 4.6, 1.6, l);
      P(1, 3, 1, 8, o); P(2, 4, 1, 6, f); P(3, 5, 1, 4, f); P(0, 2, 1, 2, o); P(0, 10, 1, 2, o); P(7, 2, 3, 1, f); P(12, 5, 2, 2, '#fff'); P(13, 5, 1, 1, '#14131a');
    } else if (kind === 'boot') {
      P(4, 1, 5, 9, '#3a2a1c'); P(5, 1, 3, 8, '#7a5a3a'); P(4, 9, 10, 4, '#3a2a1c'); P(5, 9, 8, 3, '#7a5a3a'); P(5, 10, 8, 1, '#9a7a52'); P(4, 12, 10, 1, '#241810'); P(5, 2, 3, 1, '#a88a60');
    } else {
      const pts = [[8, 0], [9, 4], [14, 5], [10, 8], [11, 13], [8, 10], [4, 13], [5, 8], [1, 5], [6, 4]];
      g.fillStyle = '#ffd447'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
      P(7, 5, 2, 3, '#fff3b0');
    }
    return (itemUrl.c[kind] = cv.toDataURL());
  }
  function stepFish(now, t) {
    const F = yarn.fish; if (!F || !F.cur) return;
    ensureFish();
    const map = (lx, ly) => [OX + (dir > 0 ? lx : 96 - lx), OY + ly];
    const tipTab = FISH_TIPS[F.cur.set] && FISH_TIPS[F.cur.set][F.cur.idx]; if (tipTab) F.tip = tipTab;
    const [tx, ty] = map(F.tip[0], F.tip[1]);
    const [bx, by] = map(124, 89);                       // куда падает поплавок
    // пруд на полу: растёт при забросе, исчезает в конце
    const pondK = Math.min(1, t / 700) * (F.phase === 'back' ? Math.max(0, 1 - (t - (16 * 110 + F.wait + 8 * 135 + 1900)) / 1300) : 1);
    fishSvg.pond.setAttribute('cx', bx); fishSvg.pond.setAttribute('cy', by + 2); fishSvg.pond.setAttribute('rx', 46 * pondK); fishSvg.pond.setAttribute('ry', 6.5 * pondK); fishSvg.pond.setAttribute('opacity', 0.85 * pondK);
    fishSvg.pond2.setAttribute('cx', bx - 4); fishSvg.pond2.setAttribute('cy', by + 1); fishSvg.pond2.setAttribute('rx', 36 * pondK); fishSvg.pond2.setAttribute('ry', 3.8 * pondK); fishSvg.pond2.setAttribute('opacity', 0.45 * pondK);
    let px = bx, py = by + 1, showLine = false;
    const tw = t - 16 * 110;
    if (F.phase === 'cast') {
      const u = (t - 1230) / 440;
      if (u > 0 && u < 1) { px = tx + (bx - tx) * u; py = ty + (by - ty) * u - 70 * 4 * u * (1 - u); showLine = true; }
      else if (u >= 1) { px = bx; py = by + 1; showLine = true; if (!F.splash) { F.splash = 1; ripple(bx, by + 2, 1); SND.land(); say(T('act.fish'), 100, 1400); } }
    } else if (F.phase === 'wait') {
      showLine = true; py = by + 1 + Math.sin(now / 420) * 0.8;
      const bite = F.wait - tw;
      if (bite < 1000) { py += Math.abs(Math.sin(now / 90)) * 3.5; if (!F.bite) { F.bite = 1; say(T('act.fish.bite'), 0, 1100); SND.nudge(); } if (Math.random() < 0.18) ripple(bx, by + 2, 1.4); }
      else if (Math.random() < 0.012) ripple(bx, by + 2, 1);
    } else if (F.phase === 'pull') {
      const tp = tw - F.wait;
      if (tp < 330) { showLine = true; py = by - tp * 0.12; }
      else if (!F.flung) {
        F.flung = 1; fling(F, bx, by);
      }
    }
    if (showLine) {
      const mx = (tx + px) / 2, my = Math.max(ty, py) - 4 + (F.phase === 'wait' ? 14 : 4);
      fishSvg.line.setAttribute('d', `M${Math.round(tx)} ${Math.round(ty)} Q${Math.round(mx)} ${Math.round(my)} ${Math.round(px)} ${Math.round(py - 2)}`); fishSvg.line.setAttribute('opacity', 0.95);
      fishSvg.bob.setAttribute('transform', `translate(${Math.round(px)} ${Math.round(py)})`); fishSvg.bob.setAttribute('opacity', 1);
    } else { fishSvg.line.setAttribute('opacity', 0); fishSvg.bob.setAttribute('opacity', 0); }
  }
  function ripple(x, y, k) {
    if (!fishSvg) return;
    const e = svgEl('ellipse', { cx: x, cy: y, rx: 2, ry: 0.6, fill: 'none', stroke: '#e6f4ff', 'stroke-width': 1, opacity: 0.9 }, fishSvg.rip);
    e.animate([{ rx: 2, ry: 0.6, opacity: 0.9 }, { rx: 16 * k, ry: 3.6 * k, opacity: 0 }].map((f) => f), { duration: 900, fill: 'forwards' });
    setTimeout(() => e.remove(), 950);
  }
  function fling(F, bx, by) {
    ripple(bx, by + 2, 1.6); ripple(bx, by + 2, 2.4); burstAt(bx, by - 2, 12, ['#ffffff', '#9ad4f0', '#6fb8ff'], 30);
    const fi = FISH_IMG[F.item], iw = fi ? fi[0] : 32, ih = fi ? fi[1] : 28;
    const im = document.createElement('img'); im.src = fi ? `sprites/fish-${F.item}.png` : itemUrl(F.item); im.style.cssText = `position:absolute;left:0;top:0;width:${iw}px;height:${ih}px;image-rendering:pixelated;pointer-events:none;z-index:7`;
    liftEl2.appendChild(im); fishItem = im;
    const lx = bx + dir * Math.max(0, iw / 2 - 34), ly = by - Math.round(ih * 0.3), apx = (bx + OX + 48) / 2, apy = OY - 62, c = (x, y, r, s) => `translate(${Math.round(x - iw / 2)}px,${Math.round(y - ih / 2)}px) rotate(${r}deg) scale(${s})`;
    im.animate([{ transform: c(bx, by, 0, 0.6), easing: 'cubic-bezier(.2,.7,.4,1)' }, { transform: c(apx, apy, dir * 200, 1.15), offset: 0.5, easing: 'cubic-bezier(.6,0,.9,.4)' }, { transform: c(lx, ly, dir * 360, 1) }], { duration: 1250, fill: 'forwards' });
    setTimeout(() => { burstAt(lx, ly, 8, ['#ffffff', '#ffd447'], 22); SND.land(); say(T('catch.' + F.item), 100, 1600); }, 1250);
    setTimeout(() => { if (im.parentNode) { im.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }); setTimeout(() => im.remove(), 420); } }, 1250 + 1500);
  }

  // ---------- зелье: котёл вокруг основания посоха, помешивает, потом удача или бабах ----------
  let pot = null;
  function potUrl(liq) {
    potUrl.c = potUrl.c || {};
    if (potUrl.c[liq]) return potUrl.c[liq];
    const cv = document.createElement('canvas'); cv.width = 28; cv.height = 24; const g = cv.getContext('2d');
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const E = (cx, cy, rx, ry, col) => { for (let y = 0; y < 24; y++) for (let x = 0; x < 28; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) P(x, y, 1, 1, col); };
    P(4, 20, 3, 3, '#14131a'); P(21, 20, 3, 3, '#14131a'); P(12, 21, 4, 2, '#14131a');                      // ножки
    E(14, 14, 13, 9, '#14131a'); E(14, 14, 12, 8, '#32323f'); E(10, 16, 7, 5, '#3d3d4c'); E(10, 11, 3, 1.4, '#5a5a6c');   // корпус и блик
    P(0, 8, 3, 3, '#14131a'); P(1, 8, 2, 2, '#4a4a58'); P(25, 8, 3, 3, '#14131a'); P(25, 8, 2, 2, '#4a4a58');  // ручки
    E(14, 7, 12, 4.2, '#14131a'); E(14, 7, 11, 3.4, '#5a5a6c'); E(14, 7.4, 9.6, 2.6, liq); E(11, 6.6, 4, 1, '#ffffff22');  // горловина с зельем
    return (potUrl.c[liq] = cv.toDataURL());
  }
  function clearPotion() { if (pot) { pot.back.remove(); pot.front.remove(); pot = null; } liftEl2.style.transform = liftEl2.style.transform; }
  function stepPotion(now, t, dt) {
    const Z = yarn.pot; if (!Z) return;
    if (!pot) {
      const mk = (z, front) => { const e = document.createElement('img'); e.src = potUrl(Z.color); e.style.cssText = `position:absolute;width:40px;height:34px;image-rendering:pixelated;pointer-events:none;z-index:${z};left:${OX + (dir > 0 ? 82 : 96 - 82) - 20}px;top:${OY + 63}px;transform-origin:50% 100%;` + (front ? 'clip-path:inset(34% 0 0 0);' : ''); return e; };
      pot = { back: mk(0, false), front: mk(4, true) }; liftEl2.insertBefore(pot.back, liftEl2.firstChild); liftEl2.appendChild(pot.front);
      burstAt(OX + (dir > 0 ? 82 : 96 - 82), OY + 82, 14, ['#ffffff', '#9a74e0', Z.color], 34); SND.magic(); say(T('act.potion'), 200, 1500);
    }
    const grow = Math.min(1, t / 380), shake = Z.phase === 'fuse' ? Math.sin(now / 22) * 2.2 : 0;
    const sc = 1 - Math.pow(1 - grow, 3);
    for (const e of [pot.back, pot.front]) e.style.transform = `translateX(${shake.toFixed(1)}px) scale(${sc.toFixed(2)})`;
    const mx = OX + (dir > 0 ? 82 : 96 - 82), my = OY + 73;                          // горловина котла
    // пузырьки и пар
    const rate = Z.phase === 'fuse' ? 22 : Z.phase === 'stir' ? 7 : 3;
    if (grow >= 1 && Math.random() < dt * rate) { const e = mkFx('fxp', mx + rnd(-9, 9), my + rnd(-1, 2), { '--pc': Z.color }); e.style.animation = 'none'; e.style.borderRadius = '50%'; const sz = rnd(3, 6); e.style.width = e.style.height = sz + 'px'; e.animate([{ transform: 'translate(0,0) scale(.4)', opacity: .9 }, { transform: `translate(${rnd(-6, 6)}px,${-rnd(14, 26)}px) scale(1.2)`, opacity: 0 }], { duration: rnd(600, 1000), fill: 'forwards' }); setTimeout(() => e.remove(), 1100); }
    if (grow >= 1 && Math.random() < dt * 4) { const e = mkFx('fxp', mx + rnd(-8, 8), my - 3, { '--pc': '#e8e8f4' }); e.style.animation = 'none'; e.style.borderRadius = '50%'; e.style.width = e.style.height = '9px'; e.style.opacity = '.55'; e.animate([{ transform: 'translate(0,0) scale(.5)', opacity: .5 }, { transform: `translate(${rnd(-8, 8)}px,-34px) scale(1.8)`, opacity: 0 }], { duration: 1500, fill: 'forwards' }); setTimeout(() => e.remove(), 1600); }
    if (Z.phase === 'good' && !Z.did) {
      Z.did = 1; SND.magic(); say(T('potion.good'), 150, 1600);
      for (let i = 0; i < 40; i++) { const a = -1.57 + rnd(-0.55, 0.55), d = rnd(40, 110); flyParticle(mx, my, Math.cos(a) * d, Math.sin(a) * d, ['#ffd447', '#ff5d73', '#6fb8ff', '#3ddc84', '#ffffff', '#b06cff'][i % 6], rnd(4, 6), rnd(900, 1500), 60); }
      flashAt(mx, my - 6, Z.color, 40);
    }
    if (Z.phase === 'boom' && !Z.did) {
      Z.did = 1; SND.magic(); say(T('potion.bad'), 450, 1800);
      flashAt(mx, my - 8, '#ffcf70', 110); burstAt(mx, my - 8, 36, ['#ffd447', '#ff9a2a', '#ff5d73', '#ffffff'], 80);
      for (let i = 0; i < 9; i++) { const e = mkFx('fxp', mx + rnd(-12, 12), my - 6, { '--pc': '#555' }); e.style.animation = 'none'; e.style.borderRadius = '50%'; const sz = rnd(14, 26); e.style.width = e.style.height = sz + 'px'; e.style.margin = -sz / 2 + 'px'; e.style.background = i % 2 ? '#4a4a55' : '#2e2e38'; e.style.boxShadow = 'none'; e.animate([{ transform: 'translate(0,0) scale(.3)', opacity: .95 }, { transform: `translate(${rnd(-60, 60)}px,${-rnd(30, 90)}px) scale(1.6)`, opacity: 0 }], { duration: rnd(1100, 1800), fill: 'forwards', delay: i * 40 }); setTimeout(() => e.remove(), 2000 + i * 40); }
    }
    if (Z.phase === 'out') { const k = Z.bad ? 1 - Math.min(1, (Z.tR - 3300) / 400) : 1 - Math.min(1, (Z.tR - 1900) / 600); for (const e of [pot.back, pot.front]) { e.style.opacity = String(Math.max(0, k)); } }
  }

  // ---------- фокус со шляпой ----------
  let potFilter = '';
  let hatItem = null;
  function clearHat() { if (hatItem) { hatItem.remove(); hatItem = null; } }
  function hatItemUrl(kind) {
    hatItemUrl.c = hatItemUrl.c || {};
    if (hatItemUrl.c[kind]) return hatItemUrl.c[kind];
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 18; const g = cv.getContext('2d');
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const sh = []; const S = (cx, cy, rx, ry, col) => sh.push([cx, cy, rx, ry, col]);
    const draw = (o) => { for (const [cx, cy, rx, ry, col] of sh) for (let y = 0; y < 18; y++) for (let x = 0; x < 16; x++) if (((x + .5 - cx) / (rx + (o ? 1 : 0))) ** 2 + ((y + .5 - cy) / (ry + (o ? 1 : 0))) ** 2 <= 1) P(x, y, 1, 1, o ? '#3a3750' : col); };
    if (kind === 'rabbit') { S(5, 4, 1.6, 4, '#f4f2f8'); S(10, 4, 1.6, 4, '#f4f2f8'); S(8, 11, 4, 3.4, '#f4f2f8'); S(8, 15, 4.6, 2.8, '#f4f2f8'); draw(true); draw(false); P(5, 3, 1, 3, '#ffb3c1'); P(10, 3, 1, 3, '#ffb3c1'); P(6, 10, 1, 2, '#14131a'); P(10, 10, 1, 2, '#14131a'); P(8, 12, 1, 1, '#ff8fa8'); P(6, 13, 4, 1, '#e5e0ee'); }
    else if (kind === 'duck') { S(8, 12, 5, 4, '#ffd447'); S(10, 6, 3.4, 3.4, '#ffd447'); draw(true); draw(false); P(12, 6, 3, 2, '#ff9a2a'); P(10, 4, 1, 1, '#14131a'); P(5, 12, 4, 2, '#e8b020'); }
    else if (kind === 'flower') { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - 1.57; S(8 + Math.cos(a) * 3.8, 6 + Math.sin(a) * 3.8, 2.4, 2.4, '#ff7aa8'); } S(8, 6, 2, 2, '#ffd447'); draw(true); draw(false); P(7, 10, 2, 7, '#2e8b4a'); P(9, 13, 3, 1, '#2e8b4a'); }
    else if (kind === 'heart') { S(5, 5, 3, 3, '#ff5d73'); S(11, 5, 3, 3, '#ff5d73'); S(8, 9, 5.4, 4.4, '#ff5d73'); draw(true); draw(false); P(4, 3, 2, 1, '#ffb3c1'); }
    else { g.fillStyle = '#3a3750'; g.beginPath(); [[8, 0], [10, 6], [16, 7], [11, 11], [13, 17], [8, 13], [3, 17], [5, 11], [0, 7], [6, 6]].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.fillStyle = '#ffd447'; g.beginPath(); [[8, 2], [9.5, 6.5], [14, 7.5], [10.5, 10.5], [12, 15], [8, 12], [4, 15], [5.5, 10.5], [2, 7.5], [6.5, 6.5]].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); P(7, 6, 2, 3, '#fff3b0'); }
    return (hatItemUrl.c[kind] = cv.toDataURL());
  }
  function stepHat(now, t) {
    const H = yarn.hat; if (!H) return;
    if (!H.said && t > 700) { H.said = 1; say(T('act.hat'), 0, 1500); }
    if (H.phase === 'show' && !hatItem) {
      const im = document.createElement('img'); im.src = hatItemUrl(H.item); im.style.cssText = 'position:absolute;width:40px;height:45px;image-rendering:pixelated;pointer-events:none;z-index:7;left:0;top:0';
      const px = OX + (dir > 0 ? 29 : 96 - 29), py = OY + 14;
      im.style.transform = `translate(${px - 20}px, ${py - 40}px)`; liftEl2.appendChild(im); hatItem = im;
      im.animate([{ transform: `translate(${px - 20}px, ${py - 12}px) scale(.2) rotate(-14deg)`, opacity: 0 }, { transform: `translate(${px - 20}px, ${py - 48}px) scale(1.25) rotate(6deg)`, opacity: 1, offset: .55 }, { transform: `translate(${px - 20}px, ${py - 40}px) scale(1) rotate(0)`, opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,1.5,.4,1)', fill: 'forwards' });
      setTimeout(() => { if (hatItem === im) im.animate([{ transform: `translate(${px - 20}px, ${py - 40}px)` }, { transform: `translate(${px - 20}px, ${py - 46}px)` }, { transform: `translate(${px - 20}px, ${py - 40}px)` }], { duration: 700, iterations: 4, easing: 'ease-in-out' }); }, 440);
      burstAt(px, py - 30, 18, ['#ffffff', '#ffd447', '#9a74e0', '#6fb8ff'], 36); SND.magic();
      setTimeout(() => say(T('hat.' + H.item), 0, 1800, 50), 150);
    }
    if (H.phase === 'on' && hatItem) { const im = hatItem; hatItem = null; const r = im.getBoundingClientRect(), p = liftEl2.getBoundingClientRect(); burstAt(r.left - p.left + 20, r.top - p.top + 22, 16, ['#ffffff', '#ffd447', '#9a74e0'], 34); im.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); setTimeout(() => im.remove(), 180); SND.magic(); }
  }

  // ---------- портал: исчезает, появляется в случайном месте экрана, машет, и так несколько раз ----------
  const PV = 90;   // мс на кадр ухода и появления
  function startPortal(force) {
    const now = performance.now();
    if (portal || runSeq || yarn || attn.size || acting || dragging || lift > 0.5 || (!force && dones.size)) { dbg(`портал отклонён: бег=${!!runSeq} занятие=${yarn ? yarn.kind : '-'} ждёт=${attn.size} колдует=${acting} перенос=${dragging} подъём=${Math.round(lift)}`); return false; }
    portal = { phase: 'vanish', start: now, kind: window.__pk || (Math.random() < 0.5 ? 'pdive' : 'pout'), akind: 'pout', n: 3 + ((Math.random() * 3) | 0), i: 0, home: catX, stop: null, tall: false, homeStop: false };
    target = null; lastActivity = now; SND.magic(); say(T('portal.out.' + portal.kind), 150); dbg(`портал: начало, появлений ${portal.n}`);
    return true;
  }
  function endPortal() {
    if (!portal) return;
    const [tx, ty] = tipPos(); spark(tx, ty, 24, 28, ['Y', 'W', 'G', 'p', 'B']); SND.magic();
    portal = null; lift = 0; vy = 0; target = null; lastActivity = performance.now(); wanderAt = lastActivity + 2500; dbg('портал: конец');
  }
  function abortPortal() { if (portal) { portal = null; vy = 0; target = null; lastActivity = performance.now(); dbg('портал: прерван'); } }
  function stepPortal(m, now) {
    if (m !== 'portal' || !portal) return;
    const t = now - portal.start;
    if (portal.phase === 'vanish' && t >= 15 * PV + 120) {
      portal.phase = 'gone'; portal.start = now;
      portal.homeStop = portal.i >= portal.n; portal.tall = !portal.homeStop;
    } else if (portal.phase === 'gone') {
      const ready = portal.homeStop || window.innerHeight > BASE_H + 60 || t > 1800;
      if (t >= 750 && ready) {
        const lo = -OX * S + 4, hi = Math.max(lo + 60, W() - CW + OX * S - 4);
        portal.stop = portal.homeStop ? { x: portal.home, l: 0, d: dir } : { x: rnd(lo, hi), l: Math.random() < 0.15 ? 0 : rnd(0, Math.max(0, window.innerHeight - CH - 24)), d: Math.random() < 0.5 ? 1 : -1 };
        catX = portal.stop.x; lift = portal.stop.l; dir = portal.stop.d; vy = 0;
        const drop = !portal.homeStop && portal.stop.l > 260 && (window.__ak === 'drop' || (!window.__ak && Math.random() < 0.4));
        portal.akind = drop ? 'drop' : (window.__ak && window.__ak !== 'drop' ? window.__ak : (Math.random() < 0.5 ? 'pdive' : 'pout'));
        portal.phase = drop ? 'drop' : 'appear'; portal.start = now; portal.L0 = portal.stop.l; portal.rot = 0; portal.rsgn = Math.random() < 0.5 ? 1 : -1; portal.yl = 96; SND.magic();
        if (drop) say(T('portal.fall'), 700, 1300); else say(portal.homeStop ? T('portal.home') : T('portal.in'), 700); dbg(`портал: появление ${portal.i + 1}/${portal.n}${portal.homeStop ? ' (домой)' : ''} x=${Math.round(catX)} lift=${Math.round(lift)}`);
      }
    } else if (portal.phase === 'drop') {
      const G = 1500, td = Math.max(0, t - 350), fall = Math.sqrt(2 * portal.L0 / G) * 1000;
      const dd = 0.5 * G * (td / 1000) ** 2;                         // сколько уже пролетел
      lift = td >= fall ? 0 : Math.max(0, portal.L0 - dd); vy = 0;
      portal.yl = Math.max(0, 96 - dd);                                // линия портала в координатах кадра: выше неё кота не видно
      const spin0 = 96 + 10, spin1 = portal.L0 - 40;                    // кувыркается после того, как вылетел, и успевает встать до приземления
      const u = Math.min(1, Math.max(0, (dd - spin0) / Math.max(1, spin1 - spin0)));
      portal.rot = portal.rsgn * 360 * (u * u * (3 - 2 * u));
      if (td >= fall) { portal.rot = 0; portal.phase = 'wave'; portal.start = now; SND.land(); spark(OX + FW / 2, OY + 86, 18, 26, ['S', 'W', 'p']); }
    } else if (portal.phase === 'appear' && t >= 15 * PV) {
      portal.phase = 'wave'; portal.start = now; spark(OX + FW / 2, OY + 56, 20, 30, ['Y', 'W', 'G', 'p', 'B']); if (!portal.homeStop && Math.random() < 0.5) say(T('portal.wave'), 150);
    } else if (portal.phase === 'wave' && t >= 16 * 100 * (portal.homeStop ? 2 : 1)) {
      if (portal.homeStop) { endPortal(); return; }
      portal.i++; portal.phase = 'vanish'; portal.start = now; portal.kind = window.__pk || (Math.random() < 0.5 ? 'pdive' : 'pout'); SND.magic(); say(T('portal.out.' + portal.kind), 150);
    }
  }
  // реплики-облачка над котом
  const shoutEl = document.getElementById('shout');
  let shoutQ = null, shoutUntil = 0;
  const pick = (a) => a[(Math.random() * a.length) | 0];
  let lastSayEnd = -1e9;
  // сколько висит реплика: по длине текста (≈ скорость чтения) и множителю из настроек
  const shoutDur = (text, ms) => Math.round(Math.max(ms, 1600 + String(text).length * 65) * (CFG.sayTime ?? 1.5));
  // реплики не чаще, чем через «паузу» после показа предыдущей (по умолчанию 2 с); во время портала паузы нет
  function say(text, delay = 0, ms = 1200, up = 0, force = false) {
    const now = performance.now();
    if (!force) {
      if (!CFG.say || quiet() || Math.random() * 100 >= (CFG.sayChance ?? 100)) return;
      if (!portal && now < lastSayEnd + (CFG.sayGap ?? 2) * 1000) return;
    }
    const dur = shoutDur(text, ms);
    lastSayEnd = now + delay + dur; shoutQ = { at: now + delay, text, ms: dur, up };
  }
  function stepShout(now) {
    if (shoutQ && now >= shoutQ.at) {
      shoutEl.innerHTML = '';
      { const st = document.createElement('span'); st.className = 'star'; shoutEl.appendChild(st);
        const sp = document.createElement('span'); sp.className = 'txt'; sp.textContent = shoutQ.text; shoutEl.appendChild(sp);
        for (let i = 0; i < 12; i++) {   // мерцающие искры вокруг рамки
          const q = document.createElement('i'); q.className = 'sp' + (i % 3 === 0 ? ' alt' : '');
          const edge = Math.random() * 4 | 0, t = Math.random() * 100;
          const [x, y] = edge === 0 ? [t + '%', '-6px'] : edge === 1 ? ['calc(100% + 4px)', t + '%'] : edge === 2 ? [t + '%', 'calc(100% + 2px)'] : ['-7px', t + '%'];
          q.style.setProperty('--x', x); q.style.setProperty('--y', y);
          q.style.setProperty('--d', (1 + Math.random() * 1.2).toFixed(2) + 's'); q.style.setProperty('--w', (Math.random() * 1.5).toFixed(2) + 's');
          shoutEl.appendChild(q);
        }
        for (let i = 0; i < 10; i++) {   // вспышка искр при появлении
          const q = document.createElement('i'); q.className = 'burst' + (i % 2 ? ' alt' : '');
          const ang = Math.random() * 6.283, d = 26 + Math.random() * 30;
          q.style.setProperty('--dx', Math.round(Math.cos(ang) * d * 1.5) + 'px'); q.style.setProperty('--dy', Math.round(Math.sin(ang) * d) + 'px');
          shoutEl.appendChild(q);
        }
      }
      shoutEl.className = pick(['', 'c2', 'c3', 'c4']);
      shoutEl.style.left = (OX + FW / 2) + 'px'; shoutEl.style.top = (OY + 2 - (shoutQ.up || 0)) + 'px';
      shoutEl.style.transform = 'translate(-50%, -100%)';
      void shoutEl.offsetWidth; shoutEl.classList.add('pop');
      shoutUntil = now + shoutQ.ms; shoutQ = null;
    }
    if (shoutUntil && now > shoutUntil) { shoutEl.classList.add('hidden'); shoutUntil = 0; }
  }
  const portalEl = document.getElementById('portalimg'), PK = 1.5;
  let portalShown = false;
  function hidePortal() { if (portalShown) { portalEl.style.display = 'none'; portalShown = false; } }
  function drawPortal(now, sec, dt) {
    const t = now - portal.start; let o = 0;
    if (portal.phase === 'vanish') o = Math.min(1, t / 380);
    else if (portal.phase === 'gone') o = Math.max(0, 1 - t / 380);
    else if (portal.phase === 'appear' || portal.phase === 'drop') o = Math.min(1, t / 380);
    else o = Math.max(0, 1 - t / 450);
    if (o <= 0.02) { hidePortal(); return; }
    const e = 1 - Math.pow(1 - o, 3), k = PK * e, im = FRAMES.portal[Math.floor(sec * 12) % 16];
    if (!im || !im.complete || !im.naturalWidth) return;
    if (portalEl.src !== im.src) portalEl.src = im.src;
    const flat = ((portal.phase === 'vanish' || portal.phase === 'gone') && portal.kind === 'pdive') || ((portal.phase === 'appear' || portal.phase === 'wave') && portal.akind === 'pdive') || ((portal.phase === 'drop' || portal.phase === 'wave') && portal.akind === 'drop');   // нырок: портал лежит под ногами
    const cx = OX + FW / 2, sz = Math.round(FW * k), hh = flat ? Math.round(sz * 0.27) : sz, cy = flat ? (portal.akind === 'drop' && (portal.phase === 'drop' || portal.phase === 'wave') ? OY + 96 + (lift - portal.L0) : OY + 88) : OY + 50;
    portalEl.style.cssText = `display:block;width:${sz}px;height:${hh}px;left:${Math.round(cx - sz / 2)}px;top:${Math.round(cy - hh / 2)}px;opacity:${Math.min(1, o * 2)}`;
    portalShown = true;
    const rx = 33 * k * 0.66, ry = 39 * k * 0.66 * (flat ? 0.27 : 1);
    if (portal.phase === 'drop') spriteEl.style.clipPath = `inset(${Math.round(portal.yl)}px 0 0 0)`;
    else if (flat && (portal.phase === 'vanish' || portal.phase === 'appear')) spriteEl.style.clipPath = `inset(0 0 ${Math.round(4 + 4 * e)}px 0)`;
    if (Math.random() < dt * 24 * o) { const a = Math.random() * 6.283; parts.push({ x: cx + Math.cos(a) * rx * 1.5, y: cy + Math.sin(a) * ry * 1.5, vx: Math.cos(a) * 10, vy: Math.sin(a) * 10 - 4, life: rnd(.4, .8), t: 0, c: ['W', 'B', 'p'][(Math.random() * 3) | 0], float: true }); }
  }

  // ---------- бег на четвереньках ----------
  function startRun(force) {
    const now = performance.now();
    if (runSeq || yarn || attn.size || acting || dragging || lift > 0.5 || (!force && dones.size)) return false;
    const lo = -OX * S + 4, hi = Math.max(lo + 60, W() - CW + OX * S - 4);
    if (target === null || Math.abs(target - catX) < 500) target = catX < (lo + hi) / 2 ? hi - Math.random() * 100 : lo + Math.random() * 100;
    dir = Math.sign(target - catX) || 1; runSeq = { phase: 'in', start: now }; lastActivity = now; SND.magic(); say(T('act.run'), 300, 1000);
    return true;
  }
  function toggleLaser() {
    if (runSeq && runSeq.kind === 'laser') { runSeq.until = 0; return; }       // выключить: кот встанет и вернёт посох
    if (runSeq || yarn || attn.size || acting || dragging || lift > 0.5) { dbg(`указка отклонена: бег=${!!runSeq} занятие=${yarn ? yarn.kind : '-'} ждёт=${attn.size} колдует=${acting} перенос=${dragging} подъём=${Math.round(lift)}`); return; }
    const now = performance.now();
    runSeq = { phase: 'in', start: now, kind: 'laser', until: now + 75000, pounceAt: now + 3000 };
    window.kotomag.laser(true);
    dir = cursorX > catX + CW / 2 ? 1 : -1; lastActivity = now; SND.magic(); say(T('act.laser'), 300, 1100);
  }
  function endRun() {
    if (!runSeq) return;
    const [tx, ty] = tipPos(); spark(tx, ty, 26, 30, ['Y', 'W', 'G', 'p']); SND.magic();
    runSeq = null; lastActivity = performance.now();
  }
  function abortRun() { if (runSeq && runSeq.kind === 'laser') window.kotomag.laser(false); if (runSeq && runSeq.kind === 'mouse') removeMouse(false); runSeq = null; target = null; }

  // ---------- «наколдовать»: анекдот или смешная картинка ----------
  async function doAct(kind) {
    const now0 = performance.now();
    if (attn.size || dones.size || acting) return;
    endYarn(false);
    acting = true;
    lastActivity = now0; target = null; note = null; picNote = null; conjAt = now0; conjKind = kind; SND.magic();
    try {
      const wait = new Promise((r) => setTimeout(r, 1400));
      const res = await (kind === 'joke' ? window.kotomag.joke() : window.kotomag.pic()).catch(() => null);
      await wait;
      if (attn.size || dones.size) return;
      const n = performance.now();
      if (kind === 'joke') {
        const text = (res && res.text) || 'Кот забыл анекдот. Бывает.';
        note = { text, until: n + Math.min(40000, Math.max(9000, 5000 + text.length * 65)) };
      } else if (res && res.src) {
        await new Promise((r) => { picImg.onload = r; picImg.onerror = r; picImg.src = res.src; });
        picNote = { until: performance.now() + 25000 };
      } else {
        note = { text: 'Не получилось достать картинку. Нет сети?', until: n + 5000 };
      }
      lastActivity = performance.now();
    } finally { acting = false; }
  }
  window.__act = (k) => (k === 'mouse' ? startMouse() : k === 'portal' ? startPortal(true) : k === 'laser' ? toggleLaser() : k === 'run' ? startRun(true) : ACT_KINDS.includes(k) || k === 'coffee' ? startYarn(k, true) : doAct(k));
  window.__note = (t) => { note = { text: t, until: performance.now() + 30000 }; };

  // экономия: в покое рисуем ~30 кадров в секунду, во сне ~11, в быстрых сценах (перенос, бег, портал) полные 60
  function loop(now) {
    if (!window.__noThrottle) {
      const fast = dragging || lift > 0.5 || runSeq || portal || acting || (yarn && yarn.kind !== 'coffee' && yarn.kind !== 'book' && yarn.kind !== 'yawn');
      const gap = draw._pm === 'sleep' ? 90 : fast ? 12 : 30;
      if (now - last < gap) { requestAnimationFrame(loop); return; }
    }
    now = Math.max(now, last);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let m = '';
    try { m = draw(now, dt); } catch (err) { console.error('draw', err); }
    if (m === 'attn' && now > nextRemind && reminds < 3) { reminds++; nextRemind = now + 60000; SND.nudge(); }
    if (m === 'idle' && !yarn && CFG.sleep !== false && !quiet() && now - lastActivity > 116000 && now - lastActivity < 119000 && !draw._yawned) { draw._yawned = true; startYarn('yawn'); }
    if (now - lastActivity < 5000) draw._yawned = false;
    if (yarnOn && now > nextYarn) {
      if (m === 'idle' && !quiet() && !note && !picNote && !acting) { const pk = pickAct(); if (pk === 'portal') startPortal(false); else if (pk === 'mouse') startMouse(); else if (pk) startYarn(pk); nextYarn = now + rnd(CFG.actMin, CFG.actMax) * 60000; }
      else nextYarn = now + 90000;
    }
    if (yarnOn && now > nextDance) {
      const wd = (CFG.acts || {}).dance | 0;
      if (wd > 0 && m === 'idle' && !quiet() && !note && !picNote && !acting) { startYarn('dance'); nextDance = now + danceEvery(wd); }
      else nextDance = now + (wd > 0 ? 120000 : danceEvery(2));
    }
    if (pendingDance && now > pendingDance) { pendingDance = 0; if (!attn.size && !quiet()) startYarn('dance', true); }
    if (autoOn && now > nextAuto) {
      if ((m === 'idle' || m === 'walk') && !quiet() && !note && !picNote) { doAct(Math.random() < 0.5 ? 'joke' : 'pic'); nextAuto = now + rnd(CFG.jokeMin, CFG.jokeMax) * 60000; }
      else nextAuto = now + 2 * 60000;
    }
    if (now > nextChat) {
      if (CFG.chat !== false && (m === 'idle' || m === 'walk') && !quiet() && !yarn && !note && !picNote && !acting) { chatter(); nextChat = now + rnd(CFG.chatMin || 6, CFG.chatMax || 14) * 60000; }
      else nextChat = now + 60000;
    }
    if (dones.size && now > doneRemindAt && doneReminds < 3) { doneReminds++; doneRemindAt = now + 90000; SND.nudge(); }
    requestAnimationFrame(loop);
  }

  // ---------- мышь: наведение, клик (погладить) и перетаскивание ----------
  let ignoring = true;
  function overCat(e) {
    const r = liftEl.getBoundingClientRect();
    let x = (e.clientX - r.left) / S - OX; const y = (e.clientY - r.top) / S - OY;
    if (dir < 0) x = FW - x;
    if (x < 0 || y < 0 || x >= FW || y >= FW) return false;
    const m = maskFor(cur.set, cur.idx);
    return m ? m[Math.floor(y) * FW + Math.floor(x)] === 1 : true;
  }
  function endDrag() {
    if (!down) return;
    const d = down; down = null;
    if (d.moved) { dragging = false; vy = 0; bounces = 0; lastActivity = performance.now(); dbg(`перенос закончен catX=${Math.round(catX)} lift=${Math.round(lift)}`); }
  }
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !overCat(e)) return;
    down = { x: e.clientX, y: e.clientY, catX0: catX, lift0: lift, moved: false };
    dbg(`mousedown на коте x=${Math.round(e.clientX)} y=${Math.round(e.clientY)} catX=${Math.round(catX)}`);
  });
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now();
    if (down) {
      if (e.buttons === 0) { endDrag(); return; }
      if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) {
        down.moved = true; dragging = true; vy = 0; target = null; lastActivity = performance.now();
        SND.pick(); dbg('перенос начат'); draw._wasDragged = true; say(T('mode.drag'), 100, 1500);
      }
      if (down.moved) {
        catX = down.catX0 + (e.clientX - down.x);
        lift = Math.max(0, down.lift0 - (e.clientY - down.y));
        return;
      }
    }
    const hit = !!(e.target.closest && e.target.closest('#bubble:not(.hidden), #pic:not(.hidden)')) || overCat(e);
    if (hit === ignoring) { ignoring = !hit; window.kotomag.setIgnore(ignoring); if (bubbleKey) dbg(`ignore=${ignoring} x=${Math.round(e.clientX)} y=${Math.round(e.clientY)} target=${(e.target.id || e.target.tagName)}`); }
  });
  // курсор от системы: проверяем, над баннером/картинкой/котом ли он, и открываем окну клики; кот следит, пока курсор у полосы окна
  function onCursor(c) {
    cursorX = c.x;
    if (c.inside) { mouse.x = c.x; mouse.y = c.y; mouse.t = performance.now(); }
    if (down || dragging) return;
    const el = c.inside ? document.elementFromPoint(c.x, c.y) : null;
    const hit = !!(el && el.closest && el.closest('#bubble:not(.hidden), #pic:not(.hidden)')) || (c.inside && overCat({ clientX: c.x, clientY: c.y }));
    if (hit === ignoring) { ignoring = !hit; window.kotomag.setIgnore(ignoring); window.__ign = ignoring; }
  }
  window.__cursor = onCursor;
  window.kotomag.onCursor(onCursor);
  document.addEventListener('mouseup', (e) => {
    if (!down) return;
    const d = down;
    endDrag();
    if (!d.moved && overCat(e)) { if (e.altKey) toggleLaser(); else pet(); }
  });
  function dismiss() {
    attn.clear(); reminds = 0;
    dones.clear(); doneReminds = 3;
    nudge = null;
  }
  function pet() {
    const now = performance.now();
    lastActivity = now;
    if (runSeq) return;
    if (yarn) { endYarn(true); return; }
    if (note || picNote) { note = null; picNote = null; return; }
    if (attn.size || dones.size || (nudge && now < nudge.until)) { dismiss(); return; }
    petAt = now; target = null; SND.pet();
    pet._n = (now - (pet._t || 0) < 7000) ? (pet._n || 0) + 1 : 1; pet._t = now;
    if (pet._n >= 4) { say(T('mode.petMany'), 80, 1300, 0, false); pet._n = 0; }
  }
  function closeBanner() { nudge = null; lastActivity = performance.now(); dismiss(); }
  bubble.addEventListener('click', () => { dbg(`клик по баннеру left=${bubble.style.left} catX=${Math.round(catX)}`); if (bubble.classList.contains('joke')) doAct('joke'); else closeBanner(); });
  picEl.addEventListener('click', () => doAct('pic'));
  bubble.addEventListener('mousedown', (e) => dbg(`mousedown на баннере x=${Math.round(e.clientX)} y=${Math.round(e.clientY)}`));
  document.addEventListener('contextmenu', (e) => { e.preventDefault(); window.kotomag.menu(); });

  window.kotomag.onSay((txt) => say(txt, 0, 3600, 0, true));
  window.kotomag.onConfig((c) => {
    const now = performance.now(), langChanged = c.lang !== CFG.lang;
    CFG = { ...CFG, ...c, acts: { ...CFG.acts, ...(c.acts || {}) } };
    sound = c.sound !== false; followOn = c.follow !== false; autoOn = (c.jokes ?? c.auto) !== false; yarnOn = c.play !== false;
    PH.set(CFG.lang, CFG.sarcasm);
    const ph = document.querySelector('.pichint'); if (ph) ph.textContent = PH.ui('nextPic');
    nextYarn = Math.min(nextYarn, now + CFG.actMax * 60000); nextAuto = Math.min(nextAuto, now + CFG.jokeMax * 60000);
    if (langChanged) bubbleKey = '';
  });
  // ---------- системные замечания ----------
  const cleanName = (n) => String(n || '').replace(/\s*\(.*?\)/g, '').replace(/ Helper.*$/i, '').replace(/\.app$/i, '').trim() || '?';
  const dec1 = (n) => { const v = (Math.round(n * 10) / 10).toString(); return CFG.lang === 'ru' ? v.replace('.', ',') : v; };
  function sysText(e) {
    const U = PH.ui;
    switch (e.kind) {
      case 'trash': return e.mb != null ? T('sys.trash', { size: PH.size(e.mb), n: PH.fileWord(e.count) }) : T('sys.trash0', { n: e.count });
      case 'mem': return T('sys.mem', { pct: e.pct, top: cleanName(e.top) });
      case 'cpu': return T('sys.cpu', { pct: e.pct, top: cleanName(e.top) });
      case 'disk': return T('sys.disk', { gb: dec1(e.freeGB) });
      case 'battery': return T('sys.battery', { pct: e.pct });
      case 'uptime': return T('sys.uptime', { n: e.days });
      case 'brk': return T('sys.brk', { n: e.minutes });
      case 'report': {
        const L = [];
        if (e.mem) L.push(`${U('mem')}: ${e.mem.usedPct}%` + (e.cpu ? `  ·  ${U('cpu')}: ${e.cpu.pct}%` : ''));
        if (e.disk) L.push(`${U('disk')}: ${dec1(e.disk.freeGB)} ${U('gb')} ${U('free')}` + (e.trash ? `  ·  ${U('trash')}: ${e.trash.mb != null ? PH.size(e.trash.mb) : PH.fileWord(e.trash.count)}` : ''));
        if (e.battery) L.push(`${U('battery')}: ${e.battery.pct}%` + (e.battery.charging ? ' +' : '') + `  ·  ${U('uptime')}: ${dec1(e.uptimeDays)} ${CFG.lang === 'ru' ? 'дн.' : 'd'}`);
        const sy = CFG.sys || {};
        let com = '';
        if (e.mem && e.mem.usedPct >= ((sy.mem || {}).pct || 88)) com = sysText({ kind: 'mem', pct: e.mem.usedPct, top: e.mem.top });
        else if (e.cpu && e.cpu.pct >= ((sy.cpu || {}).pct || 85)) com = sysText({ kind: 'cpu', pct: e.cpu.pct, top: e.cpu.top });
        else if (e.disk && e.disk.freeGB <= ((sy.disk || {}).freeGB || 15)) com = sysText({ kind: 'disk', freeGB: e.disk.freeGB });
        else if (e.trash && ((e.trash.mb != null && e.trash.mb >= ((sy.trash || {}).minMB || 200)) || (e.trash.mb == null && e.trash.count >= 25))) com = sysText({ kind: 'trash', count: e.trash.count, mb: e.trash.mb });
        else com = T('sys.ok');
        return L.join('\n') + '\n\n' + com;
      }
    }
    return '';
  }
  window.__sysEvent = (e) => {
    if (attn.size) return;
    const now = performance.now();
    nudge = { until: now + (e.kind === 'report' ? 16000 : 11000), sid: 'sys', label: e.kind === 'report' ? PH.ui('sys') : PH.ui(e.kind) || PH.ui('sys'), text: sysText(e) };
    lastActivity = now; SND.nudge();
  };
  window.kotomag.onSys(window.__sysEvent);
  window.kotomag.onAct((k) => (k === 'mouse' ? startMouse() : k === 'portal' ? startPortal(true) : k === 'laser' ? toggleLaser() : k === 'run' ? startRun(true) : ACT_KINDS.includes(k) ? startYarn(k, k === 'joy' || k === 'dance') : doAct(k)));
  requestAnimationFrame(loop);
})();
