// @assign-fields
// A subclass's keys follow everything its base's constructor made, a field its base's constructor writes through an
// overridden method included, and a base field written later goes after them all.
const show = (tag: string, o: object) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o));

class Base {
  id = 0;
  late?: string;
  name?: string;
  constructor(name?: string) {
    this.init();
    if (name) this.name = name;
  }
  init() {}
}

class Child extends Base {
  extra?: number;
  tag = 'c';
  ready!: boolean;
  override init() {
    this.extra = 1;
  }
}
const c = new Child('n');
show('child', c);
c.ready = true;
c.late = 'l';
show('child later', c);

class Plain extends Base {
  size = 2;
}
const pl = new Plain();
show('plain', pl);
pl.name = 'later';
show('plain later', pl);

class Deep extends Child {
  depth: number;
  constructor(public level: number) {
    super();
    this.depth = level * 2;
  }
}
const d = new Deep(3);
show('deep', d);
d.late = 'x';
show('deep later', d);

class Shuffled {
  p?: number;
  q?: number;
  constructor() {
    this.shuffle();
  }
  shuffle() {
    this.q = 1;
    this.p = 2;
  }
}
class Over extends Shuffled {
  r = 3;
  s!: number;
  t?: number;
  constructor() {
    super();
    this.s = 4;
    if (this.r > 1) this.t = 5;
  }
}
show('over', new Over());
console.log(JSON.stringify([new Over(), new Child()]));
