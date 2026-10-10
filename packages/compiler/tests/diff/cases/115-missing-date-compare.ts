// @lenient
// Dates compared where one may be undefined (core's date-picker equality): false, as NaN compares.
const same = (x: Date, y: Date): boolean => x <= y && x >= y;
const d = new Date(2020, 1, 2);
console.log(same(d, new Date(2020, 1, 2)), same(undefined, d), same(d, undefined), same(undefined, undefined));
