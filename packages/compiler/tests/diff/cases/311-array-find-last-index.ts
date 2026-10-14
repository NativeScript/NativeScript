// `findLastIndex`: where the last matching entry is, -1 when none is.
type Step = { label: string; done: boolean };
const steps: Step[] = [
  { label: 'account', done: true },
  { label: 'profile', done: true },
  { label: 'payment', done: false },
  { label: 'confirm', done: false },
];
const lastDone = steps.findLastIndex((s) => s.done);
console.log(lastDone, steps[lastDone].label);
console.log(steps.findLastIndex((s) => s.label.startsWith('x')));
console.log(steps.findLastIndex((s, i, all) => !s.done && i < all.length - 1));
const temps = [12.5, 14, 9.75, 14, 11];
console.log(temps.findLastIndex((t) => t === 14), temps.indexOf(14));
