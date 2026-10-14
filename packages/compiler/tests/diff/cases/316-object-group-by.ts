// `Object.groupBy`: a list sectioned by a key, each section an array, in JavaScript's key order.
interface Contact { name: string; city: string; age: number }
const contacts: Contact[] = [
  { name: 'Ana', city: 'Lisbon', age: 34 },
  { name: 'Ben', city: 'Oslo', age: 28 },
  { name: 'Cy', city: 'Lisbon', age: 41 },
  { name: 'Dee', city: 'Rome', age: 19 },
];
const byCity = Object.groupBy(contacts, (c) => c.city);
console.log(Object.keys(byCity).join(','));
for (const [city, people] of Object.entries(byCity)) console.log(city, (people ?? []).map((p) => p.name).join('+'));
console.log(byCity['Oslo']?.length, byCity['Paris'] === undefined);
const byDecade = Object.groupBy(contacts, (c, i) => `${Math.floor(c.age / 10) * 10}s-${i % 2}`);
console.log(JSON.stringify(Object.keys(byDecade)));
const numbered = Object.groupBy([5, 1, 12, 3], (n) => (n > 4 ? 10 : 2));
console.log(JSON.stringify(numbered));
