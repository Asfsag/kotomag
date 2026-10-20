// Строки главного процесса: меню и сообщения. Реплики кота лежат в ui/phrases.js, окно настроек — в settings/settings.js.
const S = {
  ru: {
    settings: 'Настройки…', quietOn: 'Не беспокоить: включено', quietOff: 'Не беспокоить: выключено', report: 'Что с компьютером?',
    joke: 'Рассказать анекдот', pic: 'Показать смешную картинку', acts: 'Занятия', quit: 'Выйти',
    here: 'Я уже здесь, внизу экрана',
    a: { yarn: 'Поиграть с клубком', coffee: 'Выпить кофе', book: 'Почитать книгу', dance: 'Станцевать', fish: 'Порыбачить', hat: 'Фокус со шляпой', potion: 'Сварить зелье', yawn: 'Зевнуть', levit: 'Левитировать', bubbles: 'Пускать мыльные пузыри', mouse: 'Охота на мышку', clones: 'Размножиться (двойники)', fireworks: 'Устроить салют', run: 'Пробежаться на четвереньках', laser: 'Лазерная указка', portal: 'Портал (телепортируется по экрану)', joy: 'Обрадоваться' },
  },
  en: {
    settings: 'Settings…', quietOn: 'Do not disturb: on', quietOff: 'Do not disturb: off', report: 'How is the computer?',
    joke: 'Tell a joke', pic: 'Show a funny picture', acts: 'Activities', quit: 'Quit',
    here: "I'm already here, at the bottom of the screen",
    a: { yarn: 'Play with yarn', coffee: 'Drink coffee', book: 'Read a book', dance: 'Dance', fish: 'Go fishing', hat: 'Hat trick', potion: 'Brew a potion', yawn: 'Yawn', levit: 'Levitate', bubbles: 'Blow soap bubbles', mouse: 'Hunt a mouse', clones: 'Multiply (doubles)', fireworks: 'Fireworks', run: 'Run on all fours', laser: 'Laser pointer', portal: 'Portal (teleports around the screen)', joy: 'Rejoice' },
  },
};
const LOCAL_JOKES_EN = [
  'A wizard told his cat: "I have a new spell!" The cat: "Pour the milk first, then cast."',
  'A programmer asks the cat: "Why do you sit on my keyboard?" Cat: "I am optimizing your code by deleting everything unnecessary."',
  'The cat knocked the mug off the table and stared into my eyes. It is not a bug, it is gravity testing.',
  'A deadline is like a cat: it sits on your keyboard and keeps you from working.',
  'If a cat stares into an empty corner, it is not seeing ghosts. It is making sure you do not relax.',
  'The scariest spell: "Get up, the food is gone" at 5 a.m.',
  'A wizard wrote a 100-line spell. The cat walked across the keyboard and fixed everything.',
  '"How old are you?" "Nine lives, three used up. The rest are with me."',
  'My cat has a magic wand: its tail. One wave and the bowl is full. Well, almost.',
  'A programmer: "There are no bugs, only features." The cat at night: "Here is one more feature for your carpet."',
  'Why do cats make great sysadmins? They knock things off the table and watch how the system reacts.',
  'I told my cat I would restart the server. He nodded and reset my router with his paw.',
];
module.exports = { S, LOCAL_JOKES_EN };
