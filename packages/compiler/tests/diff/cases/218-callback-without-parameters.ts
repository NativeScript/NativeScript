// An array method's callback that declares no parameters: JavaScript passes the element anyway.
const items = [1, 2, 3];
let count = 0;
items.forEach(() => count++);
items.forEach(() => {
  count += 10;
});
const names = ['a', 'b'];
console.log(count, items.filter(() => true).length, items.map(() => 0), names.map(() => 'x'), items.some(() => false), items.every(() => true));
console.log(items.find(() => true), items.findIndex(() => false), items.flatMap(() => [7]));
