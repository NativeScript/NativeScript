// `new Array<T>(x)` of an object: an array holding it, not one of that length.
interface Template { key: string }
const fallback: Template = { key: 'default' };
const list = new Array<Template>(fallback);
console.log(list.length, list[0].key);
let count = 0;
class Counter { n = 0; bump() { this.n++; count++; } }
const c = new Counter();
c.bump(); c.bump();
console.log(c.n, count);
