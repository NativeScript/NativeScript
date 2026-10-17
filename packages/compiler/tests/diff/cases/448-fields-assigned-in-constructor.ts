// @lenient-both
// Fields a constructor assigns: one assigned before anything reads it is always there; one a method called from the
// constructor, a callback or `this` handed out reads before it is assigned is undefined there, as in JavaScript.
enum Mode {
  Plain,
  Fancy,
}

const seen: string[] = [];
function inspect(owner: Keys) {
  seen.push(`inspected ${String(owner.late)}`);
}

class Keys {
  key: symbol;
  mode: Mode;
  early: symbol;
  late: symbol;
  later: symbol;
  branch: symbol;
  captured: symbol;
  read: () => string;
  constructor(name: string, fancy: boolean) {
    this.key = Symbol(name);
    this.mode = fancy ? Mode.Fancy : Mode.Plain;
    this.early = Symbol(`${name}:early`);
    this.describe();
    this.late = Symbol(`${name}:late`);
    inspect(this);
    this.later = Symbol(`${name}:later`);
    if (fancy) this.branch = Symbol(`${name}:branch`);
    this.read = () => String(this.captured);
    seen.push(`before capture ${this.read()}`);
    this.captured = Symbol(`${name}:captured`);
  }
  describe() {
    seen.push(`describe ${String(this.key)} ${this.mode} ${String(this.late)}`);
  }
}

for (const fancy of [true, false]) {
  const k = new Keys(fancy ? 'fancy' : 'plain', fancy);
  console.log(String(k.key), k.mode, String(k.early), String(k.late), String(k.later), String(k.branch), k.read());
}
console.log(seen.join('\n'));
