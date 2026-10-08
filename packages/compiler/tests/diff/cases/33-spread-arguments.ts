// Spread arguments into untyped calls, rest parameters and concat; `arguments` and Array.apply.

const join3: any = (a: any, b: any, c: any) => `${a}|${b}|${c}`;
const parts = [1, 2, 3];
console.log(join3(...parts), join3(0, ...[5, 6]), join3(...['x'], 'y'));
const absent: any = undefined;
console.log(absent?.(...parts), join3?.(...parts.slice(1)));

const target: any = {
  add(...xs: number[]) {
    return `${xs.length}:${xs.reduce((s, x) => s + x, 0)}`;
  },
};
console.log(target.add(...parts), target.add(...parts, 10));
const missing: any = null;
console.log(missing?.add(...parts));

function total(label: string, ...xs: number[]): string {
  return `${label}:${xs.length}:${xs.reduce((s, x) => s + x, 0)}`;
}
const more = [4, 5];
console.log(total('a', ...parts), total('b', ...parts, ...more), total('c', 9, ...more));

const list: any[] = ['a', 'b'];
const extra: any[] = [['c', 'd'], 'e'];
console.log(JSON.stringify(list.concat(...extra)), JSON.stringify(list.concat(...[], 'z')));

const read = (args: any[]) => {
  const parsed: any[] = [];
  for (const a of args) parsed.push(...(Array.isArray(a) ? a : [a]));
  return join3(...parsed);
};
console.log(read([[1, 2], 3]));

function count(...given: any[]): number;
function count(_first?: any): number {
  return arguments.length;
}
console.log(count(), count(1), count(1, 2, 3));

function describe(first?: any, second?: string, third?: any[]): string;
function describe(first?: any, second = 'two'): string {
  return `${arguments.length}:${first}:${second}:${JSON.stringify(arguments[2])}`;
}
console.log(describe(), describe('one'), describe('one', undefined, [3]));

class Bag {
  items: any[];
  constructor(items: any[]);
  constructor(...items: any[]);
  constructor(_args?: any) {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      this.items = arguments[0].slice();
    } else {
      this.items = Array.apply(null, arguments as any) as any[];
    }
  }
}
const fromArray = new Bag([1, 2]);
const fromItems = new Bag('a', 'b', 'c');
const empty = new Bag();
const one = new Bag('solo');
const sized = new Bag(3);
console.log(JSON.stringify(fromArray.items), JSON.stringify(fromItems.items), empty.items.length, JSON.stringify(one.items), sized.items.length);

const [m1, m2, m3, m4] = [...parts];
console.log(m1 + m2 + m3, m4 || 0);

class Slot {
  constructor(public value: number) {}
}
const pool = [new Slot(1), new Slot(2), new Slot(3), new Slot(4), new Slot(5)] as const;
let nextSlot = 0;
const picked: number[] = [];
for (let k = 0; k < 7; k++) picked.push(pool[nextSlot++ % 5].value);
console.log(picked.join(','));
