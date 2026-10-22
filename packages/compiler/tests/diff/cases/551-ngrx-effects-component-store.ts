// @swift
// @ngrx/effects and @ngrx/component-store from source: Actions, ofType, createEffect, and ComponentStore.
import '@angular/compiler';
import { Subject, of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { createAction, props } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { ComponentStore } from '@ngrx/component-store';

const loadItems = createAction('[Items] Load', props<{ prefix: string }>());
const itemsLoaded = createAction('[Items] Loaded', props<{ items: string[] }>());
const ping = createAction('[Items] Ping');

const actionSource$ = new Subject<any>();
const actions$ = new Actions(actionSource$);
const log: string[] = [];

const loadEffect$ = createEffect(() =>
  actions$.pipe(
    ofType(loadItems),
    withLatestFrom(of('v1')),
    mergeMap(([action, version]) =>
      of(itemsLoaded({ items: [`${action.prefix}-a-${version}`, `${action.prefix}-b-${version}`] })),
    ),
  ),
);

loadEffect$.subscribe((dispatched) => {
  log.push(`effect=${dispatched.type}:${dispatched.items.join(',')}`);
});

actionSource$.next(ping());
actionSource$.next(loadItems({ prefix: 'item' }));

interface CartState {
  items: string[];
  discount: number;
}

const cartStore = new ComponentStore<CartState>({ items: ['apple'], discount: 10 });
const items$ = cartStore.select((s) => s.items);
const summary$ = cartStore.select(
  items$,
  cartStore.select((s) => s.discount),
  (items, discount) => `${items.join('+')}@${discount}%`,
);

const addItem = cartStore.updater((state, item: string) => ({
  ...state,
  items: [...state.items, item],
}));

summary$.subscribe((s) => log.push(`cart=${s}`));
addItem('banana');
cartStore.patchState({ discount: 25 });
cartStore.setState((s) => ({ ...s, items: s.items.slice(1) }));

const appendAll = cartStore.effect<string[]>((batch$) =>
  batch$.pipe(
    map((list) => {
      for (const item of list) addItem(item);
    }),
  ),
);
appendAll(['cherry', 'date']);

console.log(log.join('\n'));
