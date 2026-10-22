// A call's possibly-undefined result cast to an optional type (`as F | undefined`) stays undefined.
function popResultSelector(args: unknown[]): ((...a: unknown[]) => unknown) | undefined {
  return typeof args[args.length - 1] === 'function' ? (args.pop() as (...a: unknown[]) => unknown) : undefined;
}
const none = popResultSelector([1, 2]) as ((...a: any[]) => number) | undefined;
const some = popResultSelector([1, (x: number) => x * 2]) as ((...a: any[]) => number) | undefined;
console.log(none === undefined, some ? some(21) : 'none');
