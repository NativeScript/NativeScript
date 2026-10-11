// @swift
// Untyped values where code declares a type (JSON, `any`): JavaScript keeps going or
// throws a catchable error, never ends the program. What a typed slot cannot hold may fail differently in either,
// so the lines print what both agree on.
class Item {
  constructor(public name: string) {}
  hello() { return 'hi ' + this.name; }
}
class Box {
  n = 1;
  item!: Item;
}
interface Config {
  name: string;
  retries: number;
  tags: string[];
}
type Kind = 'a' | 'b';

function attempt(name: string, run: () => unknown) {
  try {
    run();
  } catch (e) {
    // A TypeError where JavaScript went on is the typed slot refusing: both carry on.
  }
  console.log(name, 'done');
}

// JSON read as an interface with fields missing or of another type.
const c: Config = JSON.parse('{"name": "app"}');
console.log('config', c.name, c.retries || 3, (c.tags || []).length);

// An untyped value stored in a typed field, directly and by name.
const b = new Box();
const v: any = 'red';
attempt('field', () => { b.n = v; });
const loose: any = b;
attempt('by name', () => { loose.n = 'five'; });

// A definitely-assigned field read before it is assigned.
try {
  console.log(b.item.name);
} catch (e) {
  console.log('unassigned', (e as Error).name);
}

// A typed function called untyped with wrong arguments, and a generic cast.
function label(item: Item, count: number): string {
  return item.name + ':' + count;
}
const f: any = label;
attempt('wrong args', () => f({ name: 'plain' }, 'three'));
function fromCache<T>(raw: any): T { return raw as T; }
attempt('generic', () => fromCache<Item>({ name: 'x' }).hello());

// An exhaustive switch given a value outside its union.
function weight(k: Kind): number {
  switch (k) {
    case 'a': return 1;
    case 'b': return 2;
  }
}
console.log('weight', weight(JSON.parse('"c"')) || 0);

// A base-typed value asserted to the wrong subclass.
class Push extends Item { tap = true; }
function onTap(source: Item) {
  const p = source as Push;
  return p instanceof Push;
}
attempt('downcast', () => onTap(new Item('label')));
console.log('end');
