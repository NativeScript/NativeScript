// Class members named like the module values they hold.
import { fruits, label, type Fruit } from './helpers/fruits.ts';

const total = 7;

class Stall {
  readonly fruits = fruits;
  label = label + '!';
  total = total * 2;

  cheapest(): Fruit {
    return [...this.fruits].sort((a, b) => a.price - b.price)[0];
  }

  describe(): string {
    return `${this.label} ${this.fruits.length}/${fruits.length} ${this.total}/${total}`;
  }
}

const stall = new Stall();
console.log(stall.describe(), stall.cheapest().name, stall.fruits === fruits);
