// `new Date(value)` of a value typed neither number nor string: a string parsed, a date's time copied, else its number.
const values: any[] = ['2024-05-06T00:00:00.000Z', 0, null, true, 'nonsense'];
console.log(values.map((v) => new Date(v).getTime()).join(' '));
const original = new Date(86400000);
const copy = new Date(original);
copy.setTime(0);
console.log(original.getTime(), copy.getTime(), copy !== original);
const stamp: string | number = Math.random() < 2 ? '1970-01-02T00:00:00Z' : 0;
console.log(new Date(stamp).getTime());
