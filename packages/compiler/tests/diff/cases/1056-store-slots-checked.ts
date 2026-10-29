// An untyped value stored as it is in a slot declared with a type, where nothing tests its type, is JavaScript's
// TypeError where it is stored: an object literal's shorthand field, a field given in one branch of a conditional, a
// logical assignment (`??=`, `||=`, `&&=`), an assertion to an optional type, an app class's instance, and the result
// of a method called on a value held as it is. Each such value below is then used as its declared type, which throws
// in JavaScript too; the right-typed and missing ones pass.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const data: any = JSON.parse('{"label": 7, "ok": "fine", "words": ["one", 2], "names": ["a", "b"], "plain": {"name": "p"}}');

class Item {
  constructor(public name: string) {}
  greet(): string {
    return 'hi ' + this.name;
  }
}

interface Labeled {
  label: string;
  note?: string | null;
}

// Shorthand fields.
attempt('shorthand', () => {
  const label = data.label;
  const o: Labeled = { label };
  return o.label.toUpperCase();
});
attempt('shorthand ok', () => {
  const label = data.ok;
  const o: Labeled = { label };
  return o.label.toUpperCase();
});

// A field given in one branch of a conditional, the other null.
function noted(flag: boolean, raw: any): Labeled {
  return { label: 'n', note: flag ? raw : null };
}
attempt('branch', () => noted(true, data.label).note!.toUpperCase());
attempt('branch ok', () => noted(true, data.ok).note!.toUpperCase());
attempt('branch null', () => noted(false, data.label).note === null);

// Logical assignments, as statements and as values.
class Slots {
  name?: string;
  title = '';
  code = 'c';
}
attempt('??= variable', () => {
  let s: string | undefined;
  s ??= data.label;
  return s!.toUpperCase();
});
attempt('||= variable', () => {
  let s = '';
  s ||= data.label;
  return s.toUpperCase();
});
attempt('&&= variable', () => {
  let s = 'x';
  s &&= data.label;
  return s.toUpperCase();
});
attempt('??= field', () => {
  const o = new Slots();
  o.name ??= data.label;
  return o.name!.toUpperCase();
});
attempt('||= field value', () => {
  const o = new Slots();
  const v = (o.title ||= data.label);
  return v.toUpperCase() + o.title.toUpperCase();
});
attempt('??= field ok', () => {
  const o = new Slots();
  const v = (o.name ??= data.ok);
  return v.toUpperCase();
});

// Assertions to an optional type.
attempt('as string[] | undefined', () => (data.words as string[] | undefined)!.map((w) => w.toUpperCase()).join());
attempt('as string[] | undefined ok', () => (data.names as string[] | undefined)!.map((w) => w.toUpperCase()).join());
attempt('as string[] | undefined missing', () => (data.nothing as string[] | undefined) ?? 'none');
attempt('as string | undefined', () => (data.label as string | undefined)!.toUpperCase());
attempt('as string | undefined ok', () => (data.ok as string | undefined)!.toUpperCase());

// An app class's instance, where the slot holds one present.
attempt('class', () => {
  const it: Item = data.plain;
  return it.greet();
});
attempt('class missing', () => {
  const it: Item = data.nothing;
  return it.greet();
});
attempt('class ok', () => {
  const it: Item = JSON.parse('null') ?? new Item('q');
  return it.greet();
});

// A method called on a value held as it is (its type is tested), the result stored typed.
class Holder {
  helper: Item = new Item('h');
}
const holder = new Holder();
holder.helper = JSON.parse('{"name": "j"}');
(holder.helper as any).greet = () => 5;
console.log(holder.helper instanceof Item ? 'item' : 'plain');
attempt('held call', () => {
  const g: string = holder.helper.greet();
  return g.toUpperCase();
});
attempt('held read', () => {
  const n: string = holder.helper.name;
  return n.toUpperCase();
});
