// @lenient
// A getter declared `string | undefined` gives undefined, not the text "undefined" (core's ParserEvent.namespace).
class Event {
  private _namespace: string | undefined;
  constructor(namespace?: string) {
    this._namespace = namespace;
  }
  get namespace(): string | undefined {
    return this._namespace;
  }
}
function label(name: string, namespace: string | undefined): string {
  return (typeof namespace === 'string' ? namespace + ':' : '') + name;
}
const plain = new Event(), scoped = new Event('ns');
console.log(label('Frame', plain.namespace), label('Frame', scoped.namespace), plain.namespace === undefined);
function parse(e: Event): string {
  let namespace = e.namespace;
  return typeof namespace === 'string' ? 'prefixed' : 'core';
}
console.log(parse(plain), parse(scoped));
