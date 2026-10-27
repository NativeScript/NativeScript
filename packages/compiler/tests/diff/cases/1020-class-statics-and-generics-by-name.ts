// A class's statics reached by name (the class held untyped, or indexed by a computed key), inherited statics
// included, and an instance reached by name only inside a generic function, through its type parameter.
class Registry {
  static count = 1;
  static make(n: number) {
    return n * 2 + Registry.count;
  }
  static get label() {
    return 'reg' + Registry.count;
  }
}
class Special extends Registry {
  static extra(s: string) {
    return `${s}:${Special.count}`;
  }
}
const k: string = ['ma', 'ke'].join('');
console.log('static computed', (Registry as any)[k](3));
const anyCls: any = Registry;
console.log('static any', anyCls.make(4), anyCls['label'], anyCls[['la', 'bel'].join('')]);
console.log('static in', 'make' in anyCls, 'label' in anyCls, 'count' in anyCls, 'nope' in anyCls);
const key: string = 'count';
console.log('static field', (Registry as any)[key]);
const sub: any = Special;
console.log('inherited', sub[k](1), sub['extra']('x'), typeof sub.make, typeof sub.nope);

class Box {
  v = 3;
  get twice() {
    return this.v * 2;
  }
  bump(n: number) {
    this.v += n;
    return this.v;
  }
}
function poke<T>(x: T, k: string) {
  return (x as any)[k](1);
}
function read<T extends object>(x: T, k: string) {
  return (x as any)[k];
}
function has<T extends object>(x: T, k: string) {
  return k in x;
}
function relay<U>(x: U, k: string) {
  return poke(x, k);
}
const b = new Box();
console.log('generic call', poke(b, 'bump'), relay(b, 'bump'));
console.log('generic read', read(b, 'twice'));
console.log('generic in', has(b, 'bump'), has(b, 'twice'), has(b, 'v'), has(b, 'zz'));
