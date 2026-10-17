// A member read through a non-null assertion (`row.title!`) of a value that is missing: JavaScript's TypeError, which
// a catch, or the uncaught-error report, receives as V8 words it.
(globalThis as any).__onUncaughtError = (e: unknown) => console.log('uncaught:', e instanceof Error ? `${e.name}: ${e.message}` : String(e));

interface Row {
  id: number;
  title?: string;
}

function renderRow(row: Row): string {
  return `${row.id}:${row.title!.toUpperCase()}`;
}

for (const row of [{ id: 1, title: 'one' }, { id: 2 }] as Row[]) {
  try {
    console.log(renderRow(row));
  } catch (e) {
    console.log('caught', e instanceof TypeError ? e.message : String(e));
  }
}

interface Point {
  x: number;
}
const none: Point | null = [null][0];
setTimeout(() => console.log('x', none!.x), 0);
setTimeout(() => console.log('after'), 5);
