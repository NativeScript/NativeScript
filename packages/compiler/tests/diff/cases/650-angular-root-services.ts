// Angular services (@Injectable), one whose constructor cannot throw and one whose field initializer can, made by an
// injector's providers through inject() in its injection context, and kept once made.
import '@angular/compiler';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';

let made = 0;
function ready(ok: boolean): boolean {
  if (!ok) throw new Error('config not ready');
  return ok;
}

@Injectable({ providedIn: 'root' })
class CounterService {
  count = 0;
  constructor() {
    made++;
  }
  bump(): number {
    return ++this.count;
  }
}

@Injectable({ providedIn: 'root' })
class ConfigService {
  private ok = ready(made > 0);
  describe(): string {
    return `config ready ${this.ok}`;
  }
}

@Injectable({ providedIn: 'root' })
class ReportService {
  private counter = inject(CounterService);
  private config = inject(ConfigService);
  report(): string {
    return `bumped ${this.counter.bump()}, ${this.config.describe()}`;
  }
}

const injector = Injector.create({
  providers: [
    { provide: CounterService, useClass: CounterService },
    { provide: ConfigService, useClass: ConfigService },
    { provide: ReportService, useClass: ReportService },
  ],
});
runInInjectionContext(injector, () => {
  const counter = inject(CounterService);
  console.log('first bump', counter.bump());
  console.log('same instance', inject(CounterService) === counter);
  console.log(inject(ReportService).report());
  console.log('same config', inject(ConfigService) === inject(ConfigService));
});
console.log('made', made);
