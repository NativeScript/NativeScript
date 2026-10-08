// @swift
// `??=` read as a value: never nullish after it, and what it gives typed as the target.
interface Entry {
  value: unknown;
  at: number;
}
const SLOT = '__slot__';
const scope = globalThis as unknown as { [SLOT]?: Map<string, Entry> };
let cache: Map<string, Entry> | undefined;
function keep(key: string, value: unknown) {
  (scope[SLOT] ??= new Map()).set(key, { value, at: 1 });
  (cache ??= new Map()).set(key, { value, at: 2 });
}
keep('a', 1);
keep('b', 'two');
console.log(scope[SLOT]!.size, scope[SLOT]!.get('b')!.value, cache!.get('a')!.at);
const queue: (cb: () => void) => void = (cb) => Promise.resolve().then(cb);
queue(() => console.log('queued'));
