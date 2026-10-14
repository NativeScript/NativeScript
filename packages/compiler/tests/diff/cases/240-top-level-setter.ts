// @lenient-kotlin
// A setter and a field written on a module-level const instance; a class named by one letter; ??=, ||= and &&= on a private accessor.
class Settings {
  private _theme = 'light';
  count = 0;
  get theme() {
    return this._theme;
  }
  set theme(value: string) {
    this._theme = value.toLowerCase();
  }
}
const settings = new Settings();
settings.theme = 'DARK';
settings.count += 2;
function bump() {
  settings.count++;
  settings.theme = 'Sepia';
}
bump();
console.log(settings.theme, settings.count);

class Flag {
  #calledWith;
  get #on() {
    return true;
  }
  set #on(value) {
    this.#calledWith = value;
  }
  turnOff() {
    return (this.#on &&= false);
  }
  calledWith() {
    return this.#calledWith;
  }
}
const flag = new Flag();
console.log(flag.turnOff(), flag.calledWith());

class C {
  #seen: string[] = [];
  get #name(): string | undefined {
    return undefined;
  }
  set #name(value) {
    this.#seen.push(`${value}`);
  }
  fill() {
    return [this.#name ??= 'first', this.#name ||= 'second'];
  }
  seen() {
    return this.#seen.join(',');
  }
}
const c = new C();
console.log(c.fill().join('|'), c.seen());
