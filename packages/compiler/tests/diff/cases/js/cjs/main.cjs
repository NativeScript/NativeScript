// CommonJS as npm publishes it: caching, evaluation order, cycles, and the
// interop shapes TypeScript's and Babel's CommonJS output use.
console.log('main: start');
var a = require('./a.cjs');
var a2 = require('./a.cjs');
console.log('main: cached', a === a2, a.done, require('./b.cjs').done);
console.log('main: counter', require('./counter.cjs').next(), require('./counter.cjs').next());

var lib = require('./ts-output.cjs');
console.log('main: ts output', Object.keys(lib).join(','), lib.__esModule, typeof lib.default, lib.default(2), lib.helper());
var interop = require('./interop.cjs');
console.log('main: interop', interop.defaultOfTs, interop.defaultOfPlain, interop.starKeys, interop.reexported);

var fn = require('./function-export.cjs');
console.log('main: function export', typeof fn, fn(3), fn.extra, fn.name);
var data = require('./data.json');
console.log('main: json', data.name, data.list.length, data.nested.ok);

console.log('main: this at top', this === module.exports, typeof module, typeof exports, typeof require);
function sloppy() { return this; }
console.log('main: sloppy this', sloppy() === globalThis);
var strict = require('./strict.cjs');
console.log('main: strict this', strict.plain() === undefined, strict.method.call(5));
try { require('./throws.cjs'); } catch (e) { console.log('main: throwing module', e.message); }
try { require('./throws.cjs'); } catch (e) { console.log('main: throws again', e.message); }
module.exports = { ok: true };
