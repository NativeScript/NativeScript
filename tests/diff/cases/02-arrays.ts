// Arrays are references: every alias sees a mutation.
interface Item { name: string; qty: number }

function addTo(list: string[], value: string) {
  list.push(value);
}

const names: string[] = ['carrot', 'apple'];
const alias = names;
addTo(alias, 'banana');
console.log(names.length, names.join(' '), alias === names);

const holder = { items: names };
holder.items.push('date');
console.log(names);

const nums = [10, 9, 1, 100, 25];
nums.sort();
console.log(nums.join(','));
nums.sort((a, b) => a - b);
console.log(nums);
console.log(nums.map((n, i) => n * i), nums.filter((n) => n > 9), nums.reduce((a, b) => a + b, 0), nums.indexOf(25), nums.includes(NaN));
console.log(nums.slice(1, -1), nums.splice(1, 2, 7, 8), nums, nums.reverse());
console.log([1, 2, 3].concat([4, 5], 6), [[1, 2], [3]].flat(), [1, 2, 3].find((n) => n > 1), [3, 4].at(-1));

const items: Item[] = [{ name: 'b', qty: 2 }, { name: 'a', qty: 2 }, { name: 'c', qty: 1 }];
items.sort((x, y) => x.qty - y.qty);
console.log(items.map((i) => i.name).join(''));
const seen: number[] = [];
for (const n of nums) {
  if (seen.length < 3) nums.push(n * 2);
  seen.push(n);
}
console.log(seen.length, nums.length);
console.log(items.find((i) => i.name === 'a')?.qty, items.findIndex((i) => i.name === 'z'), items.some((i) => i.qty > 1), items.every((i) => i.qty > 1));
const letters: string[] = ['x', 'y', 'z', 'w', 'v'];
const [first, , third = 'none', ...rest] = letters;
console.log(first, third, rest);
const empty: number[] = [];
console.log(empty.length, empty.pop(), [1, 2, 3].shift(), [3].unshift(1, 2));
