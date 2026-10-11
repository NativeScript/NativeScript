// @swift
// An object literal's own valueOf and toString are what ToPrimitive calls.
const price = { amount: 5, valueOf() { return this.amount; }, toString() { return 'five'; } };
const label = { toString() { return 'label'; } };
const anyPrice: any = price;
console.log(`${price}`, `${label}`, String(label), 'is ' + label, anyPrice + 1, anyPrice * 2, anyPrice > 4, '' + anyPrice);
const untyped: any = { n: 2, valueOf() { return 7; }, toString() { return 'seven'; } };
console.log(untyped + 1, `${untyped}`, untyped * 3, String(untyped), untyped < 8);
