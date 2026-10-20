// Опрос состояния клавиш без перехвата событий и без особых разрешений macOS:
// kotomag-keys <код_клавиши> <модификаторы: 1=⌘ 2=⌥ 4=⌃ 8=⇧>
// Печатает FIRE при каждом нажатии нужного сочетания, READY при старте. Завершается, когда родитель закрылся.
#include <ApplicationServices/ApplicationServices.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char **argv) {
  if (argc < 3) return 2;
  CGKeyCode key = (CGKeyCode)atoi(argv[1]);
  int want = atoi(argv[2]);
  pid_t parent = getppid();
  int was = 0;
  setvbuf(stdout, NULL, _IOLBF, 0);
  printf("READY\n");
  for (;;) {
    usleep(25000);
    if (getppid() != parent) return 0;
    CGEventFlags f = CGEventSourceFlagsState(kCGEventSourceStateCombinedSessionState);
    int have = ((f & kCGEventFlagMaskCommand) ? 1 : 0) | ((f & kCGEventFlagMaskAlternate) ? 2 : 0) | ((f & kCGEventFlagMaskControl) ? 4 : 0) | ((f & kCGEventFlagMaskShift) ? 8 : 0);
    int down = CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, key) ? 1 : 0;
    if (down && !was && have == want) printf("FIRE\n");
    was = down;
  }
}
