// @app-lenient
// A non-strict app's field typed Signal<string> given a Signal<string | null>: the same signal, read as null until set.
import { signal, Signal } from '@angular/core';
class Service { morning = signal<string | null>(null); }
class View {
  morning: Signal<string>;
  constructor(s: Service) { this.morning = s.morning; }
  title() { const card = this.morning(); return card ? card.toUpperCase() : 'none'; }
}
const s = new Service();
const v = new View(s);
console.log(v.title(), v.morning() === null, v.morning === s.morning);
s.morning.set('hi');
console.log(v.title());
