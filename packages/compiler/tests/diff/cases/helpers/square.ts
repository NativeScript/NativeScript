import { Shape } from './shape.ts';

export class Square extends Shape {
  constructor(readonly side: number) {
    super('square');
  }
  override area(): number {
    return this.side * this.side;
  }
}
