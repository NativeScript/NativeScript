// Enums, generics, optional chaining, narrowing, interfaces with callbacks.
enum Level { Low = 1, Mid, High = 10 }
enum Mode { Light = 'light', Dark = 'dark' }

interface Task {
  title: string;
  level: Level;
  owner?: { name: string; email?: string };
  done: boolean;
  onDone?: (t: Task) => void;
}

function first<T>(items: T[], test: (item: T) => boolean): T | undefined {
  for (const item of items) if (test(item)) return item;
  return undefined;
}

function pairs<K, V>(keys: K[], values: V[]): Map<K, V> {
  const m = new Map<K, V>();
  keys.forEach((k, i) => m.set(k, values[i]));
  return m;
}

const tasks: Task[] = [
  { title: 'write', level: Level.Mid, done: false, owner: { name: 'Ana' } },
  { title: 'test', level: Level.High, done: true, owner: { name: 'Bo', email: 'bo@x.dev' } },
  { title: 'ship', level: Level.Low, done: false },
];

console.log(Level.Low, Level.Mid, Level.High, Mode.Dark, Level.High > Level.Mid);
console.log(first(tasks, (t) => t.done)?.title, first(tasks, (t) => t.level > 50)?.title ?? 'none');
for (const t of tasks) console.log(t.title, t.owner?.name ?? '-', t.owner?.email?.length ?? 0, t.owner?.email ?? 'no email');

let finished = 0;
tasks[0].onDone = (t) => { finished++; console.log('done:', t.title); };
for (const t of tasks) {
  t.done = true;
  t.onDone?.(t);
}
console.log(finished);

function describe(value: string | number | boolean | null): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `string(${value.length})`;
  if (typeof value === 'number') return value.toFixed(1);
  return value ? 'yes' : 'no';
}
console.log([describe('hey'), describe(2.25), describe(false), describe(null)].join(' '));

const lookup = pairs(['a', 'b', 'c'], [1, 2, 3]);
console.log([...lookup.entries()].map(([k, v]) => k + v).join());

function label(mode: Mode): string {
  switch (mode) {
    case Mode.Light: return 'sun';
    case Mode.Dark: return 'moon';
  }
}
console.log(label(Mode.Light), label(Mode.Dark));

const grid: number[][] = [[1, 2], [3, 4, 5]];
let sum = 0;
for (const row of grid) for (const cell of row) sum += cell;
console.log(sum, grid.map((r) => r.length), grid[1][2]);
const word = 'abc';
const chars: string[] = [];
for (let i = word.length - 1; i >= 0; i--) chars.push(word[i]);
console.log(chars.join(''));

// A type parameter narrowed by typeof is the primitive.
function measure<T>(v: T): string {
  if (typeof v === 'string') return `${v.toUpperCase()}:${v.length}`;
  if (typeof v === 'number') return (v * 2).toFixed(1);
  return 'other';
}
console.log(measure('ab'), measure(2.5), measure(true));
