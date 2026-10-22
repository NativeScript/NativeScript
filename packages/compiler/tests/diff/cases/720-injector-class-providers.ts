// Injectors made from one provider list (classes, useClass, useValue, useFactory, useExisting), as each instance of a
// component with providers makes its own: each injector makes its own instances, a service injects another from the
// injector that made it, and what an injector doesn't provide comes from its parent.
import '@angular/compiler';
import { Injectable, InjectionToken, Injector, inject, runInInjectionContext } from '@angular/core';

const LABEL = new InjectionToken<string>('LABEL');
const SIZE = new InjectionToken<number>('SIZE');
const ALIAS = new InjectionToken<Counter>('ALIAS');
let made = 0;

@Injectable()
class Counter {
  readonly id = ++made;
  count = 0;
  bump(): number {
    return ++this.count;
  }
}

@Injectable()
class Panel {
  readonly counter = inject(Counter);
  readonly label = inject(LABEL);
  readonly size = inject(SIZE);
  describe(): string {
    return `${this.label}/${this.size}: counter ${this.counter.id} at ${this.counter.bump()}`;
  }
}

const outer = Injector.create({ providers: [{ provide: LABEL, useValue: 'outer' }] });
const providers = [Counter, Panel, { provide: SIZE, useFactory: () => 10 + made }, { provide: ALIAS, useExisting: Counter }];
const first = Injector.create({ providers, parent: outer });
const second = Injector.create({ providers, parent: outer });

runInInjectionContext(first, () => {
  const panel = inject(Panel);
  console.log('first', panel.describe(), panel.describe());
  console.log('first keeps one of each', inject(Panel) === panel, inject(Counter) === panel.counter, inject(ALIAS) === panel.counter);
});
runInInjectionContext(second, () => {
  console.log('second', inject(Panel).describe());
});
console.log('distinct', first.get(Panel) !== second.get(Panel), first.get(Counter) !== second.get(Counter));

const child = Injector.create({ providers: [{ provide: Counter, useClass: Counter }, { provide: LABEL, useValue: 'inner' }], parent: first });
console.log('child', child.get(Counter).id, child.get(Counter) !== first.get(Counter), child.get(Panel) === first.get(Panel), child.get(LABEL));
console.log('made', made);
