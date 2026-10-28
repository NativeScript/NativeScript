// An object variable or parameter an assignment narrows to present while the value it assigns is missing (an element
// past the end, a record's entry never set): comparisons, tests and string conversions of it give JavaScript's answer.
class Item {
  constructor(public name: string) {}
  toString(): string {
    return 'Item(' + this.name + ')';
  }
}
class Other {}
const ITEMS: Item[] = [new Item('x'), new Item('y')];
const BY_KEY: Record<string, Item> = { a: new Item('a') };
const first = ITEMS[0];

function pick(i: number): Item | null {
  return i < 0 ? null : ITEMS[0];
}

let p: Item | null = pick(-1);
console.log(p === null);
p = ITEMS[5];
console.log(p === first, p !== first, first === p, first !== p, p == null, p != null, p === undefined, p === null);
console.log(p instanceof Item, typeof p, !p, !!p, p ? 'yes' : 'no');
console.log((p ?? first).name, p?.name, p?.name ?? 'none', String(p), `${p}`, 'p=' + p, `[${p}]`);
if (p === first) console.log('same');
else console.log('differs');
if (p !== undefined) console.log('present');
else console.log('missing');

let q: Item | undefined = first;
q = BY_KEY['zz'];
console.log(q === first, q == undefined, q instanceof Item, typeof q, !q, (q ?? first).name, q?.name, String(q), `${q}`);

let r: Item | null = null;
r = ITEMS[1];
console.log(r === ITEMS[1], r !== first, r instanceof Item, typeof r, !r, (r ?? first).name, r?.name, String(r), `${r}`);

function compare(x: Item | null, y: Item): string {
  x = ITEMS[9];
  return `${x === y}|${x !== y}|${x instanceof Item}|${typeof x}|${!x}|${(x ?? y).name}|${x?.name}|${String(x)}`;
}
console.log(compare(null, first), compare(first, ITEMS[1]));

const mixed: (Item | Other)[] = [new Other()];
let m: Item | Other | null = null;
m = mixed[3];
console.log(m instanceof Item, m instanceof Other, typeof m, m === first);

let s: Item | null = null;
s = ITEMS[7];
const same = s === p;
console.log(same, s == q, s === q);

// A missing object read where the program holds it present: a constant given one, a function's result, the read itself.
const ghost = ITEMS[9];
const spirit = BY_KEY['none'];
function at(i: number): Item {
  return ITEMS[i];
}
console.log(ghost === first, ghost !== first, first === ghost, ghost == null, ghost === undefined, ghost instanceof Item, typeof ghost, !ghost);
console.log((ghost ?? first).name, ghost?.name, String(ghost), `${ghost}`, 'g=' + ghost, ghost === spirit, p === ghost, ghost === p);
console.log(spirit === first, spirit instanceof Item, typeof spirit, !spirit, (spirit ?? first).name, spirit?.name, `${spirit}`);
console.log(at(4) === first, at(4) !== first, at(4) == null, at(4) instanceof Item, typeof at(4), !at(4), (at(4) ?? first).name, at(4)?.name, String(at(4)), `${at(4)}`);
console.log(at(0) === first, at(0) instanceof Item, typeof at(0), `${at(0)}`);
console.log(ITEMS[8] === first, ITEMS[8] instanceof Item, typeof ITEMS[8], !ITEMS[8], (ITEMS[8] ?? first).name, ITEMS[8]?.name, `${ITEMS[8]}`, BY_KEY['q'] === ghost, typeof BY_KEY['q']);

// `??` of two missing objects gives the missing value; only a member read of it throws.
const either = ghost ?? spirit;
console.log(typeof either, either === undefined, either === first, either instanceof Item, `${either}`);
console.log(typeof (ghost ?? spirit), (ghost ?? spirit) === first, (ghost ?? spirit) instanceof Item, String(ghost ?? spirit), !(p ?? ghost));
try {
  console.log((ghost ?? spirit).name);
} catch (e) {
  console.log('caught', e instanceof TypeError);
}

// A parameter and a field a missing object reaches observe it the same way.
function inspect(x: Item): string {
  return `${typeof x}|${x === first}|${x !== first}|${x == null}|${x instanceof Item}|${!x}|${(x ?? first).name}|${x?.name}|${String(x)}|${x}`;
}
class Keeper {
  kept: Item;
  constructor(kept: Item) {
    this.kept = kept;
  }
  show(): string {
    return `${typeof this.kept}|${this.kept === first}|${this.kept instanceof Item}|${!this.kept}|${this.kept?.name}|${this.kept}`;
  }
}
console.log(inspect(p), inspect(ghost), inspect(at(6)), inspect(first));
console.log(new Keeper(ghost).show(), new Keeper(first).show());
