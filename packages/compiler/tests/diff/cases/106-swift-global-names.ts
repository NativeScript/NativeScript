// A program's functions named like Swift's own (`assert`, `max`), called by name and through the module, and the module held as a value.
import * as checks from './helpers/checks.ts';
import { assert, max } from './helpers/checks.ts';

class Thing {
  ready(): boolean {
    return true;
  }
}
assert(new Thing().ready(), 'ready');
checks.assert(1 + 1 === 3, 'arithmetic');
console.log(max(1, 2), checks.max(3, 2), checks.failures);
const held: any = checks;
console.log(typeof held.assert, typeof held.pair, held.pair(1, 2).length);
