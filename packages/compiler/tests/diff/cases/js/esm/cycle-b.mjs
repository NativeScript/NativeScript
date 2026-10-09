import { fromA } from './cycle-a.mjs';
export function fromB() { return 'B sees ' + typeof fromA; }
