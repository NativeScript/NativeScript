// @app-lenient
// A non-strict app's parameters whose groups are never given null or undefined (held as their types) beside ones
// that are, and entry points: what reaches each prints as Node prints it.
class Card { name: string; constructor(name: string) { this.name = name; } label() { return `<${this.name}>`; } }
type Done = (err: Card) => string;
type Shown = (c: Card) => string;

// Only ever given a card.
function title(c: Card) { return c ? c.label() : 'none'; }
// Given null once, through a function type, and a value an array may not hold.
function describe(c: Card) { return c ? c.label() : 'none'; }
function finish(done: Done) { return [done(new Card('ok')), done(null)].join(' '); }
function each(xs: Card[], show: Shown) { return xs.map((x) => show(x)).join(','); }

interface Renderer { render(c: Card): string; }
class Plain implements Renderer { render(c: Card) { return c.label(); } }
class Guarded implements Renderer { render(c: Card) { return c ? c.label() : 'missing'; } }
interface Painter { paint(c: Card): string; }
class Brush implements Painter { paint(c: Card) { return `~${c.name}~`; } }
class Base { tag(c: Card) { return c.name; } }
class Loud extends Base { tag(c: Card) { return c.name.toUpperCase(); } }

class Box<T> {
  value: T;
  constructor(value: T) { this.value = value; }
  each(f: (x: T) => string) { return f(this.value); }
}

function initial(state: string) { return state ? state.charAt(0) : '-'; }
function maybe(k: number): Card { if (k > 1) return null; return new Card(`m${k}`); }
function keep(c: Card) { return c ? c.name : 'empty'; }

const a = new Card('a'), b = new Card('b');
const cards = [a, b];
console.log(title(a), title(new Card('c')), cards.map((c) => title(c)).join(','));
console.log(finish((e) => describe(e)), describe(cards[5]));
console.log(each(cards, (c) => c.label()), each(cards, title));
const renderers: Renderer[] = [new Plain(), new Guarded()];
console.log(renderers.map((r) => r.render(b)).join(' '), new Guarded().render(cards.find((c) => c.name === 'z')));
const bases: Base[] = [new Base(), new Loud()];
console.log(bases.map((x) => x.tag(a)).join(' '), [new Brush()].map((p: Painter) => p.paint(b)).join(''));
console.log(new Box<Card>(b).each(describe), new Box<Card>(a).each(title));
console.log(initial('xyz'), initial('q'), keep(maybe(1)), keep(maybe(2)), keep(maybe(3)));
const byName = new Map<string, Card>([['a', a]]);
console.log(keep(byName.get('a')), keep(byName.get('nope')));
// Reached through an untyped slot: script may call it with nothing.
const table: any = { show: keep };
console.log(table.show(b), table.show());
cards.forEach((c, i) => console.log(i, title(c)));
