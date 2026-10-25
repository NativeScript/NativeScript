// @assign-fields
// Class keys in assign mode as the constructor and later code make them: a field without an initializer is no key until
// written, whatever its type, and keys run in the order writes made them, also where the constructor's order can't be
// known before it runs.
const show = (tag: string, o: object) => {
  const forIn: string[] = [];
  for (const k in o) forIn.push(k);
  console.log(tag, Object.keys(o).join(','), forIn.join(','), JSON.stringify(o), Object.keys({ ...o }).join(','), Object.entries(o).length);
};

class Lazy {
  x!: number;
  items!: string[];
  label: string;
  constructor(label: string) {
    this.label = label;
  }
  fill() {
    this.items = ['a'];
    this.x = 1;
  }
}
const l = new Lazy('l');
show('lazy', l);
console.log('in', 'x' in l, 'items' in l, l.hasOwnProperty('x'));
l.fill();
show('filled', l);

class Escapes {
  a?: number;
  b?: number;
  c?: number;
  constructor(early: boolean) {
    this.a = 1;
    this.setup(early);
    this.b = 2;
  }
  setup(early: boolean) {
    if (early) this.c = 3;
  }
}
show('escapes', new Escapes(true));
show('escapes late', new Escapes(false));

class Branches {
  a?: string;
  b?: string;
  constructor(flip: boolean) {
    if (flip) {
      this.b = 'b';
      this.a = 'a';
    } else {
      this.a = 'a';
      this.b = 'b';
    }
  }
}
show('flip', new Branches(true));
show('flop', new Branches(false));

class Loops {
  n?: number;
  m?: number;
  list: number[] = [];
  constructor(k: number) {
    for (let i = 0; i < k; i++) this.list.push(i);
    if (k > 1) this.m = k;
    this.n ??= 7;
    [1].forEach(() => (this.m = 9));
  }
}
show('loops', new Loops(2));
show('loops one', new Loops(0));

class Duo {
  y!: number;
  x!: number;
}
const p = Object.assign(new Duo(), { x: 1, y: 2 });
show('assign', p);
const q = new Duo();
q.y = 1;
q.x = 2;
show('typed', q);

class Opt {
  first?: string;
  second?: string;
  third = 3;
}
const o = new Opt();
o.second = 's';
show('opt', o);
delete o.second;
o.first = 'f';
show('deleted', o);
o.second = undefined;
show('back', o);

class Filled {
  list: number[] = [];
  onTap = () => {
    this.late = 'tap';
  };
  late?: string;
  first!: number;
  second!: number;
  constructor(n: number, hook: (f: () => void) => void) {
    for (let i = 0; i < n; i++) this.list.push(i);
    this.second = n;
    hook(this.onTap);
    this.first = n;
  }
}
show('filled', new Filled(2, (f) => f()));
show('filled later', new Filled(1, () => {}));
