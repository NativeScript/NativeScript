export function now(): number {
  return java.lang.System.nanoTime() / 1e6;
}
