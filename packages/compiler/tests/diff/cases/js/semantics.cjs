// Untyped JavaScript as npm packages publish it. Each check adds a line; the app prints them.
module.exports = function run() {
  var out = [];
  var log = function () { out.push(Array.prototype.slice.call(arguments).map(String).join(' ')); };

  // this
  var obj = { name: 'obj', get: function () { return this && this.name; } };
  var detached = obj.get;
  log('this', obj.get(), detached.call({ name: 'other' }), detached.apply({ name: 'applied' }, []), detached.bind({ name: 'bound' })());
  (function () { 'use strict'; log('strict this', this === undefined); })();
  log('sloppy this', (function () { return this === globalThis; })());
  var arrowOwner = { name: 'arrow', make: function () { return () => this.name; } };
  log('arrow this', arrowOwner.make()());

  // prototypes
  function Animal(name) { this.name = name; }
  Animal.prototype.speak = function () { return this.name + ' speaks'; };
  Animal.prototype.kind = 'animal';
  function Dog(name) { Animal.call(this, name); }
  Dog.prototype = Object.create(Animal.prototype);
  Dog.prototype.constructor = Dog;
  Dog.prototype.speak = function () { return Animal.prototype.speak.call(this) + ' woof'; };
  var d = new Dog('rex');
  log('proto', d.speak(), d.kind, d instanceof Dog, d instanceof Animal, Object.getPrototypeOf(d) === Dog.prototype, d.hasOwnProperty('kind'), 'kind' in d);
  Object.defineProperty(Animal.prototype, 'loud', { get: function () { return this.name.toUpperCase(); }, configurable: true });
  log('proto getter', d.loud, Object.keys(d).join(','));
  var bare = Object.create(null); bare.x = 1;
  log('null proto', Object.getPrototypeOf(bare) === null, 'toString' in bare, Object.keys(bare).join(','));
  log('constructor', d.constructor === Dog, ({}).constructor === Object, [].constructor === Array, (function () {}).constructor === Function);

  // closures
  function counter() { var n = 0; return { inc: function () { return ++n; }, get: function () { return n; } }; }
  var c1 = counter(), c2 = counter();
  c1.inc(); c1.inc(); c2.inc();
  log('closures', c1.get(), c2.get());
  var vars = [], lets = [];
  for (var i = 0; i < 3; i++) vars.push(function () { return i; });
  for (let j = 0; j < 3; j++) lets.push(function () { return j; });
  log('loop capture', vars.map(function (f) { return f(); }).join(''), lets.map(function (f) { return f(); }).join(''));

  // arguments
  function args() { return arguments.length + ':' + Array.prototype.join.call(arguments, '|'); }
  function rest(a, ...more) { return a + '/' + more.length; }
  function defaults(a, b = a * 2) { return a + b; }
  log('arguments', args(1, 'two', null), args(), rest(1, 2, 3), defaults(1), defaults(1, 1), args.length, rest.length, defaults.length);

  // truthiness and typeof
  var values = [0, -0, NaN, '', ' ', '0', null, undefined, [], {}, function () {}, 1n, 0n, Symbol('s')];
  log('truthy', values.map(function (v) { return v ? 'T' : 'F'; }).join(''));
  log('typeof', values.map(function (v) { return typeof v; }).join(','));
  log('typeof undeclared', typeof notDeclaredAnywhere, typeof globalThis, typeof Math, typeof JSON.parse);
  log('equality', null == undefined, null === undefined, '1' == 1, 0 == '', [] == false, NaN == NaN, [1] == 1);
  log('arithmetic', '3' * '4', '3' + 4, 3 + +'4', 7 / 2, 7 % -3, -7 % 3, 2 ** 10, 1 / 0, -1 / 0, 0.1 + 0.2);
  log('bits', 5 & 3, 5 | 3, 5 ^ 3, ~5, 1 << 31, -16 >> 2, -16 >>> 28);

  // classes
  class Base {
    #secret = 'hidden';
    static count = 0;
    constructor(n) { this.n = n; Base.count++; }
    get double() { return this.n * 2; }
    set double(v) { this.n = v / 2; }
    reveal() { return this.#secret; }
    static make(n) { return new this(n); }
    toString() { return 'Base(' + this.n + ')'; }
  }
  class Derived extends Base {
    constructor(n) { super(n + 1); this.extra = true; }
    get double() { return super.double + 1; }
    reveal() { return 'derived ' + super.reveal(); }
  }
  var b = Derived.make(1);
  log('class', String(b), b.double, b.reveal(), Base.count, b instanceof Base, Derived.name, typeof Derived);
  b.double = 10;
  log('setter', b.n, Object.keys(b).join(','));
  try { Derived(); } catch (e) { log('class call', e instanceof TypeError); }
  class MyError extends Error { constructor(m) { super(m); this.name = 'MyError'; } }
  try { throw new MyError('bad'); } catch (e) { log('error subclass', e instanceof MyError, e instanceof Error, e.message, String(e)); }

  // accessors on literals, destructuring, spread
  var lit = { _v: 1, get v() { return this._v; }, set v(x) { this._v = x * 10; } };
  lit.v = 2;
  var { v, missing = 'dflt', ...others } = lit;
  var [first, , third = 'third', ...tail] = [1, 2, undefined, 4, 5];
  log('literals', v, missing, Object.keys(others).join(','), first, third, tail.join(','), JSON.stringify({ ...lit, extra: 1 }));

  // control flow
  var s = '';
  outer: for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      if (y > x) continue outer;
      if (x === 3) break outer;
      s += x + '' + y + ' ';
    }
  }
  log('labels', s.trim());
  function sw(v) { var r = []; switch (v) { case 1: r.push('one'); case 2: r.push('two'); break; default: r.push('default'); case 3: r.push('three'); } return r.join('+'); }
  log('switch', sw(1), sw(2), sw(3), sw(9));
  function fin() { var r = []; try { r.push('try'); return r; } finally { r.push('finally'); } }
  log('finally', fin().join(','));
  function finLoop() { var r = []; for (var k = 0; k < 3; k++) { try { if (k === 1) continue; if (k === 2) break; r.push(k); } finally { r.push('f' + k); } } return r.join(','); }
  log('finally jumps', finLoop());
  try { null.x; } catch (e) { log('TypeError', e instanceof TypeError, e.constructor === TypeError); }

  // iteration and generators
  var iterable = { from: 1, to: 3, [Symbol.iterator]: function* () { for (var n = this.from; n <= this.to; n++) yield n; } };
  log('generator', Array.from(iterable).join(','), [...iterable].length);
  var m = new Map([['a', 1], ['b', 2]]), st = new Set([1, 1, 2]);
  var pairs = []; for (var [k2, v2] of m) pairs.push(k2 + v2);
  var keys = []; for (var key in { p: 1, q: 2 }) keys.push(key);
  log('collections', pairs.join(','), st.size, keys.join(','), Array.from(m.keys()).join(''));

  // builtins through prototypes
  var arrayLike = { length: 2, 0: 'a', 1: 'b' };
  log('array-like', Array.prototype.map.call(arrayLike, function (ch) { return ch.toUpperCase(); }).join(''), Array.from(arrayLike).join(''));
  log('strings', 'a-b-c'.split('-').reverse().join(''), 'Hello'.replace(/l/g, function (ch) { return ch.toUpperCase(); }), ' x '.trim(), 'abc'.at(-1), String.prototype.toUpperCase.call('q'));
  log('regexp', /(\d+)-(\d+)/.exec('10-20').slice(1).join('+'), /x/i.test('X'), '2024-01-15'.match(/\d+/g).length);
  log('json', JSON.stringify({ a: [1, { b: undefined }], d: new Date(0), f: function () {} }), JSON.parse('{"x":[1,2]}', function (k, v) { return k === 'x' ? v.length : v; }).x);
  log('object', JSON.stringify(Object.entries({ a: 1, b: 2 })), Object.assign({}, { a: 1 }, { b: 2 }).b, Object.freeze({ a: 1 }).a, Object.isFrozen(Object.freeze({})));
  log('numbers', (255).toString(16), (0.5).toFixed(2), parseInt('08', 10), Number('12px'), Number.isInteger(5.0), Math.max(), Math.round(2.5));
  var proxy = new Proxy({ a: 1 }, { get: function (t, p) { return p in t ? t[p] : 'missing:' + String(p); } });
  log('proxy', proxy.a, proxy.b, Reflect.ownKeys({ z: 1, [Symbol.iterator]: 0 }).length, Reflect.has({ q: 1 }, 'q'));

  // async: runs after the app prints these lines
  (async function () {
    var r = await Promise.all([1, Promise.resolve(2), new Promise(function (res) { setTimeout(function () { res(3); }, 1); })]);
    console.log('async', r.join(','));
    try { await Promise.reject(new Error('rejected')); } catch (e) { console.log('async caught', e.message); }
  })();
  Promise.resolve().then(function () { console.log('microtask'); });
  return out;
};
