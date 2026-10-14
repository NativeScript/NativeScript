// What tests/perf/run.ts asks of a native backend. Each lives in tests/perf/<name>.ts and exports one as `backend`.

export interface Backend {
  /** The target's name, as its switch (`--swift`) and the table give it. */
  readonly name: string;
  /** How the build is optimized, for the table's heading (`-Osize -wmo, LTO`). */
  describe(args: string[]): string;
  /**
   * The workload program in `src` (its entry `bench.ts`, importing the workloads beside it) built as a release
   * build of an app would be, into `out`; the command line that runs it. `args` is the driver's command line,
   * for the backend's own switches.
   */
  build(src: string, out: string, args: string[]): string[];
}
