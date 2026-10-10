// @lenient
// A class inside a namespace whose getter is read untyped (core's xml2ui parsers): the getter's value.
export namespace parsers {
  export class Collector {
    private _value: string[] = [];
    get value(): string[] {
      return this._value;
    }
    add(s: string) {
      this._value.push(s);
    }
  }
}
const c = new parsers.Collector();
c.add('a');
c.add('b');
const untyped: any = c;
console.log(untyped.value.length, untyped['value'].join('+'));
