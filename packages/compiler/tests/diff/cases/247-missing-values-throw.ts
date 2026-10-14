// What JavaScript throws for a missing value: a module const read before its declaration runs, and members of
// undefined or null read, set and called, each caught as the TypeError or ReferenceError V8 words it as.
class Settings {
  name = 'app';
  greet(): string {
    return 'hi ' + this.name;
  }
}
function early(): string {
  return settings.name;
}
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
attempt('early', early);
const settings = new Settings();
attempt('late', early);
const pick = (i: number): Settings | undefined => (i > 0 ? settings : undefined);
const none = (): Settings | null => null;
attempt('read', () => pick(0)!.name);
attempt('null', () => none()!.name);
attempt('call', () => pick(0)!.greet());
attempt('set', () => { pick(0)!.name = 'x'; return 'set'; });
const list: (Settings | undefined)[] = [settings, undefined];
attempt('index', () => list[1]!.name);
const handlers: { done?: () => string } = {};
attempt('fn', () => handlers.done!());
attempt('ok', () => pick(1)!.greet());
