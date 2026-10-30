// @app-lenient
// A non-strict app's field that a missing value reaches (`find`, `pop`, `Map.get`, a record's entry, a function's
// `return null`, a result that gives one) holds that value as it is: undefined or null, converted where JavaScript
// converts it, JavaScript's TypeError on a member read, left out of JSON. A field only present values reach keeps its
// type.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

interface Meeting {
  title: string;
  color: string;
  seats: number;
}
const COLORS: Record<string, string> = { cpc: '#3a7' };
function colorOf(group: string): string {
  return COLORS[group];
}
const SEATS = new Map<string, number>([['cpc', 12]]);

function meeting(title: string, group: string): Meeting {
  return { title, color: colorOf(group), seats: SEATS.get(group) };
}

class Item {
  constructor(public id: string, public body: string) {}
}
const ITEMS = [new Item('a', 'first'), new Item('b', 'second')];
const NEWEST = new Item('c', 'third');
function itemById(id: string): Item {
  return ITEMS.find((i) => i.id === id);
}
function lastOr(none: boolean): Item {
  if (none) return null;
  return NEWEST;
}

class Detail {
  item: Item;
  latest: Item = NEWEST;
  queue: string[] = ['x'];
  next: string;
  open(id: string, none: boolean): void {
    this.item = itemById(id);
    this.latest = lastOr(none);
    this.next = this.queue.pop();
  }
  get heading(): string {
    return this.item ? '#' + this.item.id : '';
  }
}

const m = meeting('CPC', 'cpc'), w = meeting('WG', 'wg');
console.log(m.title, m.color, m.seats, JSON.stringify(m));
console.log(w.title, typeof w.color, typeof w.seats, w.color === undefined, `${w.color}:${w.seats}`, w.seats + 1, JSON.stringify(w));
attempt('color.length', () => w.color.length);
attempt('seats.toFixed', () => w.seats.toFixed(0));

const d = new Detail();
d.open('b', false);
console.log(d.item.body, d.latest.id, d.next, d.heading, JSON.stringify(d));
d.open('z', true);
console.log(d.item === undefined, d.latest === null, d.next === undefined, `[${d.heading}]`, d.item?.body ?? 'none', JSON.stringify(d));
attempt('item.body', () => d.item.body);
attempt('latest.id', () => d.latest.id);
attempt('next.length', () => d.next.length);
