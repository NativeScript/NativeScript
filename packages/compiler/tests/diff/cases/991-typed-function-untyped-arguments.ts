// A typed function held untyped and called by untyped code with null and an object literal, as core's handlers are
// given what reaches them through `any[]`: each argument arrives as the parameter's type has it.
interface Size {
  width: number;
}
const handlers: Function[] = [];
function add<K extends 'measure'>(_name: K, handler: { measure(size: Size | null, label: string | null): string }[K]) {
  handlers.push(handler);
}
add('measure', (size: Size | null, label: string | null) => `${size === null ? 'none' : size.width}/${label ?? '-'}`);
const args: any[] = [null, null];
console.log(handlers.map((h) => h.apply(undefined, args)).join(' '));
console.log(handlers.map((h) => h.call(undefined, { width: 3 }, 'w')).join(' '));
console.log(handlers.map((h) => h.bind(undefined, null)('b')).join(' '));
