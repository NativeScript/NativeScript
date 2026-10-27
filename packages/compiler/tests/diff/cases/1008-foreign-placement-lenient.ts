// @app-lenient
// A non-strict app's own code checks untyped values where they are placed as strict code does: an argument, a result,
// a field or an element of another type than declared is JavaScript's TypeError there, and each such value below is
// then used as its declared type, which throws in JavaScript too. A value of the type, null and undefined pass.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Item {
  id = 0;
  describe() {
    return `item ${this.id}`;
  }
}
class Other {
  name = 'o';
}

function shout(s: string) {
  return s.toUpperCase();
}
function label(o: any): string {
  return o.label;
}
function describe(i: Item) {
  return i ? i.describe() : 'none';
}
class Box {
  size = 0;
  set(raw: any) {
    this.size = raw.size;
  }
}

const data: any = JSON.parse('{"label": 7, "size": "big", "ok": "fine", "k": 4}');
attempt('shout', () => shout(data.k));
attempt('shout ok', () => shout(data.ok));
attempt('shout missing', () => shout(data.missing ?? 'none'));
attempt('label', () => {
  const l = label(data);
  return l.toUpperCase();
});
attempt('label ok', () => label({ label: 'x' }));
attempt('box', () => {
  const b = new Box();
  b.set(data);
  return b.size.toFixed(1);
});
attempt('push', () => {
  const xs: number[] = [];
  xs.push(data.ok);
  return xs[0].toFixed(1);
});
attempt('describe', () => describe(new Other() as any));
attempt('describe null', () => describe(JSON.parse('null')));
const item = new Item();
item.id = 2;
attempt('describe ok', () => describe(item));
