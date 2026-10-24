// A constructor that runs statements before super(…): locals and parameters the statements compute feed the call and
// the code after it, and field initializers run right after super() returns.
const log: string[] = [];

class Shape {
  readonly label: string;
  constructor(label: string, readonly sides: number) {
    log.push(`Shape(${label}, ${sides})`);
    this.label = label;
  }
  describe(): string {
    return `${this.label}/${this.sides}`;
  }
}

class Polygon extends Shape {
  area = this.sides * 10;
  tag: string;
  constructor(name: string, sides: number, private scale = 2) {
    if (sides < 3) throw new Error(`a polygon needs 3 sides, got ${sides}`);
    const upper = name.toUpperCase();
    let suffix = '';
    for (let i = 0; i < sides; i++) suffix += '*';
    log.push(`before super: ${upper}${suffix}`);
    super(`${upper}${suffix}`, sides);
    this.tag = `${upper}x${this.scale}:${this.area}`;
    log.push(`after super: ${this.tag}`);
  }
}

class Square extends Polygon {
  constructor(side: number) {
    const name = side > 5 ? 'big' : 'small';
    super(name, 4);
    this.area = side * side;
  }
}

const p = new Polygon('tri', 3);
console.log(p.describe(), p.area, p.tag);
const s = new Square(7);
console.log(s.describe(), s.area, s.tag);
try {
  new Polygon('line', 2);
} catch (e) {
  console.log('caught', (e as Error).message);
}
console.log(log.join('\n'));
