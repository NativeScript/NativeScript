// Reading a member of undefined or null throws a TypeError a catch can take,
// wherever TypeScript's types let the read through: past an array's end,
// through a non-null assertion, on an untyped value, in an async function.
interface Item {
  name: string;
  tags: string[];
}
const items: Item[] = [{ name: 'a', tags: [] }];
const lookup = new Map<string, Item>([['a', items[0]]]);
let missing: Item | null = null;

function attempt(label: string, body: () => unknown) {
  try {
    console.log(label, 'ok', body());
  } catch (e) {
    console.log(label, e instanceof TypeError, (e as Error).name, (e as Error).message);
  }
}

attempt('element', () => items[3].name);
attempt('element method', () => items[2].tags.push('x'));
attempt('element in range', () => items[0].name);
attempt('map get', () => lookup.get('zz')!.name);
attempt('map get found', () => lookup.get('a')!.tags.length);
attempt('null assertion', () => missing!.tags);
attempt('find', () => items.find((i) => i.name === 'nope')!.name.toUpperCase());
attempt('optional chain', () => items[9]?.name ?? 'fallback');

const untyped: any = undefined;
const nothing: any = null;
attempt('any read', () => untyped.foo);
attempt('any nested', () => ({ a: undefined } as any).a.b);
attempt('any call', () => untyped.go());
attempt('any write', () => { nothing.x = 1; });
attempt('null read', () => nothing.length);

function depth(item: Item | undefined): number {
  return item!.tags.length;
}
attempt('param', () => depth(undefined));
attempt('param ok', () => depth(items[0]));

class Box {
  constructor(public inner?: Box, public label = 'box') {}
}
const box = new Box(new Box());
attempt('chain', () => box.inner!.inner!.label);
attempt('chain ok', () => box.inner!.label);

async function later(): Promise<string> {
  await null;
  return items[7].name;
}
later().then(
  (v) => console.log('resolved', v),
  (e) => console.log('rejected', e instanceof TypeError, (e as Error).message),
);
