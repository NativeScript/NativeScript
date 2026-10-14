// bench/app/stats.ts, with a workload filter: a workload left out of `selection` is not run.
import { now } from './clock';
import { selection } from './selection';

export interface Stat {
  m: number;
  p90: number;
  n: number;
  c: number;
}

let current = '';

/** Names the workload the next `measure` runs (runCpu's `progress`). */
export function enter(name: string): void {
  current = name;
}

function skipped(): boolean {
  return selection.length > 0 && selection.indexOf(current) < 0;
}

// A literal returned from the async function untyped does not compile in Swift (a JSObject where a Stat is wanted).
const SKIPPED: Stat = { m: 0, p90: 0, n: 0, c: 0 };

export function round(x: number): number {
  return Math.round(x * 100) / 100;
}

export function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];
}

export function median(sorted: number[]): number {
  const k = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[k] : (sorted[k - 1] + sorted[k]) / 2;
}

export function summarize(samples: number[], check: number): Stat {
  const s = samples.slice().sort((a, b) => a - b);
  return { m: round(median(s)), p90: round(percentile(s, 0.9)), n: s.length, c: check };
}

export function measure(fn: () => number, warm: number, runs: number): Stat {
  if (skipped()) return SKIPPED;
  let check = 0;
  for (let i = 0; i < warm; i++) check = fn();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = now();
    check = fn();
    samples.push(now() - t);
  }
  return summarize(samples, check);
}

export async function measureAsync(fn: () => Promise<number>, warm: number, runs: number): Promise<Stat> {
  if (skipped()) return SKIPPED;
  let check = 0;
  for (let i = 0; i < warm; i++) check = await fn();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = now();
    check = await fn();
    samples.push(now() - t);
  }
  return summarize(samples, check);
}
