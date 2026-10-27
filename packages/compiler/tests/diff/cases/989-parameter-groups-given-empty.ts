// A parameter given undefined past an array's end where its declared type has none: every member of its group (the
// function type it is given for, the interface member it implements, the method it overrides) takes it.
interface Point { x: number }
const none: Point[] = [];

type Fmt = (p: Point) => string;
const fmts: Fmt[] = [(p) => (p ? `fmt ${p.x}` : 'fmt none')];
console.log(fmts[0]({ x: 1 }), fmts[0](none[0]));

const typed: (p: Point) => string = (p: Point) => (p ? `typed ${p.x}` : 'typed none');
console.log(typed({ x: 2 }), typed(none[1]));

function named(p: Point): string { return p ? `named ${p.x}` : 'named none'; }
const held: Fmt = named;
console.log(held({ x: 3 }), held(none[2]), named({ x: 4 }));

interface Namer { name(p: Point): string }
class Short implements Namer {
  name(p: Point): string { return p ? `short ${p.x}` : 'short none'; }
}
const n: Namer = new Short();
console.log(n.name({ x: 5 }), n.name(none[3]), new Short().name({ x: 6 }));

class Shape { area(p: Point): string { return p ? `shape ${p.x}` : 'shape none'; } }
class Square extends Shape {
  override area(p: Point): string { return p ? `square ${p.x}` : 'square none'; }
}
const shapes: Shape[] = [new Shape(), new Square()];
for (const s of shapes) console.log(s.area({ x: 7 }), s.area(none[4]));

function apply(f: (p: Point, tag: string) => string, tag: string): string { return f(none[5], tag); }
console.log(apply((p, tag) => (p ? `${tag} ${p.x}` : `${tag} none`), 'applied'));

function reads(p: Point): number { return p.x; }
try { console.log(reads(none[6])); } catch (e) { console.log('reads', (e as Error).name); }
function spread(p: Point): number[] { return Array.from({ length: 2 }, (_, k) => p.x + k); }
try { console.log(spread({ x: 8 }).join(), spread(none[7])); } catch (e) { console.log('spread', (e as Error).name); }

function pick(test: (p: Point) => string): string;
function pick(test: (p: Point) => string): string { return `${test({ x: 9 })} ${test(none[8])}`; }
console.log(pick((p) => (p ? `picked ${p.x}` : 'picked none')));
