// `toSorted`: a sorted copy, the original left as it was (state shown sorted without being changed).
interface Product { name: string; price: number }
const products: Product[] = [
  { name: 'lamp', price: 30 },
  { name: 'desk', price: 120 },
  { name: 'chair', price: 45 },
];
const byPrice = products.toSorted((a, b) => a.price - b.price);
console.log(byPrice.map((p) => p.name).join(','), products.map((p) => p.name).join(','));
console.log(byPrice !== products, byPrice[0] === products[0]);
const tags = ['beta', 'Alpha', 'gamma', 'alpha'];
console.log(tags.toSorted().join(','), tags.join(','));
console.log([10, 9, 100, 1].toSorted().join(','), [10, 9, 100, 1].toSorted((a, b) => a - b).join(','));
