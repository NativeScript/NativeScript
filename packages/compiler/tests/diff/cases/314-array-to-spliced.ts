// `toSpliced`: an immutable list update (remove, insert, replace), the state array untouched.
type Todo = { id: number; text: string };
const todos: Todo[] = [{ id: 1, text: 'milk' }, { id: 2, text: 'eggs' }, { id: 3, text: 'bread' }];
const show = (list: Todo[]) => list.map((t) => `${t.id}:${t.text}`).join(' ');
const removeAt = (i: number) => todos.toSpliced(i, 1);
console.log(show(removeAt(1)), '|', show(todos));
console.log(show(todos.toSpliced(1, 0, { id: 9, text: 'jam' })));
console.log(show(todos.toSpliced(-1, 1, { id: 4, text: 'rye' }, { id: 5, text: 'oats' })));
const extra: Todo[] = [{ id: 6, text: 'tea' }, { id: 7, text: 'rice' }];
console.log(show(todos.toSpliced(0, 2, ...extra)));
console.log(show(todos.toSpliced(1)), todos.length);
