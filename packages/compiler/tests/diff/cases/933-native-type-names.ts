// App types named like Swift's and Kotlin's own types and the runtime's (Int, Bool, Dictionary, Any, Character, …):
// each is its own type beside the native one.
class Int { constructor(public value: number) {} plus(o: Int) { return new Int(this.value + o.value); } }
class Double { half(n: number) { return n / 2; } }
class Bool { flag = false; }
class Character { constructor(readonly name: string) {} }
class Dictionary<V> {
  private items: Record<string, V> = {};
  set(k: string, v: V) { this.items[k] = v; return this; }
  get(k: string): V | undefined { return this.items[k]; }
  get size() { return Object.keys(this.items).length; }
}
class Any { kind = 'any'; }
class AnyObject { kind = 'object'; }
class Never {}
class Range { constructor(public from: number, public to: number) {} get length() { return this.to - this.from; } }
interface Hashable { hash(): number }
interface Equatable { same(o: unknown): boolean }
class Point implements Hashable, Equatable {
  constructor(public x: number, public y: number) {}
  hash() { return this.x * 31 + this.y; }
  same(o: unknown) { return o instanceof Point && o.x === this.x && o.y === this.y; }
}
class Thread { name = 'main'; }
class Task { done = false; }
class Bundle { id = 'b'; }
class NSObject { tag = 1; }
class Decimal { constructor(public digits: string) {} }
class Float { v = 1.5; }
class Long { v = 2; }
class Char { c = 'c'; }
class Nothing {}
class Comparable { compare(a: number, b: number) { return a - b; } }
class Iterator { i = 0; }
class Collection { items: number[] = [1]; }
class StringBuilder { parts: string[] = []; add(s: string) { this.parts.push(s); return this; } toString() { return this.parts.join(''); } }
class Exception { message = 'ex'; }
class System { static now() { return 3; } }
class Process { pid = 4; }
class Runnable { run() { return 'ran'; } }
enum Void { A }
enum Sequence { First = 'first' }

const a = new Int(2).plus(new Int(3));
console.log(a.value, JSON.stringify(a), a instanceof Int, a.constructor.name, new Double().half(5), JSON.stringify(new Bool()));
console.log(new Character('c').name, new Dictionary<number>().set('a', 1).set('b', 2).size, new Dictionary<string>().set('x', 'y').get('x'));
console.log(JSON.stringify([new Any(), new AnyObject(), new Never()]), new Range(2, 7).length, JSON.stringify(new Range(1, 2)));
const pts: Hashable[] = [new Point(1, 2)];
const eq: Equatable = new Point(1, 2);
const cmp = new Comparable();
console.log(pts[0].hash(), eq.same(new Point(1, 2)), eq.same(null), [1, 3, 2].sort((x, y) => cmp.compare(x, y)).join());
console.log(JSON.stringify([new Thread(), new Task(), new Bundle(), new NSObject(), new Decimal('1.0'), new Float(), new Long(), new Char()]));
console.log(JSON.stringify(new Nothing()), new Iterator().i, new Collection().items.length, `${new StringBuilder().add('a').add('b')}`);
console.log(new Exception().message, System.now(), new Process().pid, new Runnable().run(), Void.A, Sequence.First);
const m = new Map<string, number>([['k', 1]]);
const s = new Set([1, 2, 2]);
console.log([...m.entries()].map(([k, v]) => k + v).join(';'), s.size, Object.entries({ p: 1 }).length, [1, 2].map(String).join('|'), Array.from('ab').join(','));
try { throw new Error('boom'); } catch (e) { console.log((e as Error).message); }
