// An object literal with its own toString or valueOf, used as a string or a number.
const money = { cents: 250, toString() { return '$' + (this.cents / 100).toFixed(2); } };
const size = { px: 12, valueOf() { return this.px; } };
console.log(`${money}`, 'total ' + money, String(money), size.valueOf() * 2, +size + 1);
const items = [{ name: 'a', toString: () => 'item a' }];
console.log(items.join('|'), `${items[0]}`);
