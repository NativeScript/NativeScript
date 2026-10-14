// Destructuring assignment to existing variables, and a rest element against a tuple.
let a = 1;
let b = 2;
[a, b] = [b, a];
let x = 0;
let label = '';
({ x, label } = { x: 5, label: 'five' });
const pair: [string, number, boolean] = ['p', 3, true];
const [head, ...rest] = pair;
let first = '';
let others: (number | boolean)[] = [];
[first, ...others] = pair;
console.log(a, b, x, label, head, rest.join(','), first, others.length);
function describe({ size = 1, name }: { size?: number; name: string }, [low, high = 10]: number[] = [0]) {
  return `${name}:${size}:${low}:${high}`;
}
console.log(describe({ name: 'n' }), describe({ size: 4, name: 'm' }, [1, 2]), describe({ name: 'o' }, [3]));
