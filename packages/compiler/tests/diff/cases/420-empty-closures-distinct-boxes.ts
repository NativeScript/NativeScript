// Empty arrows of different function types are different functions. A release link folds their identical
// code into one, so a box keyed by code and captures alone answered for the other type: core's queueGC
// boxed `() => GC()` as CssState's empty `(view, name) => {}`, and called it without arguments.
class Node {
  name = 'node';
}
const onAttribute: (view: Node, name: string) => void = (view, name) => {};
const onTick: () => void = () => {};
const onFlag: (on: boolean) => void = (on) => {};

const attribute: any = onAttribute;
const tick: any = onTick;
const flag: any = onFlag;
console.log('lengths', attribute.length, tick.length, flag.length);
console.log('distinct', tick === attribute, flag === attribute, tick === flag);
tick.apply(null, []);
tick.call(null);
attribute.apply(null, [new Node(), 'x']);
console.log('same box again', (onTick as any) === tick, (onAttribute as any) === attribute);

function debounce(fn: any, delay: number) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(null, args);
      timer = undefined;
    }, delay);
  };
}
const queued = debounce(() => {}, 1);
queued();
setTimeout(() => console.log('debounced empty arrow ran'), 20);
