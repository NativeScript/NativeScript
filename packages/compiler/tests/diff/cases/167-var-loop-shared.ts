// @kotlin
// `var` in a `for` loop is one binding for the whole function: closures see its last value.
const gs: (() => number)[] = [];
function f() {
  for (var j = 0; j < 3; j++) gs.push(() => j);
  return j;
}
console.log(f(), gs.map((g) => g()).join(','));
const hs: (() => number)[] = [];
for (let i = 0; i < 3; i++) hs.push(() => i);
console.log(hs.map((h) => h()).join(','));
