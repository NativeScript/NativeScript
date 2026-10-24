// A setter whose parameter is a destructuring pattern: object and array patterns, defaults and renames, beside a
// getter of another type and as the only accessor.
class Offset {
  constructor(public x = 0, public y = 0) {}
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

class Gauge {
  private readonly offset = new Offset();
  private span = '';
  log: string[] = [];

  get centerOffset(): Offset {
    return this.offset;
  }
  set centerOffset({ x, y }: { x: number; y: number }) {
    this.offset.x = x;
    this.offset.y = y;
  }

  set range([low, high = low + 10]: number[]) {
    this.span = `${low}..${high}`;
    this.log.push(this.span);
  }

  set label({ text: shown, size = 12 }: { text: string; size?: number }) {
    this.log.push(`${shown}@${size}`);
  }

  get describe(): string {
    return `${this.offset} ${this.span}`;
  }
}

const g = new Gauge();
g.centerOffset = { x: 3, y: -4 };
console.log(g.centerOffset.toString(), g.centerOffset.x);
g.centerOffset = new Offset(7, 8);
g.range = [1];
g.range = [2, 5];
g.label = { text: 'hi' };
g.label = { text: 'big', size: 30 };
console.log(g.describe, g.log.join(' '));
