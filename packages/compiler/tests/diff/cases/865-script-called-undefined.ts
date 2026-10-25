// A string, number or boolean parameter of a function script calls, given undefined: undefined, as in script.
const handlers: unknown[] = [];
handlers.push((n: number, s: string) => console.log('direct', n === undefined, typeof s, s));
for (const h of handlers as any[]) h(undefined);
function run(cb: (n: number) => string) {
  const held: (n: number) => string = cb;
  const box: any = { held: held };
  const f = box.held;
  console.log(cb(2), f(undefined));
}
run((n) => `n=${n}`);
function flag(on: boolean) { console.log('flag', on === undefined ? 'unset' : on); }
const flags: any = { flag };
flags.flag(undefined);
flags.flag(true);

// Its value reaching script through a function given for one that does, or through an object script reads.
function named(v: string) { console.log('named', v ? v.length : v); }
const store: any[] = [];
function keepAll(cb: (v: string) => void) { store.push(cb); cb('abc'); }
keepAll((v) => console.log('typed', v));
keepAll(named);
function relay(cb: (v: string) => void) { const held: (v: string) => void = cb; const box: any = { held, again: held }; box.held(undefined); box.again(undefined); }
relay((v) => console.log('relayed', typeof v));
for (const cb of store) cb(undefined);
