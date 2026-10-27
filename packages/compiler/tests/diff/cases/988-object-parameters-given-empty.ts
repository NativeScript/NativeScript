// Strict code's object parameters given undefined or null beyond their declared types: through an untyped slot, and
// through an interface or base method that declares the parameter optional where the implementation doesn't.
interface Point { x: number }
function describe(p: Point): string { return p ? `at ${p.x}` : 'nowhere'; }
const loose: any = describe;
console.log(loose({ x: 1 }), loose(), loose(null));

interface Shower { show(p?: Point): string }
class Plain implements Shower {
  show(p: Point): string { return p ? `plain ${p.x}` : 'plain none'; }
}
const s: Shower = new Plain();
console.log(s.show({ x: 2 }), s.show(undefined));

class Base { area(o?: Point): string { return o ? `base ${o.x}` : 'base none'; } }
class Derived extends Base {
  override area(o: Point): string { return o ? `derived ${o.x}` : 'derived none'; }
}
const shapes: Base[] = [new Base(), new Derived()];
for (const b of shapes) console.log(b.area(), b.area({ x: 3 }));

const handlers: any = { pick(p: Point, tag: string) { return p ? `${tag} ${p.x}` : `${tag} none`; } };
console.log(handlers.pick({ x: 5 }, 'pick'), handlers.pick(undefined, 'pick'));
