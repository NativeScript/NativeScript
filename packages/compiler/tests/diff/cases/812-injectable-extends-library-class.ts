// @swift
// An @Injectable service extending a library's generic class (@ngrx/component-store's ComponentStore<T>), made through
// inject() and used through the members it inherits: its constructor's super call, patchState, select, updater and get.
import '@angular/compiler';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

interface CartState {
  items: string[];
  discount: number;
}

@Injectable()
class CartStore extends ComponentStore<CartState> {
  readonly count$ = this.select((s) => s.items.length);
  readonly add = this.updater((state, item: string) => ({ ...state, items: [...state.items, item] }));

  constructor() {
    super({ items: ['apple'], discount: 0 });
  }

  summary(): string {
    const s = this.get();
    return `${s.items.join('+')}@${s.discount}%`;
  }
}

const injector = Injector.create({ providers: [{ provide: CartStore, useClass: CartStore }] });
runInInjectionContext(injector, () => {
  const store = inject(CartStore);
  const counts: number[] = [];
  store.count$.subscribe((n) => counts.push(n));
  store.add('pear');
  store.patchState({ discount: 15 });
  store.setState((s) => ({ ...s, items: [...s.items, 'fig'] }));
  console.log(store.summary());
  console.log(counts.join(','));
  console.log(inject(CartStore) === store, store instanceof ComponentStore);
});
