// A promise of nothing settles with undefined: a then callback reads it, boxes it and passes it on as undefined.
Promise.resolve().then((v: void) => {
  console.log('then', v === undefined, v == null, v === null, v !== undefined, typeof v);
  console.log('value', v, String(v));
  const box: unknown[] = [v];
  console.log('boxed', box[0] === undefined, box.length);
});
new Promise<void>((resolve) => resolve()).then((v) => console.log('resolved', v === undefined));
async function nothing(): Promise<void> {}
nothing().then((v) => console.log('async', v === undefined, String(v)));
const p: Promise<unknown> = Promise.resolve().then(() => {});
p.then((v) => console.log('chained', v === undefined, typeof v));
Promise.all([nothing(), Promise.resolve(1)]).then(([a, b]) => console.log('all', a === undefined, b));
function log(...values: unknown[]) {
  console.log('rest', values.length, values[0] === undefined);
}
nothing().then(log);
async function awaited() {
  const v = await nothing();
  console.log('awaited', v === undefined);
  const u: unknown = await Promise.resolve().then(() => undefined);
  console.log('awaited unknown', u === undefined);
}
awaited();
