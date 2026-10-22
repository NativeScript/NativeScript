// An async function returning, through a `finally`, a value whose computation can throw.
class Gate {
  busy = false;
  log: string[] = [];

  reason(code: number): string {
    if (code < 0) throw new Error(`bad code ${code}`);
    return `code ${code}`;
  }

  async open(code: number, ready: boolean): Promise<string> {
    this.busy = true;
    try {
      if (!ready) return this.reason(code);
      const waited = await Promise.resolve(code * 2);
      return waited > 10 ? this.reason(waited) : 'small';
    } finally {
      this.busy = false;
      this.log.push(`closed after ${code}`);
    }
  }
}

async function main() {
  const gate = new Gate();
  console.log(await gate.open(1, false), gate.busy);
  console.log(await gate.open(3, true), await gate.open(8, true));
  try {
    await gate.open(-2, false);
  } catch (e) {
    console.log('caught', (e as Error).message, gate.busy);
  }
  console.log(gate.log.join('; '));
}
main();
