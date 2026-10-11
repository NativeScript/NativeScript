// @swift
// `localeCompare(that, locales, options)`: `numeric` orders digit runs by value, `sensitivity` decides which differences count.
const f = ['item10', 'item9', 'Item1'];
console.log('item10'.localeCompare('item9', undefined, { numeric: true }), 'item10'.localeCompare('item9'));
console.log(f.sort((p, q) => p.localeCompare(q, undefined, { numeric: true, sensitivity: 'base' })));
console.log(['a', 'A', 'á'].map((x) => ['base', 'accent', 'case', 'variant'].map((s) => 'a'.localeCompare(x, 'en', { sensitivity: s as any })).join(',')).join(' '));
const options = { numeric: true };
console.log(['v1.10', 'v1.9', 'v1.1'].sort((p, q) => p.localeCompare(q, ['en-US'], options)), 'b'.localeCompare('a', 'en'));
