// @assign-fields
// As 930 where a field without an initializer is a key only once written: keys added through `any` keep their place
// among the fields' keys, before, between and after them.
const show = (tag: string, o: object) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o));

class Base {
  a = 1;
  late?: number;
  constructor() {
    (this as any).early = 'e';
  }
}
class Sub extends Base {
  b = 2;
  maybe?: string;
}
const s = new Sub();
show('sub', s);
s.late = 3;
show('late', s);
(s as any).extra = 'x';
s.maybe = 'm';
show('maybe', s);

class Plain {
  x?: number;
  y = 0;
  constructor(flag: boolean) {
    if (flag) (this as any).z = 'z';
    this.x = 1;
  }
}
show('plain', new Plain(true));
show('plain off', new Plain(false));
const p = new Plain(false);
(p as any).w = 'w';
delete p.x;
p.x = 5;
show('plain again', p);
