// @swift
// Idioms of plugins' code: an interface and a class of one name in two modules, `p['toString']()` on an
// untyped value, `Awaited<T>` of a generic async function, and a catch handler that rejects again.
import { Database as IDatabase, describe } from './helpers/database.ts';

class Database implements IDatabase {
  constructor(readonly path: string, private rows: number[]) {}
  count() { return this.rows.length; }
  select(): Promise<number> {
    return Promise.reject(new Error('locked'))
      .then(() => 1)
      .catch((err) => {
        console.log('caught', (err as Error).message);
        return Promise.reject(err);
      });
  }
}

function toParam(p: any) {
  if (p['toString']) return p['toString']();
  return p;
}

async function run<T>(action: () => Promise<T>): Promise<T> {
  let res;
  try {
    res = await action();
  } finally {
    console.log('done');
  }
  return res;
}

const db = new Database(':memory:', [1, 2, 3]);
console.log(describe(db), toParam(42), toParam(true), toParam('x'));
db.select().catch((e) => console.log('rejected', (e as Error).message));
run(async () => 'value').then((v) => console.log('run', v));
