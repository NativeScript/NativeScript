// An @Injectable service extending a generic class, made through inject() in an injection context: the base's
// constructor given arguments by super(), a field initialized from an inherited method, an inherited method called on the
// injected instance, an override calling super, and the instance kept once made.
import '@angular/compiler';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';

class StateHolder<T extends object> {
  protected state: T;
  private changes = 0;
  constructor(initial: T, readonly label: string) {
    this.state = initial;
  }
  get(): T {
    return this.state;
  }
  update(next: (state: T) => T): void {
    this.state = next(this.state);
    this.changes++;
  }
  changeCount(): number {
    return this.changes;
  }
  describe(): string {
    return `${this.label}: ${JSON.stringify(this.state)}`;
  }
}

interface Profile {
  name: string;
  visits: number;
}

@Injectable({ providedIn: 'root' })
class Greeter {
  greet(name: string): string {
    return `hello ${name}`;
  }
}

@Injectable({ providedIn: 'root' })
class ProfileStore extends StateHolder<Profile> {
  private greeter = inject(Greeter);
  readonly initialName = this.get().name;

  constructor() {
    super({ name: 'ada', visits: 0 }, 'profile');
  }

  visit(): string {
    this.update((s) => ({ ...s, visits: s.visits + 1 }));
    return this.greeter.greet(this.get().name);
  }

  override describe(): string {
    return `[${super.describe()}]`;
  }
}

const injector = Injector.create({
  providers: [
    { provide: Greeter, useClass: Greeter },
    { provide: ProfileStore, useClass: ProfileStore },
  ],
});
runInInjectionContext(injector, () => {
  const store = inject(ProfileStore);
  console.log(store.visit(), store.visit());
  store.update((s) => ({ ...s, name: 'grace' }));
  console.log(store.get().name, store.get().visits, store.label);
  console.log(store.describe());
  console.log(store.initialName, store.changeCount());
  console.log(inject(ProfileStore) === store, store instanceof StateHolder);
});
