// @app-lenient
// A non-strict app's awaited null-only results in literals: an object's field awaited first, and arrays of objects that
// only take them through a fallback or a test.
class Item {
  constructor(public name: string) {}
}
interface Slot {
  item: Item;
  tag: string;
}
const show = (v: unknown) => (v === null ? 'null' : v === undefined ? 'undefined' : v instanceof Item ? `Item ${v.name}` : String(v));
async function find(name: string): Promise<Item> {
  await Promise.resolve();
  if (name === 'a') return new Item(name);
  return null;
}
async function main() {
  const slot: Slot = { item: await find('a'), tag: 't' };
  const none: Slot = { item: await find('z'), tag: 'n' };
  console.log(show(slot.item), slot.tag, none.item == null, !none.item, none.tag);
  const fallback = new Item('f');
  const items = [(await find('z')) ?? fallback, (await find('a')) || fallback];
  console.log(items.map(show).join(' '));
  const found = await find('q');
  const kept = found ? [found] : [];
  console.log(kept.length);
}
main();
