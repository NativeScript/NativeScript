// Interfaces implemented by classes and by literals, abstract classes, statics, Object helpers.
interface Shape {
  name: string;
  area(): number;
}

abstract class Base implements Shape {
  static created = 0;
  constructor(readonly name: string) {
    Base.created++;
  }
  abstract area(): number;
  describe(): string {
    return `${this.name} with area ${this.area().toFixed(2)}`;
  }
}

class Circle extends Base {
  constructor(private r: number) {
    super('circle');
  }
  area() {
    return Math.PI * this.r ** 2;
  }
}

class Rect extends Base {
  constructor(private w: number, private h: number) {
    super('rect');
  }
  area() {
    return this.w * this.h;
  }
}

const literal: Shape = { name: 'unit', area: () => 1 };
const shapes: Shape[] = [new Circle(1), new Rect(2, 3), literal];
const total = shapes.reduce((sum, s) => sum + s.area(), 0);
console.log(shapes.map((s) => s.name).join(','), total.toFixed(3), Base.created);
for (const s of shapes) if (s instanceof Base) console.log(s.describe());

const scores: Record<string, number> = { ann: 3, bo: 5 };
scores['cy'] = 4;
console.log(Object.keys(scores).join(','), Object.values(scores).reduce((a, b) => a + b, 0), scores['bo'], 'bo' in scores);
for (const [k, v] of Object.entries(scores)) console.log(k, v);

// Implementing a class, even the class itself, checks the shape only.
class Point implements Point {
  constructor(public x: number, public y: number) {}
  sum() {
    return this.x + this.y;
  }
}
class Pair implements Point {
  x = 4;
  y = 5;
  sum() {
    return this.x * this.y;
  }
}
console.log(new Point(1, 2).sum(), new Pair().sum(), new Pair() instanceof Point);
