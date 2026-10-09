export let failures = 0;
export function assert(test: any, message?: string): void {
  if (!test) failures++;
  console.log(test ? 'ok' : `failed: ${message}`);
}
export function max(a: number, b: number): string {
  return a > b ? 'first' : 'second';
}
export function pair<T>(a: T, b: T): T[] {
  return [a, b];
}
