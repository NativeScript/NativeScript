// @lenient
// A field declared `boolean | undefined` in code checked without strictNullChecks, which reads the
// type as `boolean`: undefined is still what it holds until set, as core's deferred native text.
class Text {
  private deferring = false;
  private pendingReset: boolean | undefined;
  private count: number | undefined;
  log: string[] = [];
  write(reset = false) {
    if (this.deferring) {
      this.pendingReset = reset;
      return;
    }
    this.log.push(`write ${reset}`);
  }
  resume(run: () => void) {
    this.deferring = true;
    try {
      run();
    } finally {
      this.deferring = false;
    }
    const reset = this.pendingReset;
    if (reset !== undefined) {
      this.pendingReset = undefined;
      this.write(reset);
    }
    this.log.push(`count ${this.count === undefined ? 'unset' : this.count}`);
  }
}
const text = new Text();
text.resume(() => {});
text.resume(() => text.write(true));
console.log(text.log.join(', '));
class Scroller {
  enabled = true;
  private wasEnabled: boolean | undefined;
  hold() {
    this.wasEnabled = this.enabled;
    this.enabled = false;
  }
  release() {
    if (this.wasEnabled !== undefined) {
      this.enabled = this.wasEnabled;
      this.wasEnabled = undefined;
    }
    return `${this.enabled} ${this.wasEnabled === undefined}`;
  }
}
const scroller = new Scroller();
scroller.hold();
console.log(scroller.release(), scroller.release());
