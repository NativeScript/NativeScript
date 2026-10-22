// @app-lenient
// A non-strict app's `signal<T>(null)` of a class: read as null until set, a member read through it a TypeError.
import { signal } from '@angular/core';
class Person {
  constructor(public id: number, public name: string) {}
}
class Detail {
  readonly person = signal<Person>(null);
  label(): string {
    return this.person() && this.person().id > 1 ? 'many' : 'few';
  }
  id(): number {
    return this.person().id;
  }
  current(): Person {
    return this.person();
  }
}
const d = new Detail();
console.log(d.label(), d.current() === null);
try {
  d.id();
} catch (e) {
  console.log('id', e instanceof TypeError);
}
d.person.set(new Person(2, 'Ada'));
console.log(d.label(), d.id(), d.current().name);
