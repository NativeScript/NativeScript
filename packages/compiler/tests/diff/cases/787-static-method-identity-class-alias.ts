// A class's static method read as a value is one function (`===` and an untyped array's `includes` find it again), a type alias
// of a class's type names that class, an injectable service may overload its methods, and an EventEmitter of objects
// takes a handler of untyped values.
import '@angular/compiler';
import { EventEmitter, Injectable, Injector, inject, runInInjectionContext } from '@angular/core';

type Check = (n: number) => string | null;

class Checks {
  static positive(n: number): string | null {
    return n > 0 ? null : 'not positive';
  }
  static below(limit: number): Check {
    return (n) => (n < limit ? null : `not below ${limit}`);
  }
}

const list: Check[] = [Checks.positive, Checks.below(10)];
console.log(Checks.positive === Checks.positive, list.map((c) => c(12)).join('|'));
const held: Check | Check[] | null = Checks.positive;
console.log(held === Checks.positive, Array.isArray(held));
const untyped: any[] = [Checks.positive];
console.log(untyped.includes(Checks.positive), untyped[0](-1));

class Box<T> {
  constructor(public value: T) {}
  describe(): string {
    return `Box(${String(this.value)})`;
  }
}
type NumberBox = Box<number>;
type AnyBox = Box<any>;
const boxes: NumberBox[] = [new Box(1), new Box(2)];
const loose: AnyBox = new Box<any>('x');
const total = boxes.reduce((sum, b: NumberBox) => sum + b.value, 0);
console.log(total, loose.describe(), boxes[1].describe());

@Injectable({ providedIn: 'root' })
class Formatter {
  format(value: number): string;
  format(value: string, width: number): string;
  format(value: number | string, width = 0): string {
    return typeof value === 'number' ? value.toFixed(1) : value.padStart(width, '.');
  }
}

class Event {
  constructor(readonly kind: string) {}
}

const injector = Injector.create({ providers: [Formatter] });
runInInjectionContext(injector, () => {
  const formatter = inject(Formatter);
  console.log(formatter.format(2), formatter.format('ab', 4));
});

const events = new EventEmitter<Event>();
const seen: string[] = [];
events.subscribe((e: any) => seen.push(e.kind));
events.subscribe((e: Event) => seen.push(e.kind.toUpperCase()));
events.emit(new Event('tap'));
console.log(seen.join(','));
