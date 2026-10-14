/** Monotonic milliseconds (Node; the native programs take clock.ios.ts or clock.android.ts, as the bench app does). */
export function now(): number {
  return performance.now();
}
