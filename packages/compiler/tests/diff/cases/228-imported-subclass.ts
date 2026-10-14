// A class extended in another module the case imports: the base stays open for it.
import { Shape } from './helpers/shape.ts';
import { Square } from './helpers/square.ts';

const shapes: Shape[] = [new Shape('point'), new Square(3)];
for (const s of shapes) console.log(s.describe());
console.log(shapes[1] instanceof Shape, shapes[1] instanceof Square);
