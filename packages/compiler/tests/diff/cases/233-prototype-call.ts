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
