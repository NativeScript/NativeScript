// A method an instance replaces, reached every way app code reaches it: from the class's own methods, through a
// subclass's override, untyped, with `?.`, with spread arguments, and on
// other instances of the class, which keep its method.
class Counter {
  count = 0;
  step(by: number): void {
    this.count += by;
  }
  bump(): number {
    this.step(1);
    return this.count;
  }
  label(prefix: string, ...rest: string[]): string {
    return prefix + ':' + rest.join('+');
  }
}

class Doubling extends Counter {
  override step(by: number): void {
    super.step(by * 2);
  }
}

const c = new Counter();
console.log(c.bump(), c.bump());
c.step = function (this: Counter, by: number) {
  this.count -= by;
};
console.log(c.bump(), c.count);

const d = new Doubling();
console.log(d.bump());
d.step = (by: number) => {
  d.count += by * 10;
};
console.log(d.bump(), new Doubling().bump());

const u: any = c;
u.step(5);
console.log(c.count, typeof u.step, Object.keys(c).sort().join(','));

const parts = ['a', 'b'];
console.log(c.label('x', ...parts));
c.label = (prefix: string, ...rest: string[]) => rest.length + prefix;
const fresh = new Counter();
console.log(c.label('y', ...parts), fresh.label('z', ...parts));

const maybe: Counter | undefined = Math.random() < 2 ? c : undefined;
maybe?.step(1);
console.log(c.count);
