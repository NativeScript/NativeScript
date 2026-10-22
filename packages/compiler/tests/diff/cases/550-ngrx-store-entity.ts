// @swift
// @ngrx/store and @ngrx/entity from source: actions, reducers, selectors, features, Store, and EntityAdapter.
import '@angular/compiler';
import {
  createAction,
  createActionGroup,
  props,
  emptyProps,
  createReducer,
  on,
  createSelector,
  createFeatureSelector,
  createFeature,
  combineReducers,
  ActionsSubject,
  ReducerManager,
  ScannedActionsSubject,
  State,
  Store,
} from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

const increment = createAction('[Counter] Increment', props<{ by: number }>());
const reset = createAction('[Counter] Reset');

const TodoActions = createActionGroup({
  source: 'Todos',
  events: {
    'Add Todo': props<{ todo: Todo }>(),
    'Toggle Todo': props<{ id: string }>(),
    'Clear Completed': emptyProps(),
  },
});

const counterFeature = createFeature({
  name: 'counter',
  reducer: createReducer(
    { count: 0, steps: 0 },
    on(increment, (state, { by }) => ({ count: state.count + by, steps: state.steps + 1 })),
    on(reset, () => ({ count: 0, steps: 0 })),
  ),
});

const todoAdapter = createEntityAdapter<Todo>({
  selectId: (t: Todo) => t.id,
  sortComparer: (a: Todo, b: Todo) => a.title.localeCompare(b.title),
});

const todosReducer = createReducer(
  todoAdapter.getInitialState({ filter: 'all' }),
  on(TodoActions.addTodo, (state, { todo }) => todoAdapter.addOne(todo, state)),
  on(TodoActions.toggleTodo, (state, { id }) => {
    const existing = state.entities[id];
    return existing ? todoAdapter.updateOne({ id, changes: { done: !existing.done } }, state) : state;
  }),
  on(TodoActions.clearCompleted, (state) => {
    const ids = (state.ids as string[]).filter((id) => state.entities[id]?.done);
    return todoAdapter.removeMany(ids, state);
  }),
);

const selectTodosState = createFeatureSelector<ReturnType<typeof todosReducer>>('todos');
const { selectAll, selectTotal, selectIds } = todoAdapter.getSelectors(selectTodosState);
const selectPendingCount = createSelector(selectAll, (todos) => todos.filter((t) => !t.done).length);

const actions$ = new ActionsSubject();
const scanned$ = new ScannedActionsSubject();
const reducerManager = new ReducerManager(
  actions$ as any,
  undefined,
  { counter: counterFeature.reducer, todos: todosReducer },
  combineReducers as any,
);
const state$ = new State(actions$, reducerManager, scanned$, undefined);
const store = new Store(state$ as any, actions$, reducerManager);

const log: string[] = [];
store.select(counterFeature.selectCount).subscribe((c) => log.push(`count=${c}`));
store.select(selectTotal).subscribe((n) => log.push(`total=${n}`));
store.select(selectPendingCount).subscribe((n) => log.push(`pending=${n}`));

store.dispatch(increment({ by: 3 }));
store.dispatch(increment({ by: 2 }));
store.dispatch(TodoActions.addTodo({ todo: { id: '2', title: 'Beta', done: false } }));
store.dispatch(TodoActions.addTodo({ todo: { id: '1', title: 'Alpha', done: false } }));
store.dispatch(TodoActions.toggleTodo({ id: '2' }));

store.select(selectIds).subscribe((ids) => log.push(`ids=${(ids as string[]).join(',')}`)).unsubscribe();
store.dispatch(TodoActions.clearCompleted());
store.select(selectAll).subscribe((all) => log.push(`remaining=${all.map((t) => t.title).join(',')}`)).unsubscribe();
store.dispatch(reset());

console.log(log.join('\n'));
