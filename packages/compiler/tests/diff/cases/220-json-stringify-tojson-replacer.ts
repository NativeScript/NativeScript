// JSON.stringify calls a class's or a literal's toJSON, a function replacer on each holder, and keeps an array replacer's keys.
class Money {
  constructor(public cents: number, public currency: string) {}
  toJSON() {
    return { amount: this.cents / 100, currency: this.currency };
  }
}
class Order {
  id = 7;
  total = new Money(1250, 'EUR');
  secret = 'x';
}
class Keyed {
  toJSON(key: string) {
    return 'at:' + key;
  }
}
console.log(JSON.stringify(new Order()), JSON.stringify({ when: new Date(0), m: new Money(5, 'USD') }));
console.log(JSON.stringify(new Order(), (k, v) => (k === 'secret' ? undefined : v)));
console.log(JSON.stringify({ a: 1, b: [1, 2] }, (k, v) => (typeof v === 'number' ? v * 10 : v), 1));
console.log(JSON.stringify(new Order(), ['id', 'total', 'amount']), JSON.stringify({ b: 2, a: 1, c: 3 }, ['c', 'a']));
const literal = { toJSON: () => 'L' };
console.log(JSON.stringify(literal), JSON.stringify([literal]), JSON.stringify([new Keyed()]), JSON.stringify({ k: new Keyed() }), JSON.stringify({ a: 1 }, null, 2));
