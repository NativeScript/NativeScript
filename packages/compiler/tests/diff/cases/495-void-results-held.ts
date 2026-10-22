// A void method's or function's result held in a variable, then used as a value: undefined.
const m = new Map<string, number>([['a', 1]]);
const s = new Set<number>([1]);
function same(a: unknown, b: unknown) { return a === b; }
class Box { n = 0; bump(): void { this.n++; } }
function nothing(): void {}
var walked = m.forEach(() => {});
const cleared = s.clear();
const bumped = new Box().bump();
let later = nothing();
const held: unknown[] = [walked, cleared, bumped, later];
console.log(same(walked, undefined), same(cleared, undefined), String(bumped), `${later}`, held.map((v) => v === undefined).join());
console.log(JSON.stringify({ cleared, later }), same(s.clear(), undefined), [m.forEach(() => {})].length);
