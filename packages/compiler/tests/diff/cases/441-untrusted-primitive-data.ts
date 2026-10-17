// Parsed data read as an interface, and a binding's untyped writes to typed fields: a field the data lacks reads as
// undefined, and a value of another kind is taken as it is where JavaScript converts it, never refused.
interface Point {
  x: number;
  y: number;
  label: string;
  pinned: boolean;
}
const p: Point = JSON.parse('{"x": "4", "label": 9}');
console.log(p.x * 2, `${p.label}`, p.y === undefined, p.pinned ? 'pinned' : 'loose', `${p.y}`);

const points = JSON.parse('[{"x": 1, "y": 2}, {"label": "only"}]') as Point[];
for (const q of points) console.log(q.x === undefined ? 'no x' : q.x + q.y, q.label ?? 'unlabeled');

class Model {
  name = 'model';
  count = 1;
  on = false;
}
const model = new Model();
const bound: any = model;
bound.name = 5;
bound.count = '3';
bound.on = 'yes';
console.log(`${model.name}`, model.count * 2, model.on ? 'on' : 'off');
bound['count'] = undefined;
bound['on'] = 0;
console.log(Number.isNaN(model.count * 1), model.on ? 'on' : 'off');
