// @app-lenient
// A non-strict function some callers give null and others nothing: its parameter, its result and the locals given them
// keep null apart from undefined.
function pick(key: string, fallback?: string): string { return key === 'a' ? 'A' : fallback; }
function label(value?: string) {
  if (value === null) return 'null';
  if (value === undefined) return 'missing';
  return value.toUpperCase() + value.length;
}
const saved = pick('b', null);
let other = pick('b');
console.log(saved === null, other === undefined, String(saved), `${other}`, saved + '!', typeof saved, typeof other);
console.log(label(null), label(), label('x'), label(pick('a', null)));
other = pick('a');
console.log(other.length, other.toLowerCase(), JSON.stringify({ saved, other }), [saved, other].join('|'), saved ?? 'none');
function firstOr(list: string[], none?: string): string {
  if (list.length) return list[0];
  return none;
}
console.log(firstOr([], null), firstOr([]), firstOr(['q'], null));
class Settings {
  read(key: string, fallback?: number): number { return key === 'size' ? 12 : fallback; }
}
const s = new Settings();
console.log(s.read('size'), s.read('other'), s.read('other', null), s.read('other', 3) + 1);
