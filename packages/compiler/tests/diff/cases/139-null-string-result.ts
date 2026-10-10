// @swift
// A lookup typed `string | null` (fetch's `Headers.get`): tested against null and undefined, defaulted and printed.
const map: Record<string, string> = { a: '1' };
function get(name: string): string | null {
  return name in map ? map[name] : null;
}
const missing = get('b');
console.log(missing === null, missing == undefined, missing ?? 'default', get('a') === null, String(get('a')));
console.log('value: ' + missing);
