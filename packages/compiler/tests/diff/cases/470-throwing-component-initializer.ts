// A component class whose field initializer throws, made in callbacks: the error reaches the uncaught-error
// handler, as NativeScript reports it, and the program goes on; the next component made works.
const reported: string[] = [];
(globalThis as any).__onUncaughtError = (e: unknown) => {
  reported.push(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
  console.log('uncaught:', reported[reported.length - 1]);
};

let configuredMax = 0;

function limit(value: number): number {
  if (value <= 0) throw new RangeError(`limit must be positive, got ${value}`);
  return value;
}

class Gauge {
  readonly max = limit(configuredMax);
  value = 0;
  render(): string {
    return `${this.value}/${this.max}`;
  }
}

class Badge {
  label = 'new';
  render(): string {
    return `[${this.label}]`;
  }
}

const views: string[] = [];
setTimeout(() => {
  const gauge = new Gauge();
  views.push(gauge.render());
  console.log('not reached', gauge.render());
}, 0);
setTimeout(() => {
  views.push(new Badge().render());
  console.log('badge', views.join(' '));
}, 5);
setTimeout(() => {
  try {
    new Gauge();
  } catch (e) {
    console.log('caught', (e as Error).name, (e as Error).message);
  }
  configuredMax = 3;
  console.log('gauge', new Gauge().render(), 'reported', reported.length);
}, 10);
