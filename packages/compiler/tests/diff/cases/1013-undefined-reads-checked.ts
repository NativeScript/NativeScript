// A string, number or object read where its type says present but its value may be missing (a `!` of an optional, an
// element past an array's end, a record's or Map's absent entry, `find`, an unset regexp group, a function whose
// result is such a read) is JavaScript's TypeError at a member read or call on it, and reads as undefined elsewhere.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
function maybe(i: number): string | undefined {
  return i > 0 ? 'x' : undefined;
}
function num(i: number): number | undefined {
  return i > 0 ? 1.5 : undefined;
}
const s = maybe(0);
const n = num(0);
attempt('upper', () => s!.toUpperCase());
attempt('length', () => s!.length);
attempt('toFixed', () => n!.toFixed(1));
attempt('call upper', () => maybe(0)!.toUpperCase());
attempt('charAt', () => s!.charAt(0));
attempt('index', () => s![0]);
attempt('concat', () => s! + 'a');
attempt('arith', () => n! + 1);
function title(raw: any): string {
  return raw;
}
attempt('title', () => title(undefined).toUpperCase());
attempt('title len', () => title(undefined).length);
interface O {
  a?: string;
  n?: number;
}
const o: O = {};
attempt('opt prop', () => o.a!.toUpperCase());
attempt('opt num', () => o.n!.toFixed(2));
function f(p?: string) {
  return p!.length;
}
attempt('opt param', () => f());
const r: Record<string, string> = { a: 'A' };
const rn: Record<string, number> = {};
const arr: string[] = ['a'];
const nums: number[] = [];
const flags: boolean[] = [];
console.log(r['x'] + '!', r['x'] === undefined, typeof r['x'], r.y === undefined);
console.log(rn['x'] + 1, typeof rn['x']);
console.log(arr[3] + '!', typeof arr[3], nums[2] + 1, typeof flags[0]);
attempt('past end', () => arr[3].toUpperCase());
attempt('el index', () => arr[3][0]);
attempt('el split', () => arr[3].split(','));
attempt('num past end', () => nums[0].toFixed(2));
const m = new Map<string, string>();
attempt('map get', () => m.get('x')!.toUpperCase());
attempt('record', () => r['x'].toUpperCase());
attempt('record dot', () => r.zz.toLowerCase());
attempt('record num', () => rn['q'].toFixed(1));
attempt('find', () => arr.find((x) => x === 'z')!.length);
function grp() {
  return 'abc'.match(/(x)?b/)!;
}
attempt('group upper', () => grp()[1].toUpperCase());
enum Color { Red, Green }
attempt('enum name', () => Color[5].length);
class Box {
  label = 'b';
  open() { return 'open ' + this.label; }
}
const boxes: Box[] = [new Box()];
attempt('obj past end', () => boxes[2].label);
const rb: Record<string, Box> = {};
attempt('obj record', () => rb['k'].label);
function first(xs: string[]) {
  return xs[0];
}
function boxAt(i: number): Box {
  return boxes[i];
}
attempt('fn result', () => first([]).length);
attempt('fn upper', () => first([]).toUpperCase());
console.log(first([]) === undefined, typeof first([]), first([]) + '!', first(['q']).toUpperCase());
attempt('obj result', () => boxAt(3).label);
attempt('obj result call', () => boxAt(3).open());
const gone = boxAt(4);
console.log(gone === undefined, gone ? 'y' : 'n', boxAt(0).open());
attempt('obj variable', () => gone.label);
attempt('nonnull arith', () => {
  const k = nums[0] as number | undefined;
  return k! + 1;
});
attempt('null', () => {
  const z = null as string | null;
  return z!.length;
});
attempt('ok', () => maybe(1)!.toUpperCase() + num(1)!.toFixed(1) + r['a'].toLowerCase() + arr[0].toUpperCase());
const GROUP_OF: Record<string, string> = { a: 'A' };
console.log(['x', 'a'].find((l) => GROUP_OF[l]), ['x', 'a'].filter((l) => GROUP_OF[l]).join());
function groupOf(l: string): string {
  return GROUP_OF[l];
}
console.log(groupOf('x') === undefined, groupOf('x') ? 'y' : 'n', typeof groupOf('x'), groupOf('a'));
