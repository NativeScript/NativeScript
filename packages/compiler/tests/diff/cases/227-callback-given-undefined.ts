// A callback whose parameter its type calls present, given undefined by untyped code: called all the same, as in script.
const callbacks: any[] = [];
function keep(cb: (v: string) => void) {
  callbacks.push(cb);
}
keep((v) => console.log('got', v === undefined ? 'undefined' : v));
keep(() => console.log('ignored'));
for (const cb of callbacks) cb(undefined);

Promise.resolve().then((v: void) => console.log('then', v === undefined));
new Promise<void>((resolve) => resolve()).then(() => console.log('resolved'));
