// @swift
// A `var` loop variable is one binding the loop's closures share; a `let` one is fresh per iteration.
const gs: (() => number)[] = [];
function f() {
  for (var j = 0; j < 3; j++) gs.push(() => j);
}
f();
const hs: (() => number)[] = [];
for (let k = 0; k < 3; k++) hs.push(() => k);
const ks: (() => string)[] = [];
function g() {
  for (var i = 0, s = 'a'; i < 2; i++, s += 'b') ks.push(() => s + i);
  return i;
}
console.log(gs.map((x) => x()), hs.map((x) => x()), g(), ks.map((x) => x()));
