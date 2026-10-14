// Error classes held as values: tested with instanceof, named, and compared with an error's constructor.
function isKind(e: unknown, C: ErrorConstructor): boolean { return e instanceof C; }
console.log(isKind(new TypeError('x'), TypeError), isKind(new RangeError('x'), TypeError), isKind(new TypeError('x'), Error), isKind('s', Error));
const handled: ErrorConstructor[] = [TypeError, RangeError];
console.log(new TypeError('x').constructor.name, TypeError.name, handled.map((c) => c.name).join(','));
const failure = new RangeError('r');
console.log(failure.constructor === RangeError, failure.constructor === Error, handled.some((c) => failure instanceof c));
class AppError extends Error {}
const app = new AppError('a');
console.log(app.constructor === AppError, app.constructor === Error, app instanceof Error, app.constructor.name);
const toText: (v: unknown) => string = String;
const toNumber = Number;
console.log(toText(12), toNumber('7') + 1, ['3', '4'].map(Number).reduce((x, y) => x + y, 0), [1, 2].map(String).join(''));
