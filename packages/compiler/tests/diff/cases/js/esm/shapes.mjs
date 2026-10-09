import { order } from './order.mjs';
order.push('shapes');
export class Shape { constructor(n) { this.n = n; } area() { return 0; } toString() { return `${this.constructor.name}(${this.n})`; } }
export class Square extends Shape { constructor(s) { super('square'); this.s = s; } area() { return this.s * this.s; } }
export const PI = 3.14;
export * from './more.mjs';
export * as more from './more.mjs';
