// An override declaring an optional parameter over a base method whose parameter has a default, called without it
// through both types; and the reverse (a default over an optional).
class Emitter {
  on(event: string, tag = 'base'): string {
    return `${event}:${tag}`;
  }
  off(event: string, tag?: string): string {
    return `${event}-${tag ?? 'none'}`;
  }
}

class Tagged extends Emitter {
  on(event: string, tag?: string): string {
    return `tagged(${super.on(event, tag)}|${tag === undefined})`;
  }
  off(event: string, tag = 'sub'): string {
    return `sub(${super.off(event, tag)})`;
  }
}

const t = new Tagged();
const e: Emitter = t;
console.log(t.on('a'), t.on('b', 'x'));
console.log(e.on('c'), e.on('d', 'y'));
console.log(new Emitter().on('e'));
console.log(t.off('f'), e.off('g'), e.off('h', 'z'), new Emitter().off('i'));

// Two different constant defaults: the one of the method that runs, whatever type the call goes through.
class Step {
  next(n = 1, wrap = false): string {
    return `step ${n} ${wrap}`;
  }
}
class BigStep extends Step {
  next(n = 10, wrap = true): string {
    return `big ${n} ${wrap} ${super.next()} ${super.next(n)}`;
  }
}
const steps: Step[] = [new Step(), new BigStep()];
console.log(steps.map((s) => s.next()).join(' / '));
console.log(steps.map((s) => s.next(3)).join(' / '));
console.log(steps.map((s) => s.next(undefined, false)).join(' / '));
