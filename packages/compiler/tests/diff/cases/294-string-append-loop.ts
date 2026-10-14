// A string a loop only appends to (`s += x`, `s = s + x`, reading `s.length`) has the same text and length however
// the loop ends: normally, by break, labelled break or continue, by return, or by a throw caught outside. Loops that
// read the string otherwise, or whose string a closure sees, append as before.
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

function basic(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += 'item' + i + ';';
  return s;
}

function kinds(): string {
  let s = '>';
  const values: (number | boolean | undefined | null | string)[] = [1.5, -0, true, undefined, null, '\uD83D', '😀'];
  for (const v of values) s += v;
  for (const p of [new Point(1, 2)]) s += p;
  return s;
}

function plusChain(): string {
  let s = '';
  const missing: string | undefined = undefined;
  for (let i = 0; i < 3; i++) s = s + i + ',' + missing + new Point(i, -i) + (i + 1);
  return s;
}

function joined(items: string[]): string {
  let s = '';
  for (const item of items) {
    if (s.length) s += ', ';
    s += item;
  }
  return s + ' (' + s.length + ')';
}

function emojiLength(): string {
  let s = '';
  const lengths: number[] = [];
  for (let i = 0; i < 3; i++) {
    s += '😀a';
    lengths.push(s.length);
  }
  return lengths.join(',') + ' ' + s.length;
}

function jumps(): string {
  let s = '';
  outer: for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (j === 1) continue;
      if (i === 2 && j === 2) continue outer;
      if (i === 3) break outer;
      s += `${i}${j} `;
    }
  }
  let k = 0;
  do {
    s += 'd' + k;
    k++;
  } while (k < 3);
  let w = 0;
  while (true) {
    if (w++ > 2) break;
    s += 'w';
  }
  for (const key in { a: 1, b: 2 }) s += key;
  return s;
}

function returned(): string {
  let s = 'r:';
  for (let i = 0; ; i++) {
    s += i;
    if (i === 3) return s + '!';
  }
}

function thrown(): string {
  let s = 't:';
  try {
    for (let i = 0; i < 5; i++) {
      s += i;
      if (i === 2) throw new Error('stop');
    }
  } catch (e) {
    s += '/' + (e as Error).message;
  }
  return s;
}

function readInside(): string {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += i;
    if (s.endsWith('2')) s += '!';
  }
  return s;
}

function seenByClosure(): string {
  let s = '';
  const peek = () => s.length;
  const seen: number[] = [];
  for (let i = 0; i < 3; i++) {
    s += 'ab';
    seen.push(peek());
  }
  return s + ' ' + seen.join(',');
}

function selfAppend(): string {
  let s = 'x';
  for (let i = 0; i < 3; i++) s += s;
  return s;
}

function maybe(): string {
  let s = '?' as string | undefined;
  for (let i = 0; i < 2; i++) s += 'y';
  return String(s);
}

function inExpression(): string {
  let s = '';
  const seen: string[] = [];
  for (let i = 0; i < 3; i++) seen.push((s += i));
  return s + ' ' + seen.join('|');
}

async function awaited(): Promise<string> {
  let s = '';
  for (let i = 0; i < 3; i++) s += await Promise.resolve(i);
  return s;
}

console.log(basic(5), basic(20000).length);
console.log(kinds());
console.log(plusChain());
console.log(joined(['a', 'b', 'c']), joined([]));
console.log(emojiLength());
console.log(jumps());
console.log(returned(), thrown());
console.log(readInside(), seenByClosure(), selfAppend().length, maybe(), inExpression());
awaited().then((s) => console.log('async', s));
