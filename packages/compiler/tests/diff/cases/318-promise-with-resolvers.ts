// `Promise.withResolvers`: a promise settled from outside its executor (a dialog's result, a one-shot event).
class Dialog {
  private pending = Promise.withResolvers<string>();
  readonly result = this.pending.promise;
  choose(answer: string) { this.pending.resolve(answer); }
  dismiss() { this.pending.reject(new Error('dismissed')); }
}
const ok = new Dialog();
ok.result.then((a) => console.log('chose', a));
ok.choose('yes');
ok.choose('no');
const cancelled = new Dialog();
cancelled.result.catch((e: Error) => console.log('failed', e.message));
cancelled.dismiss();
const { promise, resolve } = Promise.withResolvers<number>();
setTimeout(() => resolve(Promise.resolve(7)), 0);
promise.then((n) => console.log('later', n * 6));
console.log('sync first');
