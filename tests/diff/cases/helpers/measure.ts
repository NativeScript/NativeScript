export const MODE_SHIFT = 30;
export const MODE_MASK = 0x3 << MODE_SHIFT;
export let calls = 0;

export function round(value: number): number {
  calls++;
  const res = Math.floor(value + 0.5);
  if (res !== 0) return res;
  if (value === 0) return 0;
  return value > 0 ? 1 : -1;
}

export function sizeOf(spec: number): number {
  return spec & ~MODE_MASK;
}
