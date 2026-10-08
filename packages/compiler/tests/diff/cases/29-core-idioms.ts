// Idioms @nativescript/core's own code uses.

// A constructor's overloads over one implementation taking a rest parameter.
class Tint {
  argb = 0;
  constructor(value: number);
  constructor(a: number, r: number, g: number, b: number);
  constructor(...args: any[]) {
    this.argb = args.length === 1 ? args[0] : ((args[0] * 256 + args[1]) * 256 + args[2]) * 256 + args[3];
  }
  static fromRgb(r: number, g: number, b: number): Tint {
    return new Tint(255, r, g, b);
  }
  // A getter the subclass narrows.
  get native(): any {
    return undefined;
  }
}

class NamedTint extends Tint {
  get native(): string {
    return `tint ${this.argb}`;
  }
}

// A compound assignment's value.
function hex(n: number, pad: boolean): string {
  let result = '#' + n.toString(16);
  if (pad) {
    return (result += '00');
  }
  return result;
}

// Wrapper objects never exist in compiled code.
function isText(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}

// A class meeting an interface with an untyped parameter.
interface Handler {
  handle(error: Error): any;
}
class Rethrow implements Handler {
  handle(error: any) {
    console.log('handled', error.message);
  }
}

// A generic function's result, instantiated.
function makeParser<T>(valid: (value: any) => boolean): (value: any) => T {
  return (value) => (valid(value) ? value : 'left');
}
const parseSide: (value: any) => 'left' | 'right' = makeParser<'left' | 'right'>((v) => v === 'left' || v === 'right');

export namespace Trace {
  export const name = 'trace';
  export class Writer {
    lines: string[] = [];
    write(text: string) {
      this.lines.push(`${name}: ${text}`);
    }
  }
  export namespace Kinds {
    export const log = 0;
    export const error = 3;
  }
}

let h: any = 9;
h /= 2;
h -= 1;
let joined: any = 'a';
joined += 1;

const dynamic: any = { check: () => true, size: () => 3 };
const checked: boolean = dynamic.check();
const size: number = dynamic.size() + 1;

const tint = new Tint(0xff112233);
const named = new NamedTint(255, 1, 2, 3);
const base: Tint = named;
console.log(tint.argb, Tint.fromRgb(1, 2, 3).argb, named.native, base.native, tint.native);
console.log(hex(255, false), hex(255, true), isText('x'), isText(1));
const handler: Handler = new Rethrow();
handler.handle(new Error('boom'));
console.log(parseSide('left'), parseSide('up'));
const writer = new Trace.Writer();
writer.write('one');
const kinds = { Kinds: Trace.Kinds };
console.log(writer.lines.join(','), kinds.Kinds.error, Trace.Kinds.log);
console.log(h, joined, checked, size);
