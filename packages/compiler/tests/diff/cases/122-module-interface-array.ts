// @swift
// A class implementing an interface named through its module (`queue.Job`), its objects' array given where the interface's is taken.
import * as queue from './helpers/queue.ts';

class Echo implements queue.Job {
  constructor(public name: string) {}
  run() {
    return this.name.toUpperCase();
  }
}

const jobs: Echo[] = [new Echo('a'), new Echo('b')];
console.log(queue.runAll(jobs).join(' | '));
jobs.push(new Echo('c'));
console.log(queue.runAll(jobs).length, jobs.length);
