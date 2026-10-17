// A region's render, called again on each update, that throws for one row: each update's error is reported as
// uncaught and the update goes on, so the other rows and the next updates render.
(globalThis as any).__onUncaughtError = (e: unknown) => console.log('uncaught:', e instanceof Error ? `${e.name}: ${e.message}` : String(e));

interface Row {
  id: number;
  title?: string;
}

function renderRow(row: Row): string {
  // Read untyped, so a missing title is a TypeError on every target.
  const untypedRow: any = row;
  return `${row.id}:${untypedRow.title.toUpperCase()}`;
}

const rows: Row[] = [{ id: 1, title: 'one' }, { id: 2 }, { id: 3, title: 'three' }];
const shown: string[] = [];
let updates = 0;

function update() {
  updates++;
  shown.length = 0;
  for (const row of rows) {
    if (row.id === 2 && updates > 2) row.title = 'two';
    shown.push(renderRow(row));
  }
  console.log('update', updates, shown.join(' '));
}

const untyped: any = {
  get title() {
    throw new TypeError('no title yet');
  },
};

for (let i = 0; i < 3; i++) setTimeout(update, i * 5);
setTimeout(() => console.log('label', untyped.title), 20);
setTimeout(() => console.log('after', updates, shown.length), 25);
