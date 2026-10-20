# Kotomag

A pixel-art **wizard cat** that lives at the bottom of your screen. He walks around, goes fishing, brews potions
(sometimes they explode), jumps through portals, chases a red laser dot, tells jokes, and quietly keeps an eye on
your computer: the Trash, memory, CPU, disk, battery and how long you have been working without a break.
Everything speaks **English or Russian** and has a **sarcasm dial** from sweet to venomous.

Русская версия ниже: [Русский](#русский).

| Fishing (six fish drawn for the game) | Portal |
|---|---|
| ![fish](docs/fish.png) | ![portal](docs/portal.png) |

| Speech bubbles | System report |
|---|---|
| ![bubbles](docs/speech-bubbles.png) | ![report](docs/system-report.png) |

![settings](docs/settings.png)

## Features

- **17 activities** that start by themselves (or from the right-click menu): yarn, coffee, book, dance, fishing,
  hat trick, potion brewing, yawning, levitation, soap bubbles, mouse hunt, clones, fireworks, running on all fours,
  laser pointer, portal teleporting, joy. Each one can be turned off or made rarer or more frequent.
- **About 1200 remarks** (600 per language) in three tones: sweet, ironic, sarcastic. The *sarcasm level* slider
  decides the mix, and the same line never repeats back to back. When bored he makes time-of-day small talk.
- **System remarks**: Trash size, memory pressure (and which app eats it), CPU load, free disk space, low battery,
  a long uptime, and a "take a break" nudge after a long stretch of work. Thresholds are configurable. Everything is computed locally.
- **Settings window** (right-click the cat, then *Settings*): general behaviour, activities, speech, system, about;
  toggles, frequencies, do-not-disturb with a schedule, start with the system, a configurable hotkey.
- **Laser pointer**: the cat chases a red dot at your cursor. Use the hotkey (default `Cmd/Ctrl+Alt+L`, changeable) or Alt-click on the cat.
- Drag the cat with the mouse, click to pet him. He follows your cursor and falls asleep when idle (after a yawn).
- Jokes and funny cat pictures on demand or now and then. They are fetched from public APIs
  (rzhunemogu.ru, jokeapi.dev, meme-api.com, thecatapi.com) **only when the cat tells a joke**. Rude jokes are filtered by default.
  Switch *Jokes and pictures* off to stop all network requests.

## Install

Download the archive for your system from the [Releases](../../releases) page and unpack it.

- **macOS** (Apple silicon and Intel): `Kotomag-mac.zip`, then `Kotomag.app`. The app is signed ad hoc (not notarized):
  right-click it and choose *Open*, or run `xattr -cr Kotomag.app` once.
  The hotkey is read by a small helper that needs no special permissions.
- **Windows**: `Kotomag-win.zip`, then run `Kotomag.exe`. SmartScreen may warn about an unknown publisher (the app is unsigned).
  A tray icon opens the settings or quits the app. *This build is new and has not been tested on real Windows hardware yet. Bug reports are welcome.*

Settings are stored in your user data folder (`config.json`, `log.txt`).

## Build from source

```bash
npm install
npm start                   # run from sources
bash scripts/build-mac.sh   # macOS: dist/Kotomag.app and dist/Kotomag-mac.zip (needs Xcode command line tools)
npm run dist:win            # Windows zip with electron-builder
```

Layout: `src/main.js` (window, tray, settings IPC, hotkey), `src/sysmon.js` (system checks for macOS, Windows and Linux),
`src/config.js` (defaults and validation), `src/ui/` (the cat, the speech bank in `phrases*.js`, sprites),
`src/settings/` (settings window), `native/keys.c` (macOS hotkey poller).

## License

Source code: MIT (`LICENSE`). Artwork (sprites, animation frames, fish, icon): © 2026 Asfsag, all rights reserved (`LICENSE-ART.md`).

---

## Русский

**Котомаг** это пиксельный кот-волшебник внизу экрана. Гуляет, рыбачит, варит зелья (иногда они взрываются),
прыгает через порталы, гоняется за красной точкой, рассказывает анекдоты и приглядывает за компьютером:
корзина, память, процессор, диск, батарея и перерывы в работе. Реплики на **русском и английском**, а ещё есть
**ручка сарказма** от милого кота до ядовитого.

### Возможности

- **17 занятий**, которые кот затевает сам или по правому клику: клубок, кофе, книга, танец, рыбалка, фокус со шляпой,
  зелье, зевок, левитация, мыльные пузыри, охота на мышку, двойники, салют, бег на четвереньках, лазерная указка, порталы, радость.
  Каждое можно выключить или сделать реже и чаще.
- **Около 1200 реплик** в трёх тонах (милые, с иронией, саркастичные). Уровень сарказма меняет смесь. Одна и та же фраза подряд не повторяется.
- **Системные замечания**: размер корзины, занятая память (и какое приложение виновато), нагрузка процессора, место на диске,
  заряд батареи, давняя перезагрузка и напоминание о перерыве. Пороги настраиваются, данные не покидают компьютер.
- **Окно настроек** (правый клик, «Настройки…»): поведение, занятия, реплики, система, «не беспокоить» с расписанием, автозапуск, горячая клавиша.
- **Лазерная указка**: кот гоняется за красной точкой у курсора. Клавиша по умолчанию `Cmd/Ctrl+Alt+L`, меняется в настройках, запасной способ: Alt-клик по коту.
- Шутки и картинки с котами берутся из открытых источников **только когда кот шутит**, грубые шутки по умолчанию отфильтрованы;
  тумблер «Анекдоты и картинки» отключает все сетевые запросы.

### Установка

Скачайте архив для своей системы на странице [Releases](../../releases).
macOS: `Kotomag-mac.zip`, программа подписана локально (не нотаризована): правый клик, «Открыть», либо один раз `xattr -cr Kotomag.app`.
Windows: `Kotomag-win.zip`, запустите `Kotomag.exe` (SmartScreen может предупредить, подписи нет). Сборка для Windows новая и пока не проверена на настоящем компьютере с Windows.

Лицензия: код MIT, графика © 2026 Asfsag, все права защищены.
