// An object literal with its own toString or valueOf: string and number conversions call them, as script does.
const money = {
  amount: 5,
  toString() {
    return `$${this.amount}`;
  },
  valueOf() {
    return this.amount;
  },
};
console.log(`${money}`, String(money), money + '', +money, Number(money));
money.amount = 7;
console.log('changed', `${money}`, +money);
const tag = { toString: () => 'tag' };
console.log('x' + tag, [tag, tag].join(','), `${tag}`, String([tag]));
const label = { name: 'n', toString(): string { return 'label ' + this.name; } };
const parts: string[] = [];
parts.push(`${label}`);
console.log(parts[0], JSON.stringify(label), `${{ toString: () => 'inline' }}`);
const plain = { a: 1 };
console.log(`${plain}`, String(plain));
const from = { valueOf: () => 1 };
const pattern = { toString: () => 'b' };
// @ts-ignore: an untyped program passes them where a number and a string are taken.
const found = [0, true, 1].indexOf(true, from), at = 'abc'.indexOf(pattern), char = 'abc'.charAt(from);
console.log('arguments', found, at, char);
class AppError extends Error {}
const errors: Error[] = [new Error('plain'), new TypeError('typed'), new AppError('app'), new Error()];
console.log('errors', errors.map((e) => e.toString()).join(' | '), 'text'.toString());
try {
  JSON.parse('{');
} catch (e) {
  console.log('caught', (e as Error).toString().startsWith('SyntaxError'));
}
