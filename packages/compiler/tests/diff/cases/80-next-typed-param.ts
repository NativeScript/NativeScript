// @lenient
// A class whose `next` takes a typed value: a pipeline stage, not an iterator script steps (core's XML builder).
class ParserEvent {
  constructor(public name: string) {}
}
interface Consumer {
  parse(e: ParserEvent): void;
}
class Producer {
  private _next: Consumer;
  pipe<T extends Consumer>(next: T): T {
    this._next = next;
    return next;
  }
  next(e: ParserEvent) {
    this._next.parse(e);
  }
}
class Collector implements Consumer {
  seen: string[] = [];
  parse(e: ParserEvent) {
    this.seen.push(e.name);
  }
}
const producer = new Producer();
const collector = producer.pipe(new Collector());
producer.next(new ParserEvent('a'));
producer.next(new ParserEvent('b'));
console.log(collector.seen.join(','));
