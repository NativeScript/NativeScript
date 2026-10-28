// Arguments spread from a tuple into fixed parameters: functions, methods, constructors, super, function values.
interface Point { x: number; y: number }
function line(n: number, s: string, ok: boolean): string {
  return `${n}|${s}|${ok}`;
}
function maybe(n: number, s?: string, p?: Point): string {
  return `${n}|${s}|${p ? p.x + p.y : 'none'}`;
}
function four(a: number, b: string, c: number, d: boolean): string {
  return `${a}${b}${c}${d}`;
}
function nullable(s: string | null, n: number): string {
  return `${s}:${n}`;
}
const triple: [number, string, boolean] = [1, 'a', true];
const pair: [string, boolean] = ['b', false];
const short: [number] = [7];
const withPoint: [number, string, Point] = [2, 'p', { x: 3, y: 4 }];
const quad: [number, string, number, boolean] = [1, 'q', 2, true];
const nulled: [string | null, number] = [null, 5];
console.log(line(...triple), line(9, ...pair), maybe(...short), maybe(...withPoint), four(...quad), nullable(...nulled));

class Calc {
  constructor(private base: number) {}
  add(a: number, b: number): number {
    return this.base + a + b;
  }
  static join(sep: string, a: string, b: string): string {
    return a + sep + b;
  }
  sum(...xs: number[]): number {
    return xs.reduce((t, x) => t + x, this.base);
  }
}
const nums: [number, number] = [2, 3];
const words: [string, string, string] = ['-', 'x', 'y'];
const calc = new Calc(10);
console.log(calc.add(...nums), Calc.join(...words), calc.sum(...nums), calc.sum(1, ...nums, ...[4]));

class Label {
  constructor(public text: string, public size: number) {}
  toString(): string {
    return `${this.text}@${this.size}`;
  }
}
class Big extends Label {
  constructor(parts: [string, number]) {
    super(...parts);
  }
}
class Many {
  items: number[];
  constructor(...items: number[]) {
    this.items = items;
  }
}
const spec: [string, number] = ['t', 12];
console.log(String(new Label(...spec)), String(new Big(['b', 3])), new Many(...nums).items.join(','));

const mul: (a: number, b: number) => number = (a, b) => a * b;
const opt: ((a: number, b: number) => number) | undefined = mul;
const pick = (k: number): ((a: number, b: number) => number) | undefined => (k > 0 ? mul : undefined);
const none = pick(0);
function apply(args: Parameters<typeof line>): string {
  return line(...args);
}
console.log(mul(...nums), opt?.(...nums), none?.(...nums), apply([4, 'z', false]));
