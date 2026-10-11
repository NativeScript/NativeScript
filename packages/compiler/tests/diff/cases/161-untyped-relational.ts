// @kotlin
// `<`, `>`, `<=`, `>=` with an untyped operand: two strings compare by code units, anything else as numbers.
function lt(p: any, q: any): boolean { return p < q; }
function le(p: any, q: any): boolean { return p <= q; }
function gt(p: any, q: any): boolean { return p > q; }
function ge(p: any, q: any): boolean { return p >= q; }
console.log(lt('a', 'b'), lt('10', '9'), lt('B', 'a'), lt('', 'a'), lt('ab', 'a'));
console.log(lt(10, 9), lt('10', 9), lt(2, '10'), lt('x', 1), lt(1, 'x'), lt(null, 1), lt(undefined, 1), lt(true, 2));
console.log(le('a', 'a'), le(NaN, NaN), le(null, 0), le(undefined, 0), ge('b', 'a'), gt('é', 'z'), gt('😀', '￿'));
console.log(lt([2], [10]), lt([2], 10), gt(new Date(5), new Date(3)));
const l: any[] = ['10', '9', 'b', 'a', 'B'];
console.log(l.sort((p, q) => (p < q ? -1 : p > q ? 1 : 0)).join(','));
const rows: any[] = [{ k: 'pear' }, { k: 'apple' }, { k: 'fig' }];
const key = 'k';
console.log(rows.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0)).map((r) => r.k).join(','));
const s: string = 'm';
const u: unknown = 'n';
console.log(s < (u as any), (u as any) > s, 3 < (u as any));
let n = 0;
for (let i = 0; i < 5; i++) if (i >= 2) n += i;
console.log(n);
