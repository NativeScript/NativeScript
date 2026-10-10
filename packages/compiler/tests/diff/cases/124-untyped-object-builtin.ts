// @swift
// `Object` held as any value, its functions called by name; an enum member a literal's field narrows to, held as its value.
enum Direction {
  Up = 'up',
  Down = 'down',
}
const sizes = { small: 1, large: 3 };
const entries = (<any>Object).entries(sizes).map(([k, v]: [string, number]) => `${k}=${v}`);
console.log(entries.join(','), (<any>Object).keys(sizes).length, (<any>Object).values(sizes)[1]);
const merged = (<any>Object).assign({}, sizes, { medium: 2 });
console.log(Object.keys(merged).join(','));

const move = { direction: Direction.Down, steps: 2 };
const options: { direction: Direction; steps: number } = move;
console.log(options.direction, move.direction === Direction.Down);
