// @lenient
// A local typed string, read from an untyped cache and tested against undefined (core's module-name resolver).
const cache: any = {};
function resolve(key: string): string {
  let result: string = cache[key];
  if (result === undefined) {
    result = key.toUpperCase();
    cache[key] = result;
  }
  return result;
}
let count: number = cache.missing;
console.log(resolve('a'), resolve('a'), count == null, typeof count);
