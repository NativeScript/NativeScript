// A timer's callback given the arguments after the delay, one giving a value, and a delay that is no number.
let done = false;
setTimeout((a: number, b: string) => console.log('args', a, b), 0, 7, 'x');
setTimeout(() => (done = true), 0);
// @ts-ignore
setTimeout(() => console.log('false delay', done), false);
const held: any = setTimeout;
console.log(typeof held, typeof clearTimeout);
