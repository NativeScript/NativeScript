export class Shape {
  constructor(readonly name: string) {}
  area(): number {
    return 0;
  }
  describe(): string {
    return `${this.name}: ${this.area()}`;
  }
}
