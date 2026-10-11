// @kotlin
// `const list = map[k] || (map[k] = [])`: the array stored in the map, which pushes through `list` reach.
interface Entry {
  n: number;
}
class Registry {
  lists: { [name: string]: Array<Entry> } = {};
  byName: Record<string, string[]> = {};
  add(name: string, n: number) {
    const list = this.lists[name] || (this.lists[name] = []);
    list.push({ n });
    const names = this.byName[name] ?? (this.byName[name] = []);
    names.push('#' + n);
  }
}
const r = new Registry();
r.add('a', 1);
r.add('a', 2);
r.add('b', 3);
console.log(r.lists['a'].length, r.lists['b'].length, r.lists['a'].map((e) => e.n).join(','), r.byName['a'].join(','));
const cache = new Map<string, number[]>();
function slot(k: string): number[] {
  let s = cache.get(k);
  if (!s) cache.set(k, (s = []));
  return s;
}
slot('x').push(1);
slot('x').push(2);
console.log(cache.get('x')!.length);
