// @lenient-both
// `instanceof Map` / `instanceof Set` on an untyped value holding a typed collection, then iterated as the narrowed type.
function entries(value: any): string[] {
  const out: string[] = [];
  if (value instanceof Map) {
    for (const [k, v] of value) out.push(`${k}=${v}`);
    value.forEach((v: any, k: any) => out.push(`${k}:${v}`));
    out.push(String(value.get('a')), String(value.size));
  } else if (value instanceof Set) {
    for (const v of value) out.push(String(v));
    out.push(String(value.has('x')));
  } else if (Array.isArray(value)) {
    for (const v of value) out.push(String(v));
  }
  return out;
}
console.log(entries(new Map<string, number>([['a', 1], ['b', 2]])).join(' '));
console.log(entries(new Map<number, boolean>([[1, true]])).join(' '));
console.log(entries(new Map([['k', { n: 1 }]])).length);
console.log(entries(new Set<string>(['x', 'y'])).join(' '));
console.log(entries(new Set<number>([3])).join(' '));
console.log(entries(['p', 'q']).join(' '), entries([1, 2]).join(' '));

const m: unknown = new Map<string, string>([['z', 'zz']]);
if (m instanceof Map) console.log(m.get('z'), m.has('y'));
