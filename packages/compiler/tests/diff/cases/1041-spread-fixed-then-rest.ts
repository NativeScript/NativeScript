// A spread reaching fixed parameters and then a rest parameter: the fixed ones take the leading elements, the rest the others.
function tag(name: string, ...rest: number[]): string {
  return `${name}[${rest.join(',')}]`;
}
function two(a: string, b: number, ...rest: number[]): string {
  return `${a}${b}[${rest.join(',')}]`;
}
function loose(a?: number, ...rest: number[]): string {
  return `${a}:${rest.length}`;
}
function forward(...xs: number[]): string {
  return loose(...xs);
}
const variadic: [string, ...number[]] = ['v', 1, 2, 3];
const exact: [string, number, number] = ['e', 1, 2];
const head: [string, number] = ['h', 0];
const nums = [3, 4];
const one: [number] = [5];
const empty: number[] = [];
console.log(tag(...variadic), tag('n', ...nums), two(...exact), two(...head), two('m', ...one), loose(...nums), loose(...empty), forward(8, 9), forward());

class Log {
  lines: string[] = [];
  add(level: string, ...parts: string[]): this {
    this.lines.push(`${level}: ${parts.join(' ')}`);
    return this;
  }
}
const entry: [string, string, string] = ['info', 'a', 'b'];
console.log(new Log().add(...entry).add('warn', ...['c']).lines.join(' / '));
