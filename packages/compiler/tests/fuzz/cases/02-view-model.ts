// A view model as templates use it: typed fields, getters that format them, a setter that validates,
// list items mapped and filtered through callbacks, and a total computed from fields.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}

interface Product {
  name: string;
  price: number;
  tags: string[];
  discount?: number;
  available: boolean;
}

class CartViewModel {
  title: string = 'Cart';
  items: Product[] = [];
  currency = '$';
  private _quantity = 1;
  selected: Product | null = null;

  get quantity(): number {
    return this._quantity;
  }
  set quantity(value: number) {
    this._quantity = value > 0 ? Math.floor(value) : 1;
  }
  get heading(): string {
    return `${this.title.toUpperCase()} (${this.items.length})`;
  }
  add(product: Product): number {
    this.items.push(product);
    return this.items.length;
  }
  priceOf(p: Product): number {
    const discount = p.discount ?? 0;
    return p.price * (1 - discount);
  }
  format(amount: number): string {
    return this.currency + amount.toFixed(2);
  }
  total(): string {
    const sum = this.items.filter((p) => p.available).map((p) => this.priceOf(p)).reduce((a, b) => a + b, 0);
    return this.format(sum * this.quantity);
  }
  labels(): string[] {
    return this.items.map((p, i) => `${i + 1}. ${p.name}${p.tags.length ? ' [' + p.tags.join('/') + ']' : ''}`);
  }
  select(name: string): string {
    this.selected = this.items.find((p) => p.name === name) ?? null;
    return this.selected ? this.selected.name : 'none';
  }
}

const vm = new CartViewModel();
attempt('add', () => vm.add({ name: 'Tea', price: 4.5, tags: ['hot'], available: true }));
attempt('add', () => vm.add({ name: 'Cake', price: 3, tags: [], discount: 0.5, available: true }));
attempt('add', () => vm.add({ name: 'Ice', price: 2, tags: ['cold', 'sweet'], available: false }));
attempt('heading', () => vm.heading);
attempt('labels', () => vm.labels().join('; '));
attempt('quantity', () => {
  vm.quantity = 2.7;
  return vm.quantity;
});
attempt('total', () => vm.total());
attempt('select', () => vm.select('Cake'));
attempt('select missing', () => vm.select('Soup'));
attempt('selected price', () => (vm.selected ? vm.format(vm.priceOf(vm.selected)) : 'no selection'));

function sortBy<T>(list: T[], key: (item: T) => number): T[] {
  return [...list].sort((a, b) => key(a) - key(b));
}
attempt('sorted', () => sortBy(vm.items, (p) => vm.priceOf(p)).map((p) => p.name).join(','));
const counts: Record<string, number> = {};
for (const p of vm.items) for (const t of p.tags) counts[t] = (counts[t] ?? 0) + 1;
attempt('tags', () => Object.keys(counts).sort().map((k) => `${k}=${counts[k]}`).join(' '));
