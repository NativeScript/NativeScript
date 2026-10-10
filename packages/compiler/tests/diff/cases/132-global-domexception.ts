// @lenient
// DOMException read off the global object and constructed untyped, as core's fetch makes its AbortError.
let DOMExceptionClass: any = (global as any).DOMException;
console.log('DOMException' in global);
try {
  new DOMExceptionClass();
} catch (err) {
  DOMExceptionClass = null;
}
const aborted = new DOMExceptionClass('Aborted', 'AbortError');
console.log(aborted.name, aborted.message, aborted instanceof Error, String(aborted));
const plain = new DOMExceptionClass();
console.log(JSON.stringify(plain.name), JSON.stringify(plain.message), String(plain));
const coerced = new DOMExceptionClass(42, undefined);
console.log(coerced.name, coerced.message);

function reject(fail: (reason: any) => void) {
  fail(new DOMExceptionClass('Aborted', 'AbortError'));
}
reject((reason) => console.log('rejected with', reason.name, reason.message));
