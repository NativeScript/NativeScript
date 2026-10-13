// A getter of a class read by a name only known at run time, as a binding reads a list item's `{{ label }}`:
// `'label' in item` first, then the value.
// @members-by-name
class Fruit {
  constructor(
    public name: string,
    public count: number,
  ) {}

  get label(): string {
    return `${this.name} (${this.count})`;
  }
}

function read(source: any, key: string): any {
  return source[key];
}

const fruit = new Fruit('Apple', 3);
const untyped: any = fruit;
console.log(read(fruit, 'label'), read(fruit, 'name'), read(fruit, 'count'));
console.log(untyped.label, 'label' in untyped, typeof untyped['label']);
fruit.count++;
console.log(read(fruit, 'label'), Object.keys(fruit).join(','));
const items: any[] = [new Fruit('Banana', 5), new Fruit('Cherry', 12)];
console.log(items.map((item) => read(item, 'label')).join(' | '));

// A typed array field read untyped, as ListView reads its `items`: length, then each item and its getter.
class Basket {
  readonly items = [new Fruit('Date', 7), new Fruit('Fig', 2)];
}
const basket: any = new Basket();
const list = read(basket, 'items');
console.log(read(list, 'length'), typeof read(list, 'getItem'), read(list[1], "label"));
for (let i = 0; i < list.length; i++) console.log(read(list[i], 'label'));
