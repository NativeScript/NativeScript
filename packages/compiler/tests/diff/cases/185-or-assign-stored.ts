// @swift
// `const list = map[k] || (map[k] = [])` is the stored array, not a copy: a push through it is seen in the map.
interface Entry {
  n: number;
}
class Registry {
  lists: { [name: string]: Array<Entry> } = {};
  plain: Record<string, string[]> = {};
  add(name: string, n: number) {
    const list = this.lists[name] || (this.lists[name] = []);
    list.push({ n });
  }
  addNullish(name: string, n: number) {
    const list = this.lists[name] ?? (this.lists[name] = []);
    list.push({ n });
  }
  addLogical(name: string, n: number) {
    this.plain[name] ||= [];
    this.plain[name].push(String(n));
    this.plain[name] ??= [];
    this.plain[name].push('x');
  }
}
const r = new Registry();
r.add('a', 1);
r.add('a', 2);
r.addNullish('b', 3);
r.addNullish('b', 4);
r.addLogical('c', 5);
r.addLogical('c', 6);
const groups: { [k: string]: number[] } = {};
for (const v of [1, 2, 3, 4]) {
  const g = groups[v % 2 ? 'odd' : 'even'] || (groups[v % 2 ? 'odd' : 'even'] = []);
  g.push(v);
}
const stats: Record<string, { n: number }> = {};
for (const w of ['a', 'b', 'a']) {
  const s = stats[w] ?? (stats[w] = { n: 0 });
  s.n++;
}
let local: number[] | undefined;
const l2 = local || (local = []);
l2.push(7);
console.log(r.lists['a'].length, r.lists['b'].length, r.plain['c'], JSON.stringify(groups), JSON.stringify(stats), local);
