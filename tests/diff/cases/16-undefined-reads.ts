// Reading past the end of an array is undefined, not an error.
interface Fruit {
  name: string;
  price: number;
}
const nums = [1, 2, 3];
const words = ['a', 'b'];
const fruits: Fruit[] = [{ name: 'fig', price: 2 }];

console.log(nums[5], words[2], nums[-1], nums[1.5], nums[1]);
console.log(nums[5] === undefined, words[9] == null, nums[0] !== undefined);
console.log(nums[7] ?? 'none', words[3] ?? 'none', words[1] ?? 'none');
console.log(nums[4] + 1, `${words[4]}!`, 'x' + words[5], String(nums[9]));
console.log(!nums[3], !!nums[2], words[8] ? 'yes' : 'no');

const missing = fruits[3];
if (!missing) console.log('no fruit at 3');
console.log(missing === undefined, missing?.name ?? 'unnamed', fruits[0]?.name, fruits[2]?.price);
const first = fruits[0];
if (first) console.log(first.name, first.price);

function at<T>(list: T[], i: number): T | undefined {
  return list[i];
}
console.log(at(nums, 10), at(words, 0));

let total = 0;
for (let i = 0; i <= nums.length; i++) total += nums[i] ?? 100;
console.log(total);
const last = nums[nums.length];
console.log(typeof last, last);
