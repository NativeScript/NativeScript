// @lenient
// A function field read before it is set, through a getter of a wider type (core's ListView `itemTemplateSelector`).
class List {
  private _selector: (item: any, index: number) => string;
  get selector(): string | ((item: any, index: number) => string) {
    return this._selector;
  }
  set selector(value: string | ((item: any, index: number) => string)) {
    this._selector = typeof value === 'string' ? () => value : value;
  }
}
const list = new List();
console.log(list.selector === undefined, typeof list.selector);
list.selector = (item, index) => item + index;
console.log(typeof list.selector, (list.selector as (item: any, index: number) => string)('row', 2));
