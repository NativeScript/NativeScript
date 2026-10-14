// Runs the selected workloads and prints their stats as one line of JSON, for tests/perf/run.ts.
import { runCpu, Results } from './cpu';
import { enter } from './stats';

const out: Results = {};
runCpu(out, enter).then(() => {
  console.log(JSON.stringify(out));
});
