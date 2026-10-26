// @lenient-both
// An untyped value converted into an optional object shape or array is evaluated once: a call, a constructor, an
// increment or a getter in it runs once, whether the slot is a variable, an argument, a return, a field or an element.
type Point = { x: number; y: number };
let calls = 0;
function point(): any {
  calls++;
  return { x: calls, y: 2 };
}
function none(): any {
  calls++;
  return null;
}
function list(): any {
  calls++;
  return [calls, 10];
}
class Logged {
  x = 7;
  y = 8;
  constructor() {
    calls++;
    console.log('made', calls);
  }
}
const source: any = {
  get p() {
    calls++;
    return { x: 3, y: 4 };
  },
  get a() {
    calls++;
    return [5, 6];
  },
};
const show = (p?: Point) => (p ? `${p.x},${p.y}` : 'none');
const total = (a?: number[]) => (a ? a.reduce((s, n) => s + n, 0) : -1);

const p1: Point | undefined = point();
console.log(show(p1), calls);
const p2: Point | undefined = none();
console.log(show(p2), calls);
console.log(show(point()), show(none()), calls);
const a1: number[] | undefined = list();
console.log(total(a1), calls);
console.log(total(list()), calls);
const made: Point | undefined = new Logged() as any;
console.log(show(made), calls);
console.log(show(new Logged() as any), calls);
console.log(show(source.p), total(source.a), calls);

const items: any[] = [{ x: 1, y: 1 }, null, [1, 2], { x: 2, y: 2 }];
let i = 0;
const q1: Point | undefined = items[i++];
const q2: Point | undefined = items[i++];
console.log(show(q1), show(q2), total(items[i++]), i);

function back(): Point | undefined {
  return point();
}
function backList(): number[] | undefined {
  return list();
}
console.log(show(back()), total(backList()), calls);

class Holder {
  p: Point | undefined;
  a: number[] | undefined;
}
const h = new Holder();
h.p = point();
h.a = list();
console.log(show(h.p), total(h.a), calls);

const points: (Point | undefined)[] = [point(), none(), source.p];
const lists: (number[] | undefined)[] = [list(), source.a];
console.log(points.map(show).join(' '), lists.map(total).join(' '), calls);
const shapes: Point[] | undefined = [point()].map((x) => x) as any;
console.log(shapes ? shapes.map(show).join(' ') : 'none', calls);
