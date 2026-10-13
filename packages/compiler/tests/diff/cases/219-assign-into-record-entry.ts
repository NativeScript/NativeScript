// `(groups[key] ??= []).push(v)`: the entry assigned, or the one already there, is the array pushed to.
const groups: Record<string, number[]> = {};
for (const n of [1, 2, 3, 4, 5]) (groups[n % 2 ? 'odd' : 'even'] ??= []).push(n);
const tags: { [name: string]: string[] } = {};
(tags['a'] ||= []).push('x');
(tags['a'] ||= []).push('y');
console.log(JSON.stringify(groups), JSON.stringify(tags));
