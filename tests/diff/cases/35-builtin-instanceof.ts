// instanceof with the library's classes, on values of any type.
const values: unknown[] = [Promise.resolve(1), Promise.resolve('a'), [1, 2], ['x'], new Map([[1, 'a']]), new Set(['s']), new Date(0), {}, 'text', 3, null];
for (const v of values) {
  console.log(v instanceof Promise, v instanceof Array, v instanceof Map, v instanceof Set, v instanceof Date);
}
const pending: unknown = new Promise<number>((resolve) => resolve(5));
if (pending instanceof Promise) console.log('a promise of a number is a Promise');
