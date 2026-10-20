(function () {
  const TR = {
    ru: {
      tab_general: 'Основное', tab_acts: 'Занятия', tab_speech: 'Реплики', tab_sys: 'Система', tab_about: 'О Котомаге', lang: 'Язык',
      g_title: 'Основное', g_sub: 'Что вообще делает кот и когда ему лучше помолчать.',
      g_beh: 'Поведение', sound: 'Звуки', sound_h: 'Сигналы о задачах и короткие звуки действий', follow: 'Следить за курсором', follow_h: 'Поворачивается к мыши, подходит, радуется, если задержались рядом',
      welcome: 'Радоваться возвращению', welcome_h: 'Если вы долго отсутствовали, кот встречает вас', sleep: 'Засыпать без дела', sleep_h: 'Через пару минут простоя зевает и засыпает',
      jfilter: 'Фильтровать грубые шутки', jfilter_h: 'Пропускать анекдоты с матом и пошлостью, берётся следующий',
      g_auto: 'Сами по себе', play: 'Занятия сами по себе', play_h: 'Кот иногда сам рыбачит, колдует, играет с клубком. Настройка каждого занятия во вкладке «Занятия»', jokes: 'Анекдоты и картинки', jokes_h: 'Иногда кот рассказывает анекдот или показывает смешную картинку',
      g_quiet: 'Не беспокоить', q_manual: 'Не беспокоить сейчас', q_manual_h: 'Кот не развлекается, не говорит и не шлёт системные сообщения.', q_sched: 'Тихие часы по расписанию', q_sched_h: 'Каждый день в выбранное время', q_from: 'с', q_to: 'до', min: 'мин', reset: 'Сбросить настройки', reset_q: 'Сбросить все настройки к начальным?',
      a_title: 'Занятия', a_sub: 'Насколько часто кот занимается каждым делом, пока вы работаете.', a_when: 'Когда занятия случаются', a_every: 'Занятия раз в', a_every_h: 'Случайный промежуток между самостоятельными занятиями', a_jevery: 'Анекдот или картинка раз в', a_jevery_h: 'Случайный промежуток между шутками',
      a_list: 'Каждое занятие', off: 'Выкл', rare: 'Редко', normal: 'Обычно', often: 'Часто', show: 'Показать',
      act_yarn: 'Клубок', act_coffee: 'Кофе', act_book: 'Книга', act_portal: 'Портал', act_levit: 'Левитация', act_bubbles: 'Мыльные пузыри', act_clones: 'Двойники', act_fireworks: 'Салют', act_mouse: 'Охота на мышку', act_fish: 'Рыбалка', act_hat: 'Фокус со шляпой', act_potion: 'Зелье', act_yawn: 'Зевок', act_dance: 'Танец', act_run: 'Бег на четвереньках',
      s_title: 'Реплики', s_sub: 'Что и как кот говорит. Язык и характер.', s_say: 'Говорить облачками', s_say_h: 'Короткие фразы над котом во время действий', s_chance: 'Как часто комментирует', s_chance_h: 'Доля действий, на которые кот что-то скажет',
      s_time: 'Сколько висит реплика', s_time_h: 'Время зависит от длины фразы. Множитель: чем больше, тем дольше можно читать',
      s_gap: 'Пауза между репликами', s_gap_h: 'Кот не говорит чаще этого. Во время портала паузы нет', sec: 'с',
      s_chat: 'Болтать от скуки', s_chat_h: 'Время от времени кот сам что-нибудь замечает: по времени суток, без повода', s_chat_every: 'Болтовня раз в',
      s_lang: 'Язык реплик и интерфейса', s_sarc: 'Уровень сарказма', s_sarc_h: 'От милого до ядовитого. Влияет на реплики кота и системные замечания',
      sarc0: 'Милый', sarc1: 'С иронией', sarc2: 'Саркастичный', sarc3: 'Ядовитый', s_pre: 'Так это будет звучать', s_more: 'Другие примеры',
      y_title: 'Система', y_sub: 'Кот следит за компьютером и вслух ворчит, если что-то не так. Ничего не отправляется в интернет.', y_now: 'Сейчас', y_on: 'Следить за системой', y_on_h: 'Главный выключатель всех проверок ниже', y_cool: 'Не повторять чаще чем раз в', y_cool_h: 'Пауза между одинаковыми замечаниями',
      y_checks: 'Проверки', y_trash: 'Корзина', y_trash_h: 'Скажет, если в корзине накопился мусор', y_trash_every: 'проверять раз в', y_trash_min: 'от', y_mem: 'Память', y_mem_h: 'Ворчит, когда память занята и называет прожорливое приложение', y_cpu: 'Процессор', y_cpu_h: 'Если нагрузка держится долго, называет, кто греет компьютер', y_disk: 'Диск', y_disk_h: 'Когда свободного места мало', y_bat: 'Батарея', y_bat_h: 'Когда заряд упал, а зарядка не подключена', y_up: 'Перезагрузка', y_up_h: 'Если Мак давно не перезагружали', y_brk: 'Перерывы', y_brk_h: 'Напомнит отдохнуть после долгой работы без пауз',
      pct: '%', mb: 'МБ', gb: 'ГБ', days: 'дн.', hold: 'держится', over: 'свыше', below: 'ниже', free: 'свободно', test: 'Проверить', tr_now: 'Корзина', mem_now: 'Память', cpu_now: 'Процессор', disk_now: 'Диск', bat_now: 'Батарея', up_now: 'Работает', files: 'файлов', unk: 'нет данных',
      fda: 'Чтобы Котомаг видел размер корзины, дайте ему «Полный доступ к диску». Без этого он знает только число предметов.', fda_open: 'Открыть настройки доступа',
      b_title: 'О Котомаге', b_sub: 'Кот-волшебник на рабочем столе: развлекает, шутит, ловит рыбу и приглядывает за вашим компьютером.', b_keys: 'Горячие клавиши', b_laser: 'Лазерная указка', b_files: 'Файлы', b_log: 'Показать журнал', b_ver: 'Версия',
      hk_title: 'Горячие клавиши', hk_laser: 'Лазерная указка', hk_laser_h: 'Включает и выключает указку: кот гоняется за красной точкой у курсора. Запасной способ: ⌥-клик по коту', hk_change: 'Записать…', hk_press: 'Нажмите сочетание…', hk_cancel: 'Отмена', hk_ok: 'работает', hk_busy: 'занято другим приложением', hk_reset: 'По умолчанию', hk_need: 'Нужен модификатор: ⌘, ⌃ или ⌥', hk_need2: 'Нужен Alt вместе с Ctrl или Shift', hk_res: 'Это сочетание нужно системе или программам. Добавьте ⌥ или ⌃ (в Windows: Alt вместе с Ctrl или Shift)', hk_help2: 'Нажмите «Проверить», потом сочетание. Если не срабатывает, возможно, оно занято другой программой: выберите другое.', autostart: 'Запускать вместе с системой', autostart_h: 'Кот будет появляться сам после входа в систему', hk_test: 'Проверить', hk_wait: 'Нажмите сочетание сейчас…', hk_fired: 'Сработало!', hk_nofire: 'Не сработало', hk_help: 'Нажмите «Проверить», потом сочетание. Если не срабатывает, попробуйте включить Котомаг в «Мониторинге ввода» и «Универсальном доступе» и перезапустить его.', hk_in: 'Мониторинг ввода', hk_ax: 'Универсальный доступ', hk_trust_no: 'Универсальный доступ: не выдан', hk_trust_yes: 'Универсальный доступ: выдан',
      b_how: 'Как работает', b_how_t: 'Правый клик по коту открывает меню: настройки, «не беспокоить», отчёт о системе, анекдот, занятия. Кота можно брать мышкой и переносить.',
    },
    en: {
      tab_general: 'General', tab_acts: 'Activities', tab_speech: 'Speech', tab_sys: 'System', tab_about: 'About', lang: 'Language',
      g_title: 'General', g_sub: 'What the cat does and when it should keep quiet.',
      g_beh: 'Behavior', sound: 'Sounds', sound_h: 'Task alerts and short action sounds', follow: 'Follow the cursor', follow_h: 'Turns to the mouse, comes closer, rejoices if you linger nearby',
      welcome: 'Welcome you back', welcome_h: 'After a long absence the cat greets you', sleep: 'Fall asleep when idle', sleep_h: 'After a couple of idle minutes it yawns and sleeps',
      jfilter: 'Filter rude jokes', jfilter_h: 'Skip jokes with swearing and adult content, the next one is taken',
      g_auto: 'On its own', play: 'Activities on their own', play_h: 'The cat sometimes fishes, casts spells, plays with yarn. Set each activity in the Activities tab', jokes: 'Jokes and pictures', jokes_h: 'Sometimes the cat tells a joke or shows a funny picture',
      g_quiet: 'Do not disturb', q_manual: 'Do not disturb now', q_manual_h: 'The cat stays calm, does not talk and sends no system messages.', q_sched: 'Quiet hours schedule', q_sched_h: 'Every day at the chosen time', q_from: 'from', q_to: 'to', min: 'min', reset: 'Reset settings', reset_q: 'Reset all settings to defaults?',
      a_title: 'Activities', a_sub: 'How often the cat does each thing while you work.', a_when: 'When activities happen', a_every: 'Activities every', a_every_h: 'Random interval between self-started activities', a_jevery: 'Joke or picture every', a_jevery_h: 'Random interval between jokes',
      a_list: 'Each activity', off: 'Off', rare: 'Rare', normal: 'Normal', often: 'Often', show: 'Show',
      act_yarn: 'Yarn', act_coffee: 'Coffee', act_book: 'Book', act_portal: 'Portal', act_levit: 'Levitation', act_bubbles: 'Soap bubbles', act_clones: 'Doubles', act_fireworks: 'Fireworks', act_mouse: 'Mouse hunt', act_fish: 'Fishing', act_hat: 'Hat trick', act_potion: 'Potion', act_yawn: 'Yawn', act_dance: 'Dance', act_run: 'Running on all fours',
      s_title: 'Speech', s_sub: 'What and how the cat says. Language and character.', s_say: 'Speak in bubbles', s_say_h: 'Short phrases above the cat during actions', s_chance: 'How often it comments', s_chance_h: 'Share of actions the cat says something about',
      s_time: 'How long a remark stays', s_time_h: 'Depends on the phrase length. Multiplier: the bigger, the longer you can read',
      s_gap: 'Pause between remarks', s_gap_h: 'The cat will not speak more often than this. During a portal there is no pause', sec: 's',
      s_chat: 'Chat when bored', s_chat_h: 'Now and then the cat remarks something on its own: by time of day, for no reason', s_chat_every: 'Chat every',
      s_lang: 'Speech and interface language', s_sarc: 'Sarcasm level', s_sarc_h: 'From sweet to venomous. Affects the cat’s lines and system remarks',
      sarc0: 'Sweet', sarc1: 'Ironic', sarc2: 'Sarcastic', sarc3: 'Venomous', s_pre: 'This is how it will sound', s_more: 'More examples',
      y_title: 'System', y_sub: 'The cat watches the computer and grumbles out loud if something is off. Nothing is sent to the internet.', y_now: 'Right now', y_on: 'Watch the system', y_on_h: 'Master switch for all checks below', y_cool: 'Do not repeat more often than every', y_cool_h: 'Pause between identical remarks',
      y_checks: 'Checks', y_trash: 'Trash', y_trash_h: 'Tells you when garbage piles up in the trash', y_trash_every: 'check every', y_trash_min: 'from', y_mem: 'Memory', y_mem_h: 'Grumbles when memory is full and names the hungry app', y_cpu: 'CPU', y_cpu_h: 'If the load stays high, names who is heating the computer', y_disk: 'Disk', y_disk_h: 'When free space is low', y_bat: 'Battery', y_bat_h: 'When the charge is low and the charger is not connected', y_up: 'Restart', y_up_h: 'If the Mac has not been restarted for a long time', y_brk: 'Breaks', y_brk_h: 'Reminds you to rest after long work without pauses',
      pct: '%', mb: 'MB', gb: 'GB', days: 'days', hold: 'lasting', over: 'over', below: 'below', free: 'free', test: 'Test', tr_now: 'Trash', mem_now: 'Memory', cpu_now: 'CPU', disk_now: 'Disk', bat_now: 'Battery', up_now: 'Uptime', files: 'files', unk: 'no data',
      fda: 'To let Kotomag see the trash size, give it “Full Disk Access”. Without it, it only knows the number of items.', fda_open: 'Open access settings',
      b_title: 'About Kotomag', b_sub: 'A wizard cat on your desktop: entertains you, tells jokes, goes fishing and keeps an eye on your computer.', b_keys: 'Hotkeys', b_laser: 'Laser pointer', b_files: 'Files', b_log: 'Show log file', b_ver: 'Version',
      hk_title: 'Hotkeys', hk_laser: 'Laser pointer', hk_laser_h: 'Toggles the pointer: the cat chases the red dot at your cursor. Backup: ⌥-click on the cat', hk_change: 'Record…', hk_press: 'Press a combination…', hk_cancel: 'Cancel', hk_ok: 'active', hk_busy: 'taken by another app', hk_reset: 'Default', hk_need: 'A modifier is needed: ⌘, ⌃ or ⌥', hk_need2: 'Alt is needed together with Ctrl or Shift', hk_res: 'The system and apps need this combination. Add ⌥ or ⌃ (on Windows: Alt together with Ctrl or Shift)', hk_help2: 'Press Test, then the combination. If it does not fire, another program may be using it: pick a different one.', autostart: 'Start with the system', autostart_h: 'The cat appears by itself after you sign in', hk_test: 'Test', hk_wait: 'Press the combination now…', hk_fired: 'It fired!', hk_nofire: 'It did not fire', hk_help: 'If the combination does not fire, macOS is not letting Kotomag see the keys. Enable Kotomag under Input Monitoring and Accessibility, then restart Kotomag.', hk_in: 'Input Monitoring', hk_ax: 'Accessibility', hk_trust_no: 'Accessibility: not granted', hk_trust_yes: 'Accessibility: granted',
      b_how: 'How it works', b_how_t: 'Right-click the cat for a menu: settings, do not disturb, system report, a joke, activities. You can pick up the cat with the mouse and move it.',
    },
  };
  const ACTS = ['yarn', 'coffee', 'book', 'portal', 'levit', 'bubbles', 'clones', 'fireworks', 'mouse', 'fish', 'hat', 'potion', 'yawn', 'dance', 'run'];
  let cfg = null, tab = 'general', sentAt = 0, liveTimer = null;
  const $ = (s, el = document) => el.querySelector(s);
  const t = (k) => (TR[cfg ? cfg.lang : 'ru'] || TR.ru)[k] ?? k;
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const nest = (p, v) => p.split('.').reduceRight((a, k) => ({ [k]: a }), v);
  function setv(p, v) { sentAt = Date.now(); const patch = nest(p, v); ks.set(patch); let o = cfg; const ks_ = p.split('.'); for (let i = 0; i < ks_.length - 1; i++) o = o[ks_[i]]; o[ks_[ks_.length - 1]] = v; }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  function toggle(path, onChange) {
    const l = el('label', 'sw'), i = el('input'); i.type = 'checkbox'; i.checked = !!get(cfg, path); l.append(i, el('span'));
    i.onchange = () => { setv(path, i.checked); if (onChange) onChange(i.checked); };
    return l;
  }
  function seg(path, opts, num) {
    const w = el('div', 'seg'), cur = get(cfg, path);
    opts.forEach(([v, label]) => { const b = el('button', cur === v ? 'on' : '', label); b.onclick = () => { setv(path, v); [...w.children].forEach((c) => c.classList.remove('on')); b.classList.add('on'); }; w.append(b); });
    return w;
  }
  function range(path, min, max, step, fmt) {
    const w = el('div', 'rng'), i = el('input'), v = el('span', 'val'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = get(cfg, path);
    const paint = () => { i.style.setProperty('--p', ((i.value - min) / (max - min)) * 100 + '%'); v.textContent = fmt(+i.value); };
    paint(); i.oninput = () => { paint(); setv(path, +i.value); };
    w.append(i, v); return w;
  }
  function num(path, min, max, unit, step) {
    const w = el('span', 'ctl'), i = el('input'); i.type = 'number'; i.min = min; i.max = max; i.step = step || 1; i.value = get(cfg, path);
    i.onchange = () => { let v = Math.min(max, Math.max(min, +i.value || min)); i.value = v; setv(path, v); };
    w.append(i); if (unit) w.append(el('span', 'unit', unit)); return w;
  }
  function timeIn(path) { const i = el('input'); i.type = 'time'; i.value = get(cfg, path); i.onchange = () => { if (i.value) setv(path, i.value); }; return i; }
  function row(label, hint, ...ctl) {
    const r = el('div', 'row'), l = el('div', 'lab'); l.append(el('b', '', label)); if (hint) l.append(el('small', '', hint));
    const c = el('div', 'ctl'); c.append(...ctl); r.append(l, c); if (ctl.length > 3) r.classList.add('stack'); return r;
  }
  function card(title, ...rows) { const c = el('div', 'card'); if (title) c.append(el('h2', '', title)); c.append(...rows); return c; }
  function head(title, sub) { const f = document.createDocumentFragment(); f.append(el('h1', '', title), el('p', 'sub', sub)); return f; }
  const lvl = (n) => [t('off'), t('rare'), t('normal'), t('often')][n];
  const fmtMin = (v) => `${v} ${t('min')}`;

  // ---- вкладки ----
  // ---- горячая клавиша ----
  const MAPK = { Enter: 'Return', NumpadEnter: 'Return', Space: 'Space', Tab: 'Tab', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Backspace: 'Backspace', Delete: 'Delete', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown', Minus: 'Minus', Equal: 'Equal', Comma: 'Comma', Period: 'Period', Slash: 'Slash', Backslash: 'Backslash', Semicolon: 'Semicolon', Quote: 'Quote', Backquote: 'Backquote', BracketLeft: 'BracketLeft', BracketRight: 'BracketRight' };
  function toAccel(e) {
    let key = null, m;
    if ((m = e.code.match(/^Key([A-Z])$/))) key = m[1]; else if ((m = e.code.match(/^Digit(\d)$/))) key = m[1]; else if (/^F([1-9]|1\d|2[0-4])$/.test(e.code)) key = e.code; else key = MAPK[e.code] || null;
    if (!key || !(e.metaKey || e.ctrlKey || e.altKey)) return null;
    if (!isMac() && !e.altKey) return null;
    if (!isMac()) return [e.ctrlKey ? 'CommandOrControl' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Shift' : '', e.metaKey ? 'Super' : '', key].filter(Boolean).join('+');
    return [e.metaKey ? 'CommandOrControl' : '', e.ctrlKey ? 'Control' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Shift' : '', key].filter(Boolean).join('+');
  }
  const isMac = () => !cfg || cfg.platform === 'darwin';
  const prettyKey = (a) => (isMac()
    ? String(a).split('+').map((x) => ({ CommandOrControl: '⌘', Command: '⌘', Control: '⌃', Alt: '⌥', Option: '⌥', Shift: '⇧', Plus: '+', Minus: '-', Comma: ',', Period: '.', Slash: '/', Backslash: '\\' }[x] || x)).join('')
    : String(a).split('+').map((x) => ({ CommandOrControl: 'Ctrl', Control: 'Ctrl', Command: 'Win', Super: 'Win', Alt: 'Alt', Option: 'Alt', Shift: 'Shift' }[x] || x)).join('+'));
  function hotkeyRow() {
    const box = el('span', 'keybox', prettyKey(cfg.laserKey)), st = el('span', 'tag' + (cfg.hotkeyOk === false ? ' bad' : ''), cfg.hotkeyOk === false ? t('hk_busy') : cfg.hotkeyOk ? t('hk_ok') : '');
    if (!st.textContent) st.style.display = 'none';
    const btn = el('button', 'ghost', t('hk_change')), rst = el('button', 'ghost', t('hk_reset'));
    let on = null;
    const stop = () => { if (on) window.removeEventListener('keydown', on, true); on = null; btn.textContent = t('hk_change'); box.classList.remove('rec'); box.textContent = prettyKey(cfg.laserKey); };
    btn.onclick = () => {
      if (on) { stop(); return; }
      btn.textContent = t('hk_cancel'); box.classList.add('rec'); box.textContent = t('hk_press');
      on = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.key === 'Escape') { stop(); return; }
        if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return;
        const acc = toAccel(e); if (!acc) { box.textContent = isMac() ? t('hk_need') : t('hk_need2'); return; }
        if (isMac() ? (!e.altKey && !e.ctrlKey && !/^F\d/.test(e.code)) : (!(e.ctrlKey || e.shiftKey) && !/^F\d/.test(e.code))) { box.textContent = t('hk_res'); return; }
        stop(); setv('laserKey', acc); setv('laserKeyOn', true); setTimeout(render, 150);
      };
      window.addEventListener('keydown', on, true);
    };
    rst.onclick = () => { stop(); setv('laserKey', 'CommandOrControl+Alt+L'); setv('laserKeyOn', true); setTimeout(render, 150); };
    return row(t('hk_laser'), isMac() ? t('hk_laser_h') : t('hk_laser_h').replace('⌥-', 'Alt-'), box, st, btn, rst, toggle('laserKeyOn'));
  }
  function hotkeyTest() {
    const res = el('span', 'unit', isMac() ? (cfg.trusted === false ? t('hk_trust_no') : cfg.trusted ? t('hk_trust_yes') : '') : '');
    const b = el('button', 'ghost', t('hk_test')); let tm = null;
    b.onclick = () => { res.textContent = t('hk_wait'); ks.probe(); clearTimeout(tm); tm = setTimeout(() => { if (res.textContent === t('hk_wait')) res.textContent = t('hk_nofire'); }, 12500); window.__fired = () => { clearTimeout(tm); res.textContent = t('hk_fired'); }; };
    const r = row(t('hk_test'), isMac() ? t('hk_help') : t('hk_help2'), res, b);
    if (isMac()) {
      const a1 = el('button', 'ghost', t('hk_in')), a2 = el('button', 'ghost', t('hk_ax'));
      a1.onclick = () => ks.openAccess('input'); a2.onclick = () => { ks.askAccess(); ks.openAccess('ax'); };
      r.querySelector('.ctl').append(a1, a2); r.classList.add('stack');
    }
    return r;
  }
  function tabGeneral(c) {
    c.append(head(t('g_title'), t('g_sub')));
    const q = row(t('q_manual'), t('q_manual_h'), toggle('quiet.manual'));
    c.append(card(t('g_beh'), row(t('autostart'), t('autostart_h'), toggle('autostart')), row(t('sound'), t('sound_h'), toggle('sound')), row(t('follow'), t('follow_h'), toggle('follow')), row(t('welcome'), t('welcome_h'), toggle('welcome')), row(t('sleep'), t('sleep_h'), toggle('sleep'))));
    c.append(card(t('hk_title'), hotkeyRow(), hotkeyTest()));
    c.append(card(t('g_auto'), row(t('play'), t('play_h'), toggle('play')), row(t('jokes'), t('jokes_h'), toggle('jokes')), row(t('jfilter'), t('jfilter_h'), toggle('jokeFilter'))));
    c.append(card(t('g_quiet'), q, row(t('q_sched'), t('q_sched_h'), timeIn('quiet.from'), el('span', 'unit', t('q_to')), timeIn('quiet.to'), toggle('quiet.schedule'))));
    const rs = el('button', 'ghost danger', t('reset')); rs.onclick = () => { if (confirm(t('reset_q'))) { ks.reset(); } };
    const w = el('div'); w.style.marginTop = '4px'; w.append(rs); c.append(w);
  }
  function tabActs(c) {
    c.append(head(t('a_title'), t('a_sub')));
    c.append(card(t('a_when'),
      row(t('a_every'), t('a_every_h'), num('actMin', 1, 240, ''), el('span', 'unit', '–'), num('actMax', 1, 480, t('min'))),
      row(t('a_jevery'), t('a_jevery_h'), num('jokeMin', 1, 480, ''), el('span', 'unit', '–'), num('jokeMax', 1, 960, t('min')))));
    const rows = ACTS.map((k) => { const b = el('button', 'ghost', t('show')); b.onclick = () => ks.act(k); return row(t('act_' + k), '', seg('acts.' + k, [[0, t('off')], [1, t('rare')], [2, t('normal')], [3, t('often')]]), b); });
    c.append(card(t('a_list'), ...rows));
  }
  function tabSpeech(c) {
    c.append(head(t('s_title'), t('s_sub')));
    const prev = el('div'); const fill = () => {
      prev.textContent = ''; PH.set(cfg.lang, cfg.sarcasm);
      for (const [k, p] of [['act.fish'], ['portal.in'], ['hat.rabbit'], ['sys.mem', { pct: 92, top: cfg.lang === 'ru' ? 'Хром' : 'Chrome' }], ['sys.brk', { n: 95 }]]) prev.append(el('div', 'sample', PH.T(k, p)));
    };
    const more = el('button', 'ghost', t('s_more')); more.onclick = fill;
    const sar = row(t('s_sarc'), t('s_sarc_h'), range('sarcasm', 0, 3, 1, (v) => t('sarc' + v)));
    sar.querySelector('input').addEventListener('input', () => setTimeout(fill, 30));
    c.append(card(null, row(t('s_say'), t('s_say_h'), toggle('say')), row(t('s_chance'), t('s_chance_h'), range('sayChance', 0, 100, 5, (v) => v + '%')), row(t('s_time'), t('s_time_h'), range('sayTime', 1, 5, 0.5, (v) => '×' + v)), row(t('s_gap'), t('s_gap_h'), range('sayGap', 0, 60, 1, (v) => v + ' ' + t('sec'))), row(t('s_chat'), t('s_chat_h'), toggle('chat')), row(t('s_chat_every'), '', num('chatMin', 1, 240, ''), el('span', 'unit', '–'), num('chatMax', 1, 480, t('min')))));
    c.append(card(null, sar, (() => { const r = el('div', 'row'); const l = el('div', 'lab'); l.append(el('b', '', t('s_pre'))); const w = el('div'); w.style.flex = '1'; w.append(prev, more); r.append(l); r.style.alignItems = 'flex-start'; l.style.flex = '0 0 150px'; r.append(w); return r; })()));
    fill();
  }
  function tabSys(c) {
    c.append(head(t('y_title'), t('y_sub')));
    const live = el('div', 'live'); const snap = async () => {
      const s = await ks.sysNow(); if (!s || !live.isConnected) return; live.textContent = '';
      const tile = (k, v, sub, pct) => { const d = el('div', 'tile'); d.append(el('div', 'k', k), el('div', 'v', v)); if (sub) d.append(el('div', 's', sub)); if (pct != null) { const b = el('div', 'bar'), i = el('i'); i.style.width = Math.min(100, pct) + '%'; b.append(i); d.append(b); } return d; };
      const dec = (n) => (cfg.lang === 'ru' ? String(n).replace('.', ',') : String(n));
      live.append(
        tile(t('mem_now'), s.mem ? s.mem.usedPct + '%' : '—', s.mem && s.mem.top, s.mem && s.mem.usedPct),
        tile(t('cpu_now'), s.cpu ? s.cpu.pct + '%' : '—', s.cpu && s.cpu.top, s.cpu && s.cpu.pct),
        tile(t('disk_now'), s.disk ? dec(s.disk.freeGB.toFixed(1)) + ' ' + t('gb') : '—', s.disk && `${t('free')} / ${Math.round(s.disk.totalGB)} ${t('gb')}`, s.disk && 100 - (s.disk.freeGB / s.disk.totalGB) * 100),
        tile(t('tr_now'), s.trash ? (s.trash.mb != null ? PH.size(s.trash.mb) : String(s.trash.count)) : '—', s.trash && `${s.trash.count} ${t('files')}`),
        tile(t('bat_now'), s.battery ? s.battery.pct + '%' : '—', s.battery ? (s.battery.charging ? '+' : '') : t('unk'), s.battery && s.battery.pct),
        tile(t('up_now'), s.uptimeDays != null ? dec(s.uptimeDays.toFixed(1)) + ' ' + t('days') : '—'));
    };
    snap(); clearInterval(liveTimer); liveTimer = setInterval(snap, 4000);
    const lc = el('div', 'card'); lc.append(el('h2', '', t('y_now')), live); c.append(lc);
    const test = (k) => { const b = el('button', 'ghost', t('test')); b.onclick = () => ks.sysTest(k); return b; };
    const ck = (key, label, hint, path, ...ctl) => { const r = row(label, hint, ...ctl, test(key), toggle(path + '.on', (on) => r.classList.toggle('off', !on))); r.classList.toggle('off', !get(cfg, path + '.on')); return r; };
    c.append(card(null, row(t('y_on'), t('y_on_h'), toggle('sys.on')), row(t('y_cool'), t('y_cool_h'), num('sys.cooldownMin', 1, 600, t('min')))));
    c.append(card(t('y_checks'),
      ck('trash', t('y_trash'), t('y_trash_h'), 'sys.trash', el('span', 'unit', t('y_trash_min')), num('sys.trash.minMB', 0, 100000, t('mb'), 50), el('span', 'unit', t('y_trash_every')), num('sys.trash.everyMin', 5, 1440, t('min'))),
      ck('mem', t('y_mem'), t('y_mem_h'), 'sys.mem', el('span', 'unit', t('over')), num('sys.mem.pct', 50, 99, '%'), el('span', 'unit', t('hold')), num('sys.mem.holdMin', 0, 60, t('min'))),
      ck('cpu', t('y_cpu'), t('y_cpu_h'), 'sys.cpu', el('span', 'unit', t('over')), num('sys.cpu.pct', 30, 100, '%'), el('span', 'unit', t('hold')), num('sys.cpu.holdMin', 0, 60, t('min'))),
      ck('disk', t('y_disk'), t('y_disk_h'), 'sys.disk', el('span', 'unit', t('below')), num('sys.disk.freeGB', 1, 2000, t('gb'))),
      ck('battery', t('y_bat'), t('y_bat_h'), 'sys.battery', el('span', 'unit', t('below')), num('sys.battery.pct', 5, 60, '%')),
      ck('uptime', t('y_up'), t('y_up_h'), 'sys.uptime', el('span', 'unit', t('over')), num('sys.uptime.days', 1, 365, t('days'))),
      ck('brk', t('y_brk'), t('y_brk_h'), 'sys.brk', num('sys.brk.everyMin', 15, 480, t('min')))));
    if (isMac()) { const n = el('div', 'note'); n.append(document.createTextNode(t('fda') + ' ')); const a = el('a', '', t('fda_open')); a.onclick = () => ks.openFda(); n.append(a); c.append(n); }
  }
  function tabAbout(c) {
    c.append(head(t('b_title'), t('b_sub')));
    const lg = el('button', 'ghost', t('b_log')); lg.onclick = () => ks.openLog();
    c.append(card(null, row(t('b_ver'), '', el('span', 'keys', cfg.version || '')), row(t('b_keys'), t('b_laser'), el('span', 'keys', prettyKey(cfg.laserKey))), row(t('b_files'), cfg.logPath || '', lg), row(t('b_how'), t('b_how_t'))));
  }
  const TABS = [['general', tabGeneral], ['acts', tabActs], ['speech', tabSpeech], ['sys', tabSys], ['about', tabAbout]];

  function render() {
    if (!cfg) return;
    document.documentElement.lang = cfg.lang;
    $('#bver').textContent = 'v' + (cfg.version || '');
    $('#bname').textContent = cfg.lang === 'en' ? 'Kotomag' : 'Котомаг';
    $('#langlabel').textContent = t('lang');
    const nav = $('#nav'); nav.textContent = '';
    TABS.forEach(([id]) => { const b = el('button', id === tab ? 'on' : '', t('tab_' + id)); b.onclick = () => { tab = id; render(); }; nav.append(b); });
    const ls = $('#langseg'); ls.textContent = '';
    [['ru', 'Русский'], ['en', 'English']].forEach(([v, n]) => { const b = el('button', cfg.lang === v ? 'on' : '', n); b.onclick = () => { setv('lang', v); render(); }; ls.append(b); });
    clearInterval(liveTimer);
    const c = $('#content'); const sc = $('#main').scrollTop; c.textContent = '';
    TABS.find(([id]) => id === tab)[1](c);
    $('#main').scrollTop = sc;
  }
  window.addEventListener('DOMContentLoaded', async () => {
    $('#logo').src = '../ui/sprites/idle-1.png';
    cfg = await ks.get(); render();
    ks.onFired(() => { if (window.__fired) window.__fired(); });
    ks.onCfg((d) => { const ch = !cfg || d.hotkeyOk !== cfg.hotkeyOk || d.laserKey !== cfg.laserKey; if (Date.now() - sentAt < 700 && !ch) { cfg = d; return; } cfg = d; render(); });
  });
})();
