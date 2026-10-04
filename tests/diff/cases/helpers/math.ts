import { register } from './registry.ts';

console.log('math module top');
register('math');

export function twice(n: number): number {
  return n * 2;
}
