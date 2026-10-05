// Array callbacks that take the array as their third argument.
const xs = [3, 1, 4, 1, 5];
console.log(xs.find((v, i, a) => v > a[0]), xs.findIndex((v, i, a) => a.length - i === 2));
console.log(xs.some((v, i, a) => v === a[a.length - 1] && i > 0), xs.every((v, i, a) => a.indexOf(v) <= i));
console.log(xs.filter((v, i, a) => a.indexOf(v) === i).join(','), xs.map((v, i, a) => v + a.length).join(','));
const seen: string[] = [];
xs.forEach((v, i, a) => seen.push(`${v}/${a.length}`));
console.log(seen.join(' '));
class Holder {
  items = ['a', 'b', 'c'];
  matches(): boolean {
    return this.items.every((value: string, index: number, array: string[]) => array === this.items && value === this.items[index]);
  }
  where(name: string): number {
    return this.items.findIndex((value, index, array) => array[index] === name);
  }
}
console.log(new Holder().matches(), new Holder().where('c'));
