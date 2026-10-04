// Typed objects, untyped values and JSON.
interface Recipe {
  id: string;
  minutes: number;
  tags: string[];
  note?: string;
}

const text = '{"id":"dal","minutes":30,"tags":["veg","quick"],"extra":{"nested":[1,2.5,null,true]}}';
const raw = JSON.parse(text);
console.log(typeof raw, raw.id, raw.minutes + 1, raw.tags.length, raw.extra.nested[1], raw.missing);
const recipe = JSON.parse(text) as Recipe;
console.log(recipe.id, recipe.minutes * 2, recipe.tags.join('+'), recipe.note ?? 'no note');

const point = { x: 1, y: 2 };
const moved = { ...point, y: 5 };
console.log(point.x + point.y, moved.y, JSON.stringify(moved), JSON.stringify(point, null, 2));
console.log(JSON.stringify({ a: [1, 'two', null, true, 1.5e-7], b: 'quote " and \\ backslash', c: undefined }));
console.log(JSON.stringify(recipe), Object.keys(recipe).join(','));

const dynamic: any = { count: 1 };
dynamic.count = dynamic.count + 1;
console.log(dynamic.count, dynamic.nothing, dynamic.count === 2, typeof dynamic.count);
console.log(recipe, [point, moved]);
