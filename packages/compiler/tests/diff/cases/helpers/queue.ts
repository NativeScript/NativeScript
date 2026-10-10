export interface Job {
  name: string;
  run(): string;
}

export function runAll(jobs: Array<Job>): string[] {
  return jobs.map((j) => `${j.name}: ${j.run()}`);
}
