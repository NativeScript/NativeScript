// Plain methods of decorated classes (an @Injectable service) taking and giving values that may be
// null or undefined both: an array, a string and an object of the program's own class, given null, undefined and a
// value, from the program's own calls.
import '@angular/compiler';
import { Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';

class Person {
  constructor(readonly name: string, readonly notableAchievements: string[] = []) {}
}

@Injectable({ providedIn: 'root' })
class Formatter {
  readonly person = signal<Person | null>(null);
  // As a template's binding calls it: `[text]="formatAchievements(person()?.notableAchievements)"`.
  shown(): string {
    return this.formatAchievements(this.person()?.notableAchievements);
  }
  formatAchievements(achievements: string[] | undefined | null): string {
    if (!achievements || !Array.isArray(achievements)) return '';
    return achievements.map((a, index) => index + 1 + '. ' + a.trim()).join('\n');
  }
  count(achievements: string[] | undefined | null): number {
    return achievements?.length ?? -1;
  }
  label(name: string | null | undefined): string {
    return name === null ? '(null)' : name === undefined ? '(undefined)' : name;
  }
  pick(which: number): string | null | undefined {
    return which === 0 ? null : which === 1 ? undefined : 'picked';
  }
  who(p: Person | null | undefined): string {
    return p === null ? 'nobody' : p === undefined ? 'unknown' : p.name;
  }
}

const injector = Injector.create({ providers: [{ provide: Formatter, useClass: Formatter }] });
runInInjectionContext(injector, () => {
  const f = inject(Formatter);
  const lists: (string[] | undefined)[] = [[' Analytical Engine', 'Notes '], undefined];
  console.log(JSON.stringify(f.formatAchievements(lists[0])));
  console.log(JSON.stringify(f.formatAchievements(lists[1])));
  console.log(JSON.stringify(f.formatAchievements(null)));
  console.log(f.count(null), f.count(undefined), f.count(lists[0]));
  console.log(f.label(null), f.label(undefined), f.label('Ada'));
  for (let k = 0; k < 3; k++) {
    const r = f.pick(k);
    console.log(r === null, r === undefined, String(r), f.label(r));
  }
  console.log(JSON.stringify(f.shown()));
  f.person.set(new Person('Ada', ['First program ']));
  console.log(JSON.stringify(f.shown()));
  console.log(f.who(null), f.who(undefined), f.who(new Person('Grace')));
});
