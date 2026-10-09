// @swift
// ES modules compiled from their JavaScript: live bindings, `export *` and `export * as`,
// default exports, evaluation order, and a cycle between two modules.
import named, { count, inc } from './js/esm/counter.mjs';
import { Shape, Square, PI, extra, hoisted, more } from './js/esm/shapes.mjs';
import * as shapes from './js/esm/shapes.mjs';
import { order } from './js/esm/order.mjs';
import { seenB } from './js/esm/cycle-a.mjs';

console.log('count before', count);
inc();
inc();
console.log('count after', count, named());
const sq = new Square(3);
console.log(String(sq), sq.area(), sq instanceof Shape, PI, extra, hoisted(), more.extra);
console.log(Object.keys(shapes).join(','), Object.prototype.toString.call(shapes));
console.log(order.join(' > '), seenB);
