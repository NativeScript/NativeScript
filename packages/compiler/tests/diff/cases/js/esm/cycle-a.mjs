import { fromB } from './cycle-b.mjs';
export function fromA() { return 'A'; }
export const seenB = fromB();
