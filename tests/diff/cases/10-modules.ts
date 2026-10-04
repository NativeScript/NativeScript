// Module evaluation order: an imported module's top level runs first.
import { register, registry } from './helpers/registry.ts';
import { twice } from './helpers/math.ts';

console.log('main module top');
register('main');
console.log(registry.join(' > '), twice(21));
