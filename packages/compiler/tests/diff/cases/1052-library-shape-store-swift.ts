// @lenient
// As the kit is generated: generic code writes a field of an object literal through the wider type it is
// constrained to, as Observable.notify writes `data.object`. The literal's field holds a class unrelated to the
// one the wider type names (Application is no Observable), which TypeScript allows as the two are alike.
// Swift's field can hold only the literal's class, so the case prints what the store must not lose.
class Source {
  tag = 'source';
}

class Lookalike {
  tag = 'lookalike';
}

interface Stamped {
  name: string;
  object: Source;
}

function stamp<T extends Partial<Stamped>>(data: T, by: Source): T {
  data.object = data.object || by;
  return data;
}

function run(by: Source) {
  if (!by) throw new Error('no source');
  const app = new Lookalike();
  const d = stamp({ name: 'ready', object: app, value: 2 }, by);
  console.log(d.name, d.value);
  const e = stamp({ name: 'unset', object: null as Source | null, value: 3 }, by);
  console.log(e.name, e.value, e.object.tag);
}

run(new Source());
