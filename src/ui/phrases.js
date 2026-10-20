// Реплики кота: два языка и три тона (0 милый, 1 с иронией, 2 саркастичный). Тон выбирается по уровню сарказма из настроек.
(function () {
  const K = {};
  const P = (key, ru, en) => { K[key] = { ru, en }; };
  // ---- занятия ----
  P('act.yarn', [['Клубочек!', 'Ой, клубок!', 'Поиграем!'], ['Опять клубок. Классика.', 'Охота на нитку открыта.'], ['Серьёзное занятие: гоняюсь за ниткой.', 'Работа мечты: клубок и я.']],
    [['Yarn!', 'Oh, a yarn ball!', "Let's play!"], ['Yarn again. A classic.', 'The great string hunt begins.'], ['Serious work: chasing string.', 'Living the dream: me and a ball of yarn.']]);
  P('act.coffee', [['Кофеёк!', 'Время кофе!', 'М-м, ароматно!'], ['Кофе: топливо гениев.', 'Без кофе я просто кот.'], ['Кофе — единственный, кто меня понимает.', 'Пятая чашка. Это нормально.']],
    [['Coffee time!', 'Mmm, smells great!', 'Coffee!'], ['Coffee: fuel for geniuses.', "Without coffee I'm just a cat."], ['Coffee is the only one who gets me.', 'Fifth cup. Totally normal.']]);
  P('act.book', [['Почитаем?', 'Умная книжка!', 'Глава первая…'], ['Читаю умную книжку. Видно же?', 'Образование — сила.'], ['Читаю, чтобы ты не думал, что я глупый.', 'Вот так выглядит самообразование.']],
    [['Shall we read?', 'A clever book!', 'Chapter one…'], ["Reading a smart book. Can't you tell?", 'Knowledge is power.'], ["Reading so you don't think I'm dumb.", "This is what self-improvement looks like."]]);
  P('act.joy', [['Ура!', 'С возвращением!', 'Я скучал!'], ['О, ты вернулся. Я почти не скучал.', 'Явился не запылился.'], ['Где тебя носило? Миска пуста.', 'Наконец-то. Я тут один, на грани нервного срыва.']],
    [['Yay!', 'Welcome back!', 'I missed you!'], ["Oh, you're back. I barely missed you.", 'Look who showed up.'], ['Where have you been? The bowl is empty.', "Finally. I've been alone and on the verge of a breakdown."]]);
  P('act.dance', [['Танцуем!', 'Победный танец!', 'Ча-ча-ча!', 'Ай-на-на!'], ['Танцую, потому что могу.', 'Только не снимай на видео.'], ['Пока ты работаешь, я развлекаюсь.', 'Это не танец, это растяжка. Да.']],
    [["Let's dance!", 'Victory dance!', 'Cha-cha-cha!'], ["I dance because I can.", "Just don't film this."], ['You work, I party.', "That's not dancing, it's stretching. Yes."]]);
  P('act.levit', [['Ом-м-м…', 'Медитирую…', 'Лёгкий как пух!'], ['Просветление через пять секунд.', 'Тише, я паря.'], ['Левитация: нет лап на земле — нет проблем.', 'Не мешай, я постигаю дзен. Или лень.']],
    [['Ommm…', 'Meditating…', 'Light as a feather!'], ['Enlightenment in five seconds.', 'Quiet, I am floating.'], ['Levitation: no paws on the ground, no problems.', "Don't disturb me, I'm achieving zen. Or laziness."]]);
  P('act.levit2', [['Я парю!', 'Тишина…', 'Нирвана!'], ['Земля далеко. Проблемы тоже.', 'Почти просветлился.'], ['Дзен достигнут. Сейчас вернусь и всё испорчу.', 'Парить проще, чем работать.']],
    [["I'm floating!", 'Silence…', 'Nirvana!'], ['The ground is far. So are my problems.', 'Almost enlightened.'], ['Zen achieved. Now I go back and ruin everything.', 'Floating is easier than working.']]);
  P('act.bubbles', [['Пузыри!', 'Мыльная магия!', 'Пуф-пуф!'], ['Профессиональное выдувание пузырей.', 'Магия уровня детского сада.'], ['Великий волшебник пускает пузыри. Прогресс.', 'Вот на что уходит моя мана.']],
    [['Bubbles!', 'Soap magic!', 'Puff puff!'], ['Professional bubble blowing.', 'Kindergarten-level magic.'], ['The great wizard blows bubbles. Progress.', 'This is where my mana goes.']]);
  P('act.clones', [['Раз, два, три!', 'Мои двойники!', 'Хи-хи-хи!'], ['Теперь нас четверо. Все хотят есть.', 'Размножение без последствий.'], ['Четыре кота, ноль пользы.', 'Копии работают так же, как я: никак.']],
    [['One, two, three!', 'My doubles!', 'Hee hee hee!'], ['Now there are four of us. All hungry.', 'Multiplication without consequences.'], ['Four cats, zero use.', 'The copies work just like me: not at all.']]);
  P('act.fireworks', [['Салют!', 'Бабах!', 'Праздник!'], ['Праздник без повода. Лучший.', 'Фейерверк за счёт заведения.'], ['Салют в честь моего существования.', 'Дорого, красиво, бесполезно. Как я.']],
    [['Fireworks!', 'Boom!', 'Party time!'], ['A party for no reason. The best kind.', 'Fireworks on the house.'], ['Fireworks celebrating my existence.', 'Expensive, pretty, useless. Like me.']]);
  P('act.fireworks.end', [['Финал!'], ['Овации не нужны. Ладно, нужны.'], ['Можете не хлопать. Хлопайте.']], [['Finale!'], ["No applause needed. Okay, needed."], ["You don't have to clap. Clap."]]);
  P('act.mouse', [['Мышь!', 'Вижу мышку!', 'Держись, мышь!'], ['Не ты первая, не ты последняя.', 'Сегодня на ужин мышка.'], ['Ловлю мышь. Мышь так не считает.', 'Мышка бегает, кот профессионально наблюдает.']],
    [['A mouse!', 'I see a mouse!', 'Hold on, mouse!'], ["You're not the first, not the last.", 'Mouse for dinner tonight.'], ["I'm catching a mouse. The mouse disagrees.", 'The mouse runs, the cat professionally watches.']]);
  P('act.mouse.catch', [['Поймал!', 'Попалась!', 'Ам!'], ['Ну вот. Ужин.', 'Ладно, отпущу. Потом.'], ['Поймал. Не спрашивай, что дальше.', 'Победа. Со стороны выглядело иначе.']],
    [['Got it!', 'Caught you!', 'Nom!'], ['There. Dinner.', "Fine, I'll let go. Later."], ["Caught it. Don't ask what's next.", 'Victory. It looked different from outside.']]);
  P('act.mouse.miss', [['Ушла!', 'Мимо!', 'Ах ты!'], ['Это была тренировка.', 'Специально отпустил.'], ['Мышь победила. Я никому не скажу.', 'Промах засчитан как манёвр.']],
    [['It got away!', 'Missed!', 'You little…!'], ['That was practice.', 'I let it go on purpose.'], ["The mouse won. I won't tell anyone.", 'The miss counts as a maneuver.']]);
  P('act.fish', [['Рыбалка!', 'Тихо, не спугните…', 'Сейчас наловлю!'], ['Рыбалка: сидишь и ничего не делаешь, но красиво.', 'Посмотрим, кто кого.'], ['Рыбалка: ловить нечего, зато сижу.', 'Работа, которую ты не заметишь.']],
    [['Fishing time!', "Quiet, don't scare them…", "I'll catch loads!"], ['Fishing: sit and do nothing, but stylishly.', "Let's see who wins."], ['Fishing: nothing to catch, but I sit well.', "A job you won't even notice."]]);
  P('act.fish.bite', [['Клюёт?!'], ['Что-то есть!'], ['Ага, наконец-то!']], [['A bite?!'], ['Something is there!'], ['Finally!']]);
  P('catch.fish', [['Рыбка!', 'Ужин!', 'Ура, улов!'], ['Рыбка. Никогда не подводила.', 'Небольшая, но моя.'], ['Ну вот, ради этого мы сидели.', 'Улов дня. Чистая случайность.']],
    [['A fish!', 'Dinner!', 'Hooray, a catch!'], ['A fish. Never lets me down.', 'Small, but mine.'], ['So that is what we sat here for.', "Catch of the day. Pure luck."]]);
  P('catch.gold', [['Золотая рыбка!!', 'Исполни желание!'], ['Золотая. Загадаю лежанку.', 'Наверняка поддельная.'], ['Золотая рыбка. Желание: чтобы никто не мешал.', 'Требую налог и три желания.']],
    [['A goldfish!!', 'Grant me a wish!'], ["Golden. I'll wish for a cat bed.", 'Probably fake.'], ['A goldfish. My wish: to be left alone.', 'I demand tax and three wishes.']]);
  P('catch.boot', [['Опять сапог…', 'Ну да, сапог…'], ['Сапог. Как предсказуемо.', 'Хоть не носок.'], ['Сапог. Спасибо, океан.', 'Лучший улов за всю карьеру. Нет.']],
    [['A boot again…', 'Well, a boot…'], ['A boot. How predictable.', 'At least not a sock.'], ['A boot. Thanks, ocean.', 'Best catch of my career. Not.']]);
  P('catch.star', [['Звезда!', 'Поймал звезду!'], ['Звезда. Вот так просто.', 'Для разнообразия.'], ['Звезда на удочке. Не спрашивайте.', 'Достиг небес. Через лужу.']],
    [['A star!', 'I caught a star!'], ['A star. Just like that.', 'For a change.'], ["A star on a fishing rod. Don't ask.", 'Reached the heavens. Through a puddle.']]);
  P('act.hat', [['Внимание, фокус!', 'Только не моргайте!', 'Смотрите внимательно!'], ['Ничего в рукавах. И в шляпе тоже.', 'Фокус. Секрет — в шляпе.'], ['Сейчас достану что-нибудь из ничего. Как ваш менеджер.', 'Фокус: чудо, которого вы не заслужили.']],
    [['Attention, a trick!', "Don't blink!", 'Watch closely!'], ['Nothing up my sleeve. Or in the hat.', 'The secret is in the hat.'], ['Now I pull something out of nothing. Like your manager.', "A trick: a miracle you don't deserve."]]);
  P('hat.rabbit', [['Ап! Кролик…', 'Тадам! Классика!'], ['Кролик. Как оригинально.', 'Ну конечно, кролик.'], ['Кролик из шляпы. 1898 год звонил.', 'Мог достать что угодно. Кролик. Серьёзно?']],
    [['Ta-da! A rabbit…', 'Ta-dah! A classic!'], ['A rabbit. How original.', 'Of course, a rabbit.'], ['A rabbit from a hat. 1898 called.', 'I could pull out anything. A rabbit. Seriously?']]);
  P('hat.duck', [['Утёнок?!', 'Кря! Откуда?!'], ['Утка. Неожиданно.', 'Утёнок в шляпе. Бывает.'], ['Откуда в шляпе утка? Не знаю и не хочу.', 'Утка. Мой лучший трюк. Случайно.']],
    [['A duckling?!', 'Quack! Where from?!'], ['A duck. Unexpected.', 'A duckling in a hat. It happens.'], ["Why is there a duck in my hat? I don't know and don't want to.", 'A duck. My best trick. By accident.']]);
  P('hat.flower', [['Цветочек!', 'Для вас!'], ['Цветок. Лучше, чем ничего.', 'Дарю. Бесплатно.'], ['Цветочек. Вам хватит? Мне хватит.', 'Достал цветок. Не благодарите.']],
    [['A flower!', 'For you!'], ['A flower. Better than nothing.', "A gift. It's free."], ["A flower. Enough for you? Enough for me.", "Pulled out a flower. Don't thank me."]]);
  P('hat.star', [['Звезда!', 'Тадам!'], ['Звезда. Классно же?', 'Звёзды в шляпе. Как у всех.'], ['Просто звезда. Не требуй большего.', 'Достал звезду. Налоги платить будешь ты.']],
    [['A star!', 'Ta-da!'], ['A star. Cool, right?', 'Stars in a hat. Like everyone.'], ["Just a star. Don't ask for more.", 'Pulled out a star. You pay the taxes.']]);
  P('hat.heart', [['От всего сердца!', 'Любовь!'], ['Сердце. Не моё, чужое.', 'Любовь из шляпы. Работает.'], ['Сердце из шляпы. Романтика.', 'Любовь по запросу. Поддержка пока не отвечает.']],
    [['From the heart!', 'Love!'], ["A heart. Not mine, someone's.", 'Love from a hat. It works.'], ['A heart from a hat. Romance.', "Love on demand. Support isn't answering."]]);
  P('act.potion', [['Варим зелье!', 'Щепотка звёздной пыли…', 'Булькает!'], ['Рецепт? Какой рецепт?', 'Импровизация — моё всё.'], ['Я химик по призванию. Взрывы — побочный эффект.', 'Варю зелье. Инструкцию не читал.']],
    [["Brewing a potion!", 'A pinch of stardust…', 'It bubbles!'], ['Recipe? What recipe?', 'Improvisation is my thing.'], ['A chemist by vocation. Explosions are a side effect.', "Brewing a potion. Didn't read the manual."]]);
  P('potion.good', [['Получилось!', 'Идеально!', 'Зелье удачи!'], ['Получилось. Сам в шоке.', 'Рецепт сработал. Случайно.'], ['Никто не взорвался. Рекорд.', 'Получилось. Не говорите, что сомневались.']],
    [['It worked!', 'Perfect!', 'A luck potion!'], ["It worked. I'm shocked too.", 'The recipe worked. By accident.'], ['Nobody exploded. A record.', "It worked. Don't say you doubted me."]]);
  P('potion.bad', [['Бабах!', 'Опять взорвалось…', 'Так и задумано!'], ['Планировал взрыв, честно.', 'Незначительная потеря котла.'], ['Взрыв. Моя фирменная подпись.', 'Сажа — новая мода.']],
    [['Boom!', 'It exploded again…', 'As planned!'], ['I planned the explosion, honest.', 'Minor loss of a cauldron.'], ['An explosion. My signature.', 'Soot is the new fashion.']]);
  P('act.yawn', [['Ааах…', 'Хочется спать…', 'Ох, засыпаю…'], ['Засыпаю. Пока вы работаете.', 'Может, всё-таки подремлю.'], ['Скучно. Усну, если не заметите.', 'Ваша производительность усыпляет.']],
    [['Yaaawn…', 'So sleepy…', 'Oh, falling asleep…'], ["Falling asleep. While you work.", "Maybe I'll nap after all."], ["Boring. I'll sleep if you don't notice.", 'Your productivity is putting me to sleep.']]);
  P('act.run', [['Вжжжух!', 'Побежали!', 'Ту-ду-ду-дум!'], ['Бегу. Не спрашивайте куда.', 'Надо размяться.'], ['Бегу в никуда. Зато быстро.', 'Это называется кардио?']],
    [['Zoooom!', "Let's run!", 'Dun-dun-dun-dun!'], ["Running. Don't ask where.", 'Need to stretch my legs.'], ['Running nowhere. But fast.', 'Is this what they call cardio?']]);
  P('act.laser', [['Охота!', 'Вижу точку!', 'Лови!'], ['Точка. Моя заклятая подруга.', 'Красная — значит враг.'], ['Опять эта точка. Я знаю, что она не настоящая.', 'Догоню — перестанет.']],
    [['Hunt!', 'I see the dot!', 'Catch it!'], ['The dot. My sworn friend.', 'Red means enemy.'], ["That dot again. I know it's not real.", "Once I catch it, it'll stop."]]);
  // ---- состояния ----
  P('mode.pet', [['Мур!', 'Мрр!', 'Приятно!', 'Ещё!'], ['Допустим, мне приятно.', 'Можно и чаще.'], ['Ладно, можешь продолжить.', 'Не мешай, я тут страдаю.']],
    [['Purr!', 'Mrrr!', 'Nice!', 'More!'], ['Fine, I like it.', 'You can do it more often.'], ['Okay, you may continue.', "Don't interrupt, I'm suffering here."]]);
  P('mode.sleep', [['Зззз…', 'Посплю…'], ['Разбудите, если будет еда.', 'Сны о рыбе.'], ['Не будить. Это угроза.', 'Я сплю. Это мой вклад.']],
    [['Zzzz…', "I'll nap…"], ['Wake me if there is food.', 'Dreams about fish.'], ["Do not wake. That's a threat.", "I'm sleeping. That's my contribution."]]);
  P('mode.conj', [['Колдую…', 'Секунду…', 'Бормочу заклинание…'], ['Достаю что-то из рукава.', 'Скоро будет смешно. Возможно.'], ['Колдую. Результат не гарантирую.', 'Магия — это когда никто не проверяет.']],
    [['Casting…', 'One second…', 'Muttering a spell…'], ['Pulling something from my sleeve.', 'This will be funny soon. Maybe.'], ["Casting. No guarantees.", "Magic is when nobody checks."]]);
  P('mode.wake', [['Доброе утро!', 'А? Я не спал!', 'Я проснулся!'], ['Я не спал, я глаза закрыл.', 'Утро. Опять.'], ['Разбудили. Я запомню.', 'Утро? Серьёзно?']],
    [['Good morning!', "Huh? I wasn't asleep!", "I'm awake!"], ["I wasn't asleep, just resting my eyes.", 'Morning. Again.'], ["You woke me. I'll remember that.", 'Morning? Seriously?']]);
  P('mode.runEnd', [['Уф!', 'Добежал!'], ['Пробежка. Для здоровья.', 'Я не запыхался.'], ['Уф. Больше никогда. До завтра.', 'Спорт — это больно.']],
    [['Phew!', 'Made it!'], ['A jog. For health.', "I'm not out of breath."], ['Phew. Never again. Until tomorrow.', 'Sport hurts.']]);
  // ---- портал ----
  P('portal.out.pout', [['Вжух!', 'Абра-кадабра!', 'Пуф!', 'Хоп!', 'Крибле-крабле!'], ['Исчезаю. Не скучайте.', 'Телепортация. Полётом.'], ['Ушёл по-английски.', 'Меня здесь нет. Совсем.']],
    [['Whoosh!', 'Abracadabra!', 'Poof!', 'Hop!'], ["Vanishing. Don't miss me.", 'Teleporting. In style.'], ['Left without saying goodbye.', "I'm not here. At all."]]);
  P('portal.out.pdive', [['Бульк!', 'Нырк!', 'Ныряю!', 'Плюх!'], ['Ныряю. Глубоко.', 'Тут холодно.'], ['Ныряю от ответственности.', 'Прощайте, и спасибо за рыбу.']],
    [['Splash!', 'Diving in!', 'Plop!'], ['Diving. Deep.', "It's cold in here."], ['Diving away from responsibility.', 'Goodbye, and thanks for the fish.']]);
  P('portal.in', [['Тадам!', 'Ку-ку!', 'Сюрприз!', 'Вот и я!', 'Я тут!'], ['Скучали? Нет? Ладно.', 'Я вернулся. Вы не ждали.'], ['Вернулся. Не радуйтесь.', 'Это был сюрприз. Не слишком приятный.']],
    [['Ta-da!', 'Peekaboo!', 'Surprise!', "Here I am!"], ['Missed me? No? Fine.', "I'm back. You didn't expect me."], ["I'm back. Don't cheer.", 'That was a surprise. Not a nice one.']]);
  P('portal.home', [['Я дома!'], ['Дом. Миска. Жизнь.'], ['Наконец-то дома. Это было утомительно.']], [["I'm home!"], ['Home. Bowl. Life.'], ['Finally home. That was exhausting.']]);
  P('portal.fall', [['Аааа!', 'Лечу-у-у!', 'Ой-ой-ой!', 'Держите меня!'], ['Я так и планировал!', 'Ничего страшного, я кот.'], ['Падаю. На лапы. Всегда.', 'Лечу. Не вопрос.']],
    [['Aaaah!', 'Flyiiing!', 'Oh no no no!', 'Catch me!'], ['I planned this!', "No big deal, I'm a cat."], ['Falling. On my feet. Always.', 'Flying. No problem.']]);
  P('portal.wave', [['Привет!', 'Мяу!', 'Как дела?', 'Хей!'], ['Привет. Я тут проездом.', 'Как дела? Не отвечайте.'], ['Помахал. Хватит с вас.', 'Привет, человек.']],
    [['Hi!', 'Meow!', 'How are you?', 'Hey!'], ["Hi. I'm just passing through.", "How are you? Don't answer."], ["Waved. That's enough.", 'Hello, human.']]);
  // ---- система ----
  P('sys.trash', [['В корзине {size} ({n}). Может, вынести?', 'Корзина набралась: {size}. Пора выносить?'], ['Корзина: {size}. Дом — не склад.', '{size} мусора. Вы коллекционер?'], ['В корзине {size}. Мусор сам себя не вынесет, а я не умею.', '{size} в корзине. Наконец-то я не самый ненужный в этом доме.']],
    [['{size} in the trash ({n}). Maybe take it out?', 'The trash is full: {size}. Time to empty it?'], ['Trash: {size}. A home is not a warehouse.', '{size} of garbage. Are you a collector?'], ["{size} in the trash. Garbage won't empty itself, and I can't.", "{size} in the trash. Finally I'm not the most useless thing here."]]);
  P('sys.trash0', [['В корзине {n} файлов. Пора выносить?', 'Корзина набралась: {n} файлов.'], ['{n} файлов в корзине. Вы точно не нуждаетесь в них?', 'Корзина: {n} файлов. Решать вам.'], ['{n} файлов в корзине. Вынесите, пока она не вынесла вас.', 'В корзине {n} файлов. Не ругайте, я только сообщаю.']],
    [['{n} files in the trash. Time to empty it?', 'The trash is full: {n} files.'], ['{n} files in the trash. Sure you need none of them?', 'Trash: {n} files. Your call.'], ['{n} files in the trash. Empty it before it empties you.', "{n} files in the trash. Don't blame me, I only report."]]);
  P('sys.mem', [['Память занята на {pct}%. Больше всех ест {top}.', 'Компьютеру тесно: {pct}% памяти. Виноват {top}.'], ['{pct}% памяти. {top} решил съесть всё.', 'Память на {pct}%. {top} не спрашивает разрешения.'], ['{pct}% памяти. {top} живёт на широкую ногу за ваш счёт.', 'Память на {pct}%. Хотите закрыть {top} или просто смотреть?']],
    [['Memory is {pct}% used. {top} eats the most.', "The computer is cramped: {pct}% memory. {top} is to blame."], ['{pct}% memory. {top} decided to eat everything.', "Memory at {pct}%. {top} doesn't ask permission."], ['{pct}% memory. {top} lives large at your expense.', 'Memory at {pct}%. Close {top} or just watch?']]);
  P('sys.cpu', [['Процессор загружен на {pct}%. Больше всех трудится {top}.', 'Компьютер греется: {pct}%. Это {top}.'], ['{pct}% процессора. {top} очень старается.', 'Нагрузка {pct}%. {top} явно что-то задумал.'], ['Процессор на {pct}%. {top} работает, а вы нет.', '{pct}% — {top} превращает ваш мак в обогреватель.']],
    [['CPU is {pct}% busy. {top} works the hardest.', 'The computer is heating up: {pct}%. It is {top}.'], ['{pct}% CPU. {top} is trying very hard.', 'Load {pct}%. {top} is up to something.'], ['CPU at {pct}%. {top} is working, you are not.', '{pct}% — {top} turns your Mac into a heater.']]);
  P('sys.disk', [['На диске осталось {gb} ГБ. Может, прибраться?', 'Место заканчивается: свободно {gb} ГБ.'], ['Свободно {gb} ГБ. Скоро фото из отпуска не влезут.', '{gb} ГБ свободно. Это почти ничего.'], ['{gb} ГБ свободно. Удалять что-то будем или как обычно?', 'Осталось {gb} ГБ. Файлы размножаются быстрее котов.']],
    [['{gb} GB left on the disk. Maybe tidy up?', 'Running out of space: {gb} GB free.'], ["{gb} GB free. Soon your vacation photos won't fit.", '{gb} GB free. That is almost nothing.'], ['{gb} GB free. Will we delete something or as usual?', 'Only {gb} GB left. Files multiply faster than cats.']]);
  P('sys.battery', [['Заряд {pct}%. Пора искать зарядку!', 'Батарея на {pct}%. Подключите зарядку.'], ['{pct}% заряда. Нет, это не шутка.', 'Батарея: {pct}%. Зарядка где-то рядом.'], ['{pct}%. Я бы пожалел батарею, но вы не жалеете.', '{pct}% — ну давайте посмотрим, кто кого переживёт.']],
    [['Charge {pct}%. Time to find the charger!', 'Battery at {pct}%. Plug in the charger.'], ["{pct}% charge. No, it's not a joke.", 'Battery: {pct}%. The charger is nearby.'], ["{pct}%. I'd pity the battery, but you don't.", "{pct}% — let's see who outlasts whom."]]);
  P('sys.uptime', [['Мак не перезагружали {n} дн. Может, пора?', '{n} дней без перезагрузки. Отдохнём?'], ['{n} дней без перезагрузки. Героизм или лень?', 'Аптайм {n} дн. Рекорд? Нет.'], ['{n} дней без перезагрузки. Компьютер вас терпит.', 'Перезагрузка — не смертельно. {n} дней, подумайте.']],
    [["The Mac hasn't been restarted for {n} days. Time to?", '{n} days without a restart. Shall we rest?'], ['{n} days without a restart. Heroism or laziness?', 'Uptime {n} days. A record? No.'], ['{n} days without a restart. The computer tolerates you.', 'A restart is not fatal. {n} days, think about it.']]);
  P('sys.brk', [['Вы работаете уже {n} мин. Пора размяться!', '{n} минут без перерыва. Выпейте воды!'], ['{n} минут за компьютером. Спина передаёт привет.', 'Перерыв? {n} минут — это уже подвиг.'], ['{n} минут без перерыва. Умирать на работе — не KPI.', '{n} минут. Я кот, и то встаю чаще.']],
    [["You've been working for {n} min. Time to stretch!", '{n} minutes without a break. Drink some water!'], ['{n} minutes at the computer. Your back says hi.', 'A break? {n} minutes is already an achievement.'], ['{n} minutes without a break. Dying at work is not a KPI.', "{n} minutes. I'm a cat and I get up more often."]]);
  P('sys.ok', [['Всё хорошо, дышится легко!', 'Компьютер в отличной форме.'], ['Всё в норме. Подозрительно.', 'Ничего не горит. Пока.'], ['Всё нормально. Не привыкайте.', 'Нечего сказать. Редкость.']],
    [['All is well, easy to breathe!', 'The computer is in great shape.'], ['All normal. Suspicious.', 'Nothing is on fire. Yet.'], ["All fine. Don't get used to it.", 'Nothing to say. A rarity.']]);
  const UI = {
    ru: { open: 'нажмите, чтобы открыть', close: 'нажмите, чтобы закрыть', free: 'свободно', joke: 'Анекдот', nextJoke: 'нажмите: ещё один', nextPic: 'нажмите: ещё одна', sys: 'Система', trash: 'Корзина', mem: 'Память', cpu: 'Процессор', disk: 'Диск', battery: 'Батарея', uptime: 'Работает', brk: 'Перерыв', mb: 'МБ', gb: 'ГБ', files: 'файлов', f1: 'файл', f2: 'файла', f5: 'файлов', cat: 'Котомаг' },
    en: { open: 'click to open', close: 'click to close', free: 'free', joke: 'Joke', nextJoke: 'click: another one', nextPic: 'click: another one', sys: 'System', trash: 'Trash', mem: 'Memory', cpu: 'CPU', disk: 'Disk', battery: 'Battery', uptime: 'Uptime', brk: 'Break', mb: 'MB', gb: 'GB', files: 'files', f1: 'file', f2: 'files', f5: 'files', cat: 'Kotomag' },
  };
  let lang = 'ru', lvl = 1;
  const RECENT = {};   // последние фразы по ключу: не повторяемся подряд
  const TONES = [[1, 0, 0], [0.55, 0.45, 0], [0.2, 0.45, 0.35], [0, 0.3, 0.7]];
  const rnd = (a) => a[(Math.random() * a.length) | 0];
  function T(key, params) {
    const e = K[key]; if (!e) return key;
    const bank = e[lang] || e.ru, w = TONES[Math.max(0, Math.min(3, lvl))];
    let r = Math.random(), tone = 0;
    for (let i = 0; i < 3; i++) { if (r < w[i]) { tone = i; break; } r -= w[i]; tone = i; }
    let list = bank[tone]; if (!list || !list.length) list = bank.find((x) => x && x.length) || [key];
    const rec = (RECENT[key] = RECENT[key] || []);
    let fresh = list.filter((x) => !rec.includes(x)); if (!fresh.length) fresh = list.filter((x) => x !== rec[rec.length - 1]); if (!fresh.length) fresh = list;
    let s = rnd(fresh); rec.push(s); if (rec.length > 4) rec.shift();
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
    return s;
  }
  const plural = (n) => { const a = Math.abs(n) % 100, b = a % 10; if (lang === 'en') return n === 1 ? 'f1' : 'f5'; return a > 10 && a < 20 ? 'f5' : b === 1 ? 'f1' : b >= 2 && b <= 4 ? 'f2' : 'f5'; };
  // дополнение банка: add(ключ, {ru:[сладкие, ироничные, саркастичные], en:[...]}); массивы тонов добавляются к существующим
  function add(key, ru, en) {
    const e = (K[key] = K[key] || { ru: [[], [], []], en: [[], [], []] });
    [['ru', ru], ['en', en]].forEach(([l, a]) => { if (!a) return; for (let i = 0; i < 3; i++) if (a[i]) e[l][i] = (e[l][i] || []).concat(a[i]); });
  }
  window.PH = {
    add,
    set(l, s) { lang = l === 'en' ? 'en' : 'ru'; lvl = s | 0; },
    T, has: (k) => !!K[k], ui: (k) => (UI[lang] || UI.ru)[k] || k, lang: () => lang,
    fileWord: (n) => `${n} ${UI[lang][plural(n)]}`,
    size(mb) { return mb >= 1024 ? `${(mb / 1024).toFixed(1).replace('.', lang === 'ru' ? ',' : '.')} ${UI[lang].gb}` : `${Math.round(mb)} ${UI[lang].mb}`; },
  };
})();
