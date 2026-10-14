// Number's toExponential: with and without a digit count, rounding and signs as JavaScript formats them.
const readings = [123.456, 0, 1e21, -0.00015, 5, 12345, 0.000001234, 299792458];
console.log(readings.map((n) => n.toExponential()).join(' '));
console.log(readings.map((n) => n.toExponential(2)).join(' '));
console.log((1.45).toExponential(1), (NaN).toExponential(2), (-Infinity).toExponential(), (255).toExponential(0));
try {
  (1).toExponential(101);
} catch (e) {
  console.log(e instanceof RangeError, (e as Error).message);
}
