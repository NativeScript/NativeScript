// @swift
// An empty slot of a number or string array reads undefined: `??`, `=== undefined`, join, JSON and untyped reads.
const nums: number[] = [];
nums[2] = 5;
const a = [1, 2, 3];
a.length = 1;
a.length = 3;
console.log(nums[0] ?? 'dflt', nums[0] === undefined, nums[2] === undefined, nums.join(), a[2], a.join('-'), JSON.stringify(nums));
const v: any = nums[1];
console.log(v, typeof v, nums.length, String(a[1]));
const strs: string[] = [];
strs[1] = 'x';
console.log(strs.length, strs[0] ?? 'none', strs[0] === undefined, strs.join('|'), JSON.stringify(strs));
const reversed: string[] = [];
for (let i = 2; i >= 0; i--) reversed[i] = 'r' + i;
console.log(reversed.join(), reversed.length);
const made = new Array<number>(3);
made[1] = 4;
console.log(made.join(), made[0] === undefined, made[1]);
const widths: number[] = [];
widths[1] = 10;
let total = 0;
for (let i = 0; i < widths.length; i++) total += widths[i] ?? 0;
console.log(total, (nums[0] as number) + 1, Number.isNaN(nums[0] * 2));
