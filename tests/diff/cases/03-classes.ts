// Classes: fields in JavaScript's order, inheritance, accessors, statics.
const notes: string[] = [];

function note(text: string): number {
  notes.push(text);
  return notes.length;
}

class Animal {
  static count = 0;
  readonly id = note('Animal field');
  protected sound = 'generic';

  constructor(public name: string) {
    note('Animal constructor ' + name);
    Animal.count++;
  }

  speak(): string {
    return `${this.name} says ${this.sound}`;
  }

  get label(): string {
    return `#${this.id} ${this.name}`;
  }
}

class Dog extends Animal {
  tricks: string[] = [];
  private mood = note('Dog field');

  constructor(name: string, private breed: string) {
    super(name);
    this.sound = 'woof';
    note('Dog constructor');
  }

  override speak(): string {
    return super.speak() + ` (${this.breed}, mood ${this.mood})`;
  }

  set trick(value: string) {
    this.tricks.push(value);
  }
}

const rex = new Dog('Rex', 'collie');
rex.trick = 'sit';
rex.trick = 'roll';
console.log(notes.join(' | '));
console.log(rex.speak(), rex.label, rex.tricks, Animal.count);
const pets: Animal[] = [rex, new Animal('Cat')];
for (const p of pets) console.log(p instanceof Dog, p.speak());
console.log(Animal.count);

class Counter {
  private value = 0;
  increment(by = 1): this {
    this.value += by;
    return this;
  }
  get current() {
    return this.value;
  }
}
console.log(new Counter().increment().increment(5).current);
