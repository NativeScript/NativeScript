// A worker translating one instrumented case per message, so that the run translates several at once: a translation
// builds a whole program, seconds each, and the halving searches translate the same case many times.
import { parentPort } from 'node:worker_threads';
import { translateKotlin, translateSwift } from '../native-build.ts';
import { kotlinOptions, swiftOptions } from '../diff/case-options.ts';

export interface TranslateJob { target: 'swift' | 'kotlin'; root: string; file: string; out: string; pkg: string }
export type TranslateResult = { inits: string[] } | { error: string };

parentPort!.on('message', ({ id, job }: { id: number; job: TranslateJob }) => {
  let result: TranslateResult;
  try {
    const modules = job.target === 'swift' ? translateSwift([job.root], job.out, swiftOptions(job.file)) : translateKotlin([job.root], job.out, job.pkg, kotlinOptions(job.file));
    result = { inits: modules.filter((m) => m.init).map((m) => m.init!) };
  } catch (e) {
    result = { error: (e as Error).message };
  }
  parentPort!.postMessage({ id, result });
});
