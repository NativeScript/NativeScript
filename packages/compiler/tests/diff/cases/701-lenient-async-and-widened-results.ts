// @app-lenient
// A non-strict app's async and generator methods give a promise or an iterator even where their bodies return nothing;
// a method that may give null (a signal made with null) is read where a value of its type is wanted.
import { signal } from '@angular/core';
class Card {
  constructor(public id: number, public title: string) {}
  describe() {
    return `card ${this.id}`;
  }
}
class Shelf {
  constructor(public card: Card) {}
}
const show = (c: Card) => (c ? c.title : 'none');
class Board {
  leaving = false;
  readonly selected = signal<Card>(null);
  async settle(step: number) {
    if (this.leaving) {
      return;
    }
    await Promise.resolve(step);
    if (step > 1) return;
    console.log('settled', step);
  }
  async quiet() {}
  async find(id: number): Promise<Card> {
    await Promise.resolve();
    return new Card(id, 'found');
  }
  async failing() {
    if (this.leaving) return;
    throw new Error('boom');
  }
  *ids(limit: number) {
    if (limit < 1) return;
    yield limit;
  }
  current(): Card {
    return this.selected();
  }
}
async function prepare(b: Board) {
  if (b.leaving) return;
  console.log('prepared');
}
const b = new Board();
b.settle(1).catch(() => console.log('never'));
b.settle(2).finally(() => console.log('finally 2'));
b.quiet().then(() => console.log('quiet'));
b.find(3).then((c) => console.log('find 3', c.title));
b.failing().catch((e) => console.log('caught', e.message));
prepare(b).then(() => console.log('prepare done'));
console.log([...b.ids(2)], b.ids(0).next().done);
b.leaving = true;
b.failing().then((v) => console.log('left', v === undefined));
console.log('current', b.current() === null);
b.selected.set(new Card(7, 'seven'));
console.log(show(b.current()), b.current().describe(), new Shelf(b.current()).card.id, `${b.current().title}`);
if (b.current()) console.log('guarded', new Shelf(b.current()).card.title);
