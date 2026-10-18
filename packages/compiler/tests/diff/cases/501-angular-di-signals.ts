// Angular's DI (Injector.create, InjectionToken, runInInjectionContext, inject, forwardRef, multi providers,
// parent/child hierarchy, self/skipSelf/optional), signals (signal, computed, linkedSignal), EventEmitter, and QueryList.
import {
  InjectionToken,
  Injector,
  runInInjectionContext,
  inject,
  forwardRef,
  resolveForwardRef,
  signal,
  computed,
  linkedSignal,
  EventEmitter,
} from '@angular/core';
import { QueryList } from './helpers/angular.ts';

const API_URL = new InjectionToken<string>('API_URL');
const DEFAULT_PORT = new InjectionToken<number>('DEFAULT_PORT', { providedIn: 'any', factory: () => 8080 });
const ALIAS_URL = new InjectionToken<string>('ALIAS_URL');
const ENDPOINT = new InjectionToken<string>('ENDPOINT');
const PLUGINS = new InjectionToken<string[]>('PLUGINS');
const MISSING = new InjectionToken<string>('MISSING');
const CHILD_ONLY = new InjectionToken<string>('CHILD_ONLY');

const FWD_TOKEN = forwardRef(() => API_URL);
console.log('forwardRef resolved:', resolveForwardRef(FWD_TOKEN) === API_URL);

const rootInjector = Injector.create({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' },
    { provide: ALIAS_URL, useExisting: API_URL },
    { provide: ENDPOINT, useFactory: (url: string, port: number) => `${url}:${port}/v1`, deps: [API_URL, DEFAULT_PORT] },
    { provide: PLUGINS, useValue: 'auth', multi: true },
    { provide: PLUGINS, useValue: 'cache', multi: true },
  ],
});

console.log('api:', rootInjector.get(API_URL));
console.log('alias:', rootInjector.get(ALIAS_URL));
console.log('port:', rootInjector.get(DEFAULT_PORT));
console.log('endpoint:', rootInjector.get(ENDPOINT));
console.log('plugins:', rootInjector.get(PLUGINS).join(','));
console.log('missing fallback:', rootInjector.get(MISSING, 'fallback-val'));
console.log('missing optional:', rootInjector.get(MISSING, null, { optional: true }) === null);

const childInjector = Injector.create({
  providers: [
    { provide: API_URL, useValue: 'https://staging.example.com' },
    { provide: CHILD_ONLY, useValue: 'child-secret' },
  ],
  parent: rootInjector,
});

console.log('child api:', childInjector.get(API_URL));
console.log('child skipSelf api:', childInjector.get(API_URL, 'none', { skipSelf: true }));
console.log('child self childOnly:', childInjector.get(CHILD_ONLY, 'none', { self: true }));
console.log('child self alias:', childInjector.get(ALIAS_URL, 'not-on-self', { self: true }));
console.log('child parent alias:', childInjector.get(ALIAS_URL));

const inCtx = runInInjectionContext(childInjector, () => {
  const url = inject(API_URL);
  const secret = inject(CHILD_ONLY);
  const opt = inject(MISSING, { optional: true }) ?? 'none';
  return `${url}|${secret}|${opt}`;
});
console.log('runInInjectionContext:', inCtx);

const count = signal(2);
const doubled = computed(() => count() * 2);
const linked = linkedSignal(() => count() * 10);
console.log('signals initial:', count(), doubled(), linked());
linked.set(99);
console.log('linked overridden:', linked());
count.update((n) => n + 3);
console.log('signals updated:', count(), doubled(), linked());

const emitter = new EventEmitter<string>();
const emitted: string[] = [];
const sub1 = emitter.subscribe((v: string) => emitted.push(`fn:${v}`));
const sub2 = emitter.subscribe({ next: (v: string) => emitted.push(`obj:${v}`) });
emitter.emit('hello');
sub1.unsubscribe();
emitter.emit('world');
sub2.unsubscribe();
emitter.emit('ignored');
console.log('emitted:', emitted.join(','));

const ql = new QueryList();
const qlEvents: string[] = [];
ql.changes.subscribe((list) => qlEvents.push(`cb:${list.length}`));
ql.changes.subscribe({ next: (list) => qlEvents.push(`obs:${list.length}:${list.first}-${list.last}`) });
ql.$add('k1', 'alpha');
ql.$add('k2', 'beta');
ql.notifyOnChanges();
console.log('queryList:', ql.toArray().join(','), '|', qlEvents.join('|'));
