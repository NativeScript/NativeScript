// `JSON.parse(text, reviver)`: the reviver runs on every value, innermost first and the root last under the key '';
// what it returns replaces the value, undefined deletes the key, and what it throws propagates.
const seen: string[] = [];
const doubled = JSON.parse('{"a":1,"b":{"c":2,"d":[3,4]},"drop":5}', (key: string, value: any) => {
  seen.push(key === '' ? '(root)' : key);
  if (key === 'drop') return undefined;
  return typeof value === 'number' ? value * 2 : value;
});
console.log(JSON.stringify(doubled), seen.join(','), 'drop' in doubled);
const dated = JSON.parse('{"when":"2024-05-06T00:00:00.000Z","n":1}', (k: string, v: any) => (k === 'when' ? new Date(v) : v));
console.log(dated.when instanceof Date, (dated.when as Date).getTime(), dated.n);
console.log(JSON.parse('7', (k: string, v: any) => (k === '' ? v + 1 : v)), JSON.parse('[1,2]', (k: string, v: any) => (k === '0' ? 'first' : v)));
try {
  console.log(JSON.parse('{"a":1}', (k: string, v: any) => { if (k === 'a') throw new SyntaxError('rev'); return v; }));
} catch (e) {
  console.log('caught', (e as Error).name, (e as Error).message);
}
