// An untyped function as a promise's rejection handler (`.catch(done)`), called with the reason.
function run(done: any) {
  Promise.reject(new Error('boom'))
    .then(() => done('never'))
    .catch(done);
}
run((reason?: any) => console.log('done', reason instanceof Error ? reason.message : reason));
const report: any = (r: any) => console.log('reported', r);
Promise.resolve(1)
  .then((n) => {
    if (n === 1) throw 'one';
    return n;
  })
  .catch(report);
