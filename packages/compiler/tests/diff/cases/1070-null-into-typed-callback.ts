// A function typed to take an object, called by script with null or nothing: its body sees that value (Q7).
class Box {
  constructor(public v: number) {}
}

function show(b: Box): string {
  if (b === null) return 'null';
  if (b === undefined) return 'undefined';
  return `box ${b.v}`;
}

const held: any = show;
console.log(held(null), held(new Box(2)));

const arrow = (b: Box, tag: string): string => (b === null ? `null ${tag}` : `box ${b.v} ${tag}`);
const fns: any[] = [arrow];
console.log(fns[0](null, 'a'), fns[0](new Box(3), 'b'));

// A callback whose wanted type admits null, given a function declared without it.
function each(items: (Box | null)[], visit: (b: Box | null) => string): string[] {
  return items.map((b) => visit(b));
}
const strictVisit = (b: Box): string => (b == null ? 'none' : `v${b.v}`);
console.log(each([new Box(5), null], strictVisit as (b: Box | null) => string).join(','));

// Reading a member of the null it was given is JavaScript's TypeError, caught.
const reads: any = (b: Box): number => b.v;
try {
  console.log(reads(null));
} catch (e) {
  console.log('TypeError', e instanceof TypeError);
}
