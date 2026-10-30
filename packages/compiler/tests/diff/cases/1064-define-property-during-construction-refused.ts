// Refused: Object.defineProperty on `this` while its class constructs it, making a declared field read-only: the
// constructor and the field initializers read the field directly, where no descriptor applies.
class Counter {
  count = 0;
  constructor() {
    Object.defineProperty(this, 'count', { value: 5, writable: false });
    console.log(this.count);
  }
}
console.log(new Counter().count);
