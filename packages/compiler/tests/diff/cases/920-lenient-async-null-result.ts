// @app-lenient
// A non-strict app's async function whose body gives null, or nothing, where its promise's type says a value.
class Item {
  constructor(public name: string) {}
}
async function lookup(name: string): Promise<Item> {
  await Promise.resolve();
  if (name === '') return null;
  return new Item(name);
}
async function skip(name: string): Promise<Item> {
  if (name === 'skip') return;
  return new Item(name);
}
async function count(n: number): Promise<number> {
  if (n < 0) return null;
  return n * 2;
}
async function label(n: number): Promise<string> {
  if (n === 0) return;
  return `n${n}`;
}
async function flag(on: boolean) {
  if (!on) return null;
  return true;
}
class Store {
  cache: Item = null;
  async get(key: string): Promise<Item> {
    await Promise.resolve();
    if (key === 'gone') return null;
    return new Item(key);
  }
  async latest(key: string): Promise<Item> {
    if (key === '') return null;
    return this.get(key);
  }
}
const show = (v: unknown) => (v === null ? 'null' : v === undefined ? 'undefined' : v instanceof Item ? `Item ${v.name}` : String(v));
async function main() {
  console.log(show(await lookup('')), show(await lookup('a')));
  console.log(show(await skip('skip')), show(await skip('b')));
  console.log(show(await count(-1)), show(await count(4)), show(await label(0)), show(await label(3)));
  console.log(show(await flag(false)), show(await flag(true)));
  const s = new Store();
  console.log(show(await s.get('gone')), show(await s.get('c')), show(await s.latest('')), show(await s.latest('d')));
  const found = await s.get('gone');
  console.log(found == null, !found, found ? found.name : 'none');
  const named = await lookup('e');
  console.log(named.name, (await lookup('f')).name, `${(await count(3)) + 1}`);
  if (!(await lookup(''))) console.log('missing');
  s.cache = await s.get('gone');
  console.log('cache', show(s.cache), s.cache === null);
  s.cache = await s.get('g');
  console.log('cache', show(s.cache));
  lookup('');
  try {
    console.log((await lookup('')).name);
  } catch (e) {
    console.log('threw', e instanceof TypeError);
  }
  const n = await count(-1);
  console.log(n, n === null, show(n), n + 1, `${n}`, String(n));
  const l = await label(0);
  console.log(l, `${l}`, typeof l, `${await count(-1)}`, String(await label(0)));
  const f = await s.get('gone');
  console.log(show(f), f === null);
  console.log((await label(2)).length, (await label(2)).toUpperCase(), (await label(3))[1]);
  try {
    console.log((await label(0)).toUpperCase());
  } catch (e) {
    console.log('threw', e instanceof TypeError);
  }
}
main();
