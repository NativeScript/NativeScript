// A method some instances replace with their own function (a store's `dispatch` a test or plugin swaps), called on an
// object held in a field (`this.store.dispatch(action)`, as an @ngrx effect or component calls it).
class Store {
  log: string[] = [];
  dispatch(action: string): number {
    this.log.push(action);
    return this.log.length;
  }
}

class Effects {
  constructor(private store: Store) {}
  readonly nested = { store: new Store() };
  run(): number {
    this.store.dispatch('load');
    return this.store.dispatch('loaded');
  }
  deep(): number {
    return this.nested.store.dispatch('deep');
  }
}

const plain = new Store();
const watched = new Store();
const seen: string[] = [];
watched.dispatch = (action: string): number => {
  seen.push(action);
  watched.log.push(action.toUpperCase());
  return -watched.log.length;
};

const a = new Effects(plain);
console.log(a.run(), plain.log.join(','));
const b = new Effects(watched);
console.log(b.run(), watched.log.join(','), seen.join(','));
console.log(b.deep(), b.nested.store.log.join(','));
b.nested.store.dispatch = (action: string) => {
  seen.push('nested ' + action);
  return -1;
};
console.log(b.deep(), seen.join(','));
