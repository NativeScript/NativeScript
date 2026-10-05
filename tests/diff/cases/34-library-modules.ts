// @lenient
// A core module's top level as it runs in JavaScript: static initializers in
// order with the module's statements, and globals the module declares itself.
declare let __provided: any;
declare let __missing: any;

const registry: any = {
  make(kind: string) {
    console.log('making', kind);
    return kind + ' made';
  },
};
console.log('before Registry');
class Registry {
  static first: string = registry.make('first');
  static count = 2;
  static second: string = registry.make('second');
}
console.log('after Registry', Registry.first, Registry.second, Registry.count);

(globalThis as any).__provided = (x: number) => x * 2;
console.log(__provided(21), typeof __missing, typeof __provided);

class Listing {
  kind(): string {
    return 'listing';
  }
}
class Items<T> extends Listing {
  items: T[] = [];
  slice(start: number): Items<T> {
    const out = new Items<T>();
    out.items = this.items.slice(start);
    return out;
  }
}
interface Items<T> {
  kind(): string;
}
const items = new Items<number>();
items.items.push(1, 2, 3);
const rest = items.slice(1);
console.log(rest.items.length, rest.kind(), rest instanceof Items);

enum Role {
  Button = 'button',
  Header = 'header',
}
enum Level {
  Low,
  High = 10,
}
function converter(values: any) {
  return (value: string): any => {
    for (const [key, v] of Object.entries<string>(values)) {
      if (key === value || `${v}`.toLowerCase() === value.toLowerCase()) return v;
    }
    return null;
  };
}
const toRole = converter(Role);
console.log(toRole('BUTTON'), toRole('Header'), toRole('none'), JSON.stringify(Level), Object.keys(Role).join(','));
const roleName = 'Header';
const levelKey: string = 'High';
console.log(Role[roleName], Level[levelKey], Level[Level.High], Role['Missing' as string]);

class Emitter {
  static scope(): string {
    return this.name === 'Emitter' ? '*' : this.name;
  }
  kind(): string {
    return this.constructor.name;
  }
}
class ButtonEmitter extends Emitter {}
console.log(Emitter.scope(), ButtonEmitter.scope(), new ButtonEmitter().kind(), new Emitter().kind(), Emitter.name);

class Screenish {
  private ready = true;
  get width(): number {
    if (!this.ready) throw new Error('not ready');
    return 320;
  }
  get height(): number {
    return 640;
  }
}
function measure(screen: Screenish): string {
  const { width, height } = screen;
  return `${width}x${height}`;
}
console.log(measure(new Screenish()));

let version = 1;
function bump() {
  return ++version;
}
const helpers = { bump, version };
version = 5;
console.log(helpers.version, helpers.bump(), version);

class Surface {
  constructor(public role: string) {}
}
class Window extends Surface {
  attached = true;
}
class Registry2 {
  private items: Window[] = [new Window('application'), new Window('widget')];
  list(role: 'all'): Surface[];
  list(role?: string): Window[];
  list(role?: string): Surface[] {
    if (role === 'all') return [...this.items];
    return this.items.filter((w) => w.role === (role ?? 'application'));
  }
}
const registry2 = new Registry2();
console.log(registry2.list().find((w) => w.attached)?.role, registry2.list('all').length, registry2.list('widget')[0].attached);

class Base2 {
  kind = 'base';
}
class Plain2 extends Base2 {}
class Strict2 extends Base2 {
  constructor(ok: boolean) {
    super();
    if (!ok) throw new Error('not ok');
  }
}
console.log(new Plain2().kind, new Strict2(true).kind);
try {
  new Strict2(false);
} catch (e) {
  console.log('strict threw', e.message);
}

class Item0 {
  name = 'item';
}
class Button0 extends Item0 {
  name = 'button';
}
function hold(ref: WeakRef<Item0>): string {
  return ref.deref().name;
}
const button0 = new Button0();
console.log(hold(new WeakRef(button0)));
const show = (x: Item0 | null) => console.log(x ? x.name : 'none');
show(null);
show(button0);

interface Indexed {
  _row?: number;
}
class Cell0 {
  label = 'cell';
}
type IndexedCell = Cell0 & Indexed;
function place(cell: IndexedCell, row: number): string {
  const before = cell._row;
  cell._row = row;
  return `${cell.label} ${before} ${cell._row ?? 0}`;
}
console.log(place(new Cell0(), 3));

interface Options1 {
  changed?: (target: Cell0, oldValue: any, newValue: any) => void;
  select?: (item: any, index: number) => string;
}
const bag: any = { key: 'chosen' };
function useOptions(o: Options1): string {
  o.changed(new Cell0(), 1, 2);
  return o.select(bag, 0);
}
console.log(useOptions({ changed: (t) => console.log('changed', t.label), select: (item) => item['key'] }));

function finish(done: (ok: boolean) => void, ok: boolean) {
  done?.(ok);
}
finish((ok) => console.log('finished', ok), true);
class Base7 {
  get(): any {
    return 'base';
  }
}
class Sub7 extends Base7 {
  get(): string {
    return 'sub';
  }
}
const sub7 = new Sub7();
const bound7: any = sub7.get.bind(sub7);
console.log(bound7());
