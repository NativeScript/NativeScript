// A method read from a prototype and called on another receiver (`X.prototype.m.call(r, …)`).
const config: { [key: string]: number } = { size: 2 };
const point = { x: 1, y: 2 };
class Counter {
  n = 0;
  add(k: number) {
    this.n += k;
    return this.n;
  }
}
const own = Object.prototype.hasOwnProperty;
console.log(Object.prototype.hasOwnProperty.call(config, 'size'), Object.prototype.hasOwnProperty.call(config, 'missing'));
console.log(own.call(point, 'x'), own.call(point, 'toString'));
const c = new Counter();
console.log(Counter.prototype.add.call(c, 3), Counter.prototype.add.apply(c, [4]), c.n);
console.log(Object.prototype.toString.call([]), Object.prototype.toString.call(point));
const rec: Record<string, number> = JSON.parse('{"a":1}');
console.log(Object.hasOwn(rec, 'a'), Object.hasOwn(rec, 'b'), rec.hasOwnProperty('a'), {}.hasOwnProperty.call(rec, 'a'));
const opts: { [k: string]: number | undefined } = { x: 1, y: undefined };
const listed: string[] = [];
for (const k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) listed.push(k);
console.log(listed.join(','), own.call([1, 2], 0), own.call([1, 2], 'length'), own.call([1, 2], 'push'));
const held: any = new Counter();
held.extra = 3;
console.log(own.call(held, 'extra'), held.hasOwnProperty('extra'), held.hasOwnProperty('n'), held.extra, Object.keys(held).join(','));
