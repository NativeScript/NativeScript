// Arrow functions as the operands of `?:`, `||` and `&&` and as a default parameter: each is a function value, so its body
// runs only when it is called.
const pick = Math.random() > 2;
let ran = 0;
function falls(label: string): void {
  ran++;
  console.log('falls ran', label);
}
const attempt = (f: () => unknown) => {
  console.log('attempt');
  f();
  console.log('called');
};
attempt(pick ? () => 1 : () => falls('a'));
attempt(pick ? () => 1 : (() => falls('b')));
attempt(!pick ? () => falls('c') : () => 2);
attempt(pick ? () => 1 : pick ? () => 2 : () => falls('d'));
const later: () => void = pick ? () => {} : () => falls('e');
console.log('before later', ran);
later();
const none: (() => void) | null = pick ? () => falls('x') : null;
const fallback = none || (() => falls('f'));
console.log('before fallback', ran);
fallback();
const present: (() => void) | null = pick ? null : () => falls('g0');
const chained = present && (() => falls('g'));
console.log('before chained', ran);
if (chained) chained();
function run(label: string, f: () => void = () => falls(label)) {
  console.log('run', label);
  f();
}
run('h');
console.log('ran', ran);
