// An untyped value returned where a function declares its result, written to a typed field, or put into a typed array,
// Set or Map, where nothing tests its type, is JavaScript's TypeError where it is placed, as is an object of another
// class given where a class is declared. Each such value below is then used as its declared type, which throws in
// JavaScript too. A value of the declared type, null and undefined pass.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Item {
  constructor(public id: number) {}
  describe() {
    return `item ${this.id}`;
  }
}
class Other {
  name = 'o';
}

function title(raw: any): string {
  return raw;
}
function count(o: any): number {
  return o.n;
}
function item(raw: any): Item {
  return raw;
}
const parsed = (s: string): number => JSON.parse(s);
class Reader {
  read(s: string): string {
    return JSON.parse(s);
  }
  get first(): string {
    return JSON.parse('[1]')[0];
  }
}
async function later(s: string): Promise<string> {
  return JSON.parse(s);
}

class Box {
  label: string = '';
  size = 0;
  owner?: Item;
  set(raw: any) {
    this.label = raw.label;
    this.size = raw.size;
  }
}
interface Row {
  name: string;
  n: number;
}
function idOf(i: Item | undefined) {
  return i ? i.describe() : 'none';
}

const data: any = JSON.parse('{"label": 7, "size": "big", "n": "x", "name": 3, "ok": "fine", "k": 4}');
attempt('title', () => {
  const t = title(data.label);
  return t.toUpperCase();
});
attempt('count', () => {
  const n = count(data);
  return n.toFixed(1);
});
attempt('item', () => item(new Other()).describe());
attempt('parsed', () => parsed('"yes"').toFixed(1));
attempt('read', () => new Reader().read('1').toUpperCase());
attempt('first', () => new Reader().first.toUpperCase());
attempt('box', () => {
  const b = new Box();
  b.set(data);
  return b.label.toUpperCase();
});
attempt('box ok', () => {
  const b = new Box();
  b.set({ label: 'top', size: 2 });
  return `${b.label} ${b.size.toFixed(1)}`;
});
attempt('owner', () => {
  const b = new Box();
  b.owner = data;
  return b.owner?.describe();
});
attempt('owner null', () => {
  const b = new Box();
  b.owner = JSON.parse('null');
  return b.owner == null;
});
attempt('row', () => {
  const r: Row = { name: data.name, n: data.k };
  return r.name.toUpperCase();
});
attempt('row ok', () => {
  const r: Row = { name: data.ok, n: data.k };
  return `${r.name} ${r.n}`;
});
attempt('push', () => {
  const names: string[] = [];
  names.push(data.ok);
  return names.map((s) => s.toUpperCase()).join();
});
attempt('push wrong', () => {
  const names: string[] = [];
  names.push(data.k);
  return names.map((s) => s.toUpperCase()).join();
});
attempt('index wrong', () => {
  const names: string[] = ['a'];
  names[0] = data.k;
  return names[0].toUpperCase();
});
attempt('as array', () => (JSON.parse('[1, 2]') as string[])[0].toUpperCase());
attempt('as array of a number', () => (JSON.parse('5') as string[]).map((s) => s.toUpperCase()));
attempt('as array ok', () => (JSON.parse('["a", "b"]') as string[]).join('-'));
const m = new Map<string, number>();
attempt('map', () => m.set('a', data.k).get('a')!.toFixed(1));
attempt('map wrong', () => m.set('b', data.ok).get('b')!.toFixed(1));
attempt('set', () => new Set<string>().add(data.ok).size);
attempt('set wrong', () => [...new Set<string>().add(data.k)][0].toUpperCase());
attempt('idOf', () => idOf(new Other() as any));
attempt('idOf null', () => idOf(JSON.parse('null')));
attempt('idOf ok', () => idOf(JSON.parse('null') ?? new Item(3)));
console.log(title('ok'), count({ n: 2 }), item(new Item(5)).describe(), parsed('2'), m.get('a'));
later('3')
  .then((v) => console.log('later', v.toUpperCase()))
  .catch((e) => console.log('later', e instanceof TypeError ? 'TypeError' : 'other'));
later('"three"').then((v) => console.log('later ok', v));
