// A generic interface and functions whose type parameter no parameter names: what the JSON gives, read as each call types it.
interface Cached<T> { at: number; data: T }
interface Item { id: string; created: Date }
const store: Record<string, string> = {};
function save<T>(key: string, data: T) {
  store[key] = JSON.stringify({ at: 7, data });
}
function load<T>(key: string): Cached<T> | null {
  const raw = store[key];
  return raw ? (JSON.parse(raw) as Cached<T>) : null;
}
function initial<T>(key: string, seed: T[], revive: (item: T) => T): T[] {
  const cached = load<T[]>(key);
  return cached?.data?.length ? cached.data.map(revive) : seed;
}
save('items', [{ id: 'a', created: new Date(Date.UTC(2026, 9, 6)) }]);
const items = initial<Item>('items', [], (i) => ({ ...i, created: new Date(i.created) }));
console.log(items.length, items[0].id, items[0].created.toISOString(), load<Item[]>('items')?.at);
console.log(initial<Item>('none', [{ id: 'seed', created: new Date(0) }], (i) => i)[0].id);
