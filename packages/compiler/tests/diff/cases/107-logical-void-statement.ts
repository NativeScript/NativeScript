// `test && call()` and `test || call()` as statements, the call giving nothing.
let count = 0;
function bump(by: number): void {
  count += by;
}
function check(value?: number) {
  value !== undefined && bump(value);
  value === undefined || bump(1);
  value !== undefined && value > 2 && value < 10 && bump(100);
}
check();
check(1);
check(5);
console.log(count);
