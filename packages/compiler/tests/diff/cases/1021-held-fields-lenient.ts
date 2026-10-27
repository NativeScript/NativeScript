// @app-lenient
// A non-strict app's own fields, getters' results, parameter properties and object-typed variables whose type it tests
// hold an untyped value as it is, as strict code's do: a narrowed read sees the value as that type, an un-narrowed one
// placed in a typed slot is JavaScript's TypeError there unless it is of that type, and a member read on one is the
// value's own.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Point {
  constructor(public x: number, public y: number) {}
  sum() {
    return this.x + this.y;
  }
}

class Reading {
  value: number;
  point: Point;
  constructor(raw: any) {
    this.value = raw.value;
    this.point = raw.point;
  }
  get unit(): string {
    return this.raw.unit;
  }
  raw: any = {};
}

function twice(n: number) {
  return n.toFixed(1) + '/' + (n * 2).toFixed(1);
}
function total(p: Point) {
  return p.sum();
}

function show(r: Reading) {
  const value = typeof r.value === 'number' ? twice(r.value) : `value is ${typeof r.value}`;
  const point = r.point instanceof Point ? `sum ${r.point.sum()}` : `plain`;
  const x = `x ${r.point.x}`;
  const unit = typeof r.unit === 'string' ? r.unit.toLowerCase() : `unit ${r.unit}`;
  return [value, point, x, unit].join(', ');
}

const right = new Reading({ value: 2, point: new Point(1, 2) });
right.raw = { unit: 'KM' };
const wrong = new Reading({ value: '2', point: { x: 5, y: 6 } });
wrong.raw = { unit: 3 };
console.log(show(right));
console.log(show(wrong));
console.log(wrong.value, wrong.point.x + wrong.point.y);
attempt('twice right', () => twice(right.value));
attempt('twice wrong', () => twice(wrong.value));
attempt('total right', () => total(right.point));
attempt('total wrong', () => total(wrong.point));
attempt('sum wrong', () => wrong.point.sum());

class Cell {
  constructor(public content: string) {}
}
for (const c of [new Cell('a'), new Cell(JSON.parse('[1]'))]) console.log(typeof c.content === 'string' ? c.content.repeat(2) : `content ${c.content}`);

interface Labelled {
  label: string;
}
class Tag implements Labelled {
  label: string;
  constructor(raw: any) {
    this.label = raw.label;
  }
}
const labels: Labelled[] = [new Tag({ label: 'x' }), new Tag({ label: 9 })];
for (const l of labels) console.log(typeof l.label === 'string' ? l.label + '!' : l.label * 2);

const loaded = JSON.parse('{"x": 3, "y": 4}') as Point;
console.log(loaded instanceof Point ? loaded.sum() : 'loaded plain', loaded.x);
attempt('total loaded', () => total(loaded));
