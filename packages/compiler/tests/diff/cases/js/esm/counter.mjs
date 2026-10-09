export let count = 0;
export function inc() { count++; return count; }
export default function named() { return 'default fn'; }
console.log('counter.mjs evaluated');
