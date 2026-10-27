// An untyped object asserted to a class of the program's, where it may be missing: an object of another class is
// JavaScript's TypeError where the class's method is called on it, and the assertion's TypeError here, never missing.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Item {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  describe() {
    return 'item ' + this.name;
  }
}
class Other {
  kind = 'other';
}

function describeOrNone(x?: object) {
  const it = x as Item | undefined;
  return it ? it.describe() : 'none';
}
attempt('other', () => describeOrNone(new Other()));
attempt('item', () => describeOrNone(new Item('a')));
attempt('none', () => describeOrNone());

const raw: any = JSON.parse('{"kind": "parsed"}');
attempt('parsed', () => {
  const it = raw as Item | undefined;
  return it ? it.describe() : 'none';
});
const empty: any = null;
attempt('null', () => {
  const it = empty as Item | null;
  return it ? it.describe() : 'none';
});
