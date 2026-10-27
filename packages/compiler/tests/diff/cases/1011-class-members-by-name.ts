// A class's methods and accessors reached by name: called through a computed key or an untyped receiver with `this` the
// receiver, a getter run and a setter called by name, `in` true for them, and none of them an own key (`Object.keys`,
// `for…in`, JSON).
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Counter {
  count = 0;
  label = 'c';
  private _scale = 1;
  add(n: number) {
    this.count += n * this._scale;
    return this.count;
  }
  reset() {
    this.count = 0;
  }
  describe(prefix: string, suffix?: string) {
    return `${prefix}${this.label}=${this.count}${suffix ?? ''}`;
  }
  get doubled() {
    return this.count * 2;
  }
  get scale() {
    return this._scale;
  }
  set scale(v: number) {
    this._scale = v;
  }
  run(name: string, x: number) {
    return (this as any)[name](x);
  }
}

class Loud extends Counter {
  override describe(prefix: string) {
    return super.describe(prefix).toUpperCase();
  }
  shout() {
    return `${this.label}!`;
  }
}

const c = new Counter();
const names = ['add', 'add'];
for (const n of names) console.log('computed', (c as any)[n](2));
console.log('run', c.run('add', 3));
const k: string = 'describe';
console.log('any receiver', (c as any).describe('<', '>'));
console.log('typed computed', (c as any)[k]('['));
console.log('call', (c as any)['add'].call(c, 1));
console.log('apply', (c as any)[k].apply(c, ['{', '}']));
console.log('getter', (c as any).doubled, (c as any)['doubled']);
(c as any).scale = 10;
console.log('setter', c.scale, (c as any)['scale']);
(c as any)[['sc', 'ale'].join('')] = 2;
console.log('setter computed', c.add(1), c.scale);
(c as any).reset();
console.log('reset', c.count);

console.log('in', 'add' in c, 'doubled' in c, 'scale' in c, 'count' in c, 'missing' in c);
console.log('keys', Object.keys(c).join(','));
const seen: string[] = [];
for (const key in c) seen.push(key);
console.log('for-in', seen.join(','));
console.log('json', JSON.stringify(c));
console.log('typeof', typeof (c as any)['add'], typeof (c as any).doubled, typeof (c as any).missing);
console.log('hasOwnProperty', Object.prototype.hasOwnProperty.call(c, 'add'), c.hasOwnProperty('count'));

const loud: any = new Loud();
console.log('override', loud.describe('x'), loud['shout'](), loud['add'](4), loud.doubled);
const m = 'describe';
const kinds: Counter[] = [new Counter(), new Loud()];
for (const o of kinds) console.log('dispatch', (o as any)[m]('-'));

const anyC: any = c;
const detached = anyC['add'];
console.log('detached', typeof detached);
const bound = anyC['add'].bind(c);
console.log('bound', bound(5));
attempt('missing method', () => anyC['nope'](1));
