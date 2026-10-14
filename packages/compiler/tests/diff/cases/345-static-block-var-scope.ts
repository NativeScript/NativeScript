// A static block filling a lookup table through `this` and an arrow function, and a function's var read after the block that declares it.
class Units {
  static readonly factors = new Map<string, number>();
  static {
    const add = (name: string, f: number) => this.factors.set(name, f);
    add('mm', 0.001);
    add('cm', 0.01);
    add('m', 1);
  }
  static convert(value: number, from: string, to: string): number {
    return (value * Units.factors.get(from)!) / Units.factors.get(to)!;
  }
}
console.log(Units.factors.size, Units.convert(250, 'cm', 'm'), Units.convert(3, 'm', 'mm'));

function firstLong(words: string[]) {
  for (var k = 0; k < words.length; k++) {
    if (words[k].length > 4) {
      var found: string | undefined = words[k];
      break;
    }
  }
  return `${k}:${found}`;
}
console.log(firstLong(['ab', 'abcdef', 'xyz']), firstLong(['a']));
