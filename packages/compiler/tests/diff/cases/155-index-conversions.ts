// @swift
// Numbers where an index, a length, digits or a radix is taken: JavaScript's integer conversion and its RangeErrors.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, 'caught', (e as Error).name);
  }
}
const huge = parseInt('99999999999999999999');
attempt('slice', () => 'abcdef'.slice(0, huge));
attempt('slice -inf', () => 'abcdef'.slice(-Infinity, 2));
attempt('substring', () => 'abcdef'.substring(NaN, huge));
attempt('charAt NaN', () => 'abc'.charAt(NaN));
attempt('charAt big', () => 'abc'.charAt(1e20));
attempt('charAt -1', () => 'abc'.charAt(-1));
attempt('codePointAt', () => 'abc'.codePointAt(1e20));
attempt('at', () => 'abc'.at(-1e20));
attempt('padStart', () => 'x'.padStart(1e20));
attempt('padEnd', () => 'x'.padEnd(Infinity, '-'));
attempt('padStart ok', () => '7'.padStart(3, '0'));
attempt('repeat', () => 'ab'.repeat(1e300));
attempt('array at', () => [1, 2, 3].at(-Infinity));
attempt('lastIndexOf', () => [1, 2, 3].lastIndexOf(1, -1e300));
attempt('new Array(-1)', () => new Array(-1).length);
attempt('new Array(1e20)', () => new Array(1e20).length);
attempt('new Array(1.5)', () => new Array(1.5).length);
let n = 3;
attempt('new Array(n)', () => new Array(n).length);
attempt('toFixed', () => (1.5).toFixed(200));
attempt('toFixed n', () => (1.5).toFixed(n - 1));
attempt('toPrecision', () => (1.5).toPrecision(0));
attempt('toString', () => (255).toString(37));
attempt('toString 16', () => (255).toString(16));
const nums: number[] = [1, 2, 3];
attempt('length', () => { nums.length = -1; return nums.length; });
attempt('length ok', () => { nums.length = n - 1; return nums.join(); });
attempt('index -1', () => { nums[-1] = 9; return [nums.length, nums[-1]].join(); });
attempt('index 1.5', () => { nums[1.5] = 4; return [nums.length, nums[1.5]].join(); });
