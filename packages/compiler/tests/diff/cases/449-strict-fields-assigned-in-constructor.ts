// Strict code's fields the constructor assigns: a read of one before it is assigned, through a method the constructor
// calls, is undefined, as in JavaScript, though TypeScript lets the method read it as its type.
class Engine {
  constructor(public name: string) {}
}

class Car {
  engine: Engine;
  spare!: Engine;
  log: string[] = [];
  constructor(name: string) {
    this.engine = new Engine(name);
    this.check();
    this.spare = new Engine(`${name} spare`);
  }
  check() {
    this.log.push(`engine ${this.engine.name}`, `spare ${this.spare === undefined ? 'missing' : this.spare.name}`);
  }
}

const car = new Car('v8');
car.check();
console.log(car.log.join(', '));
