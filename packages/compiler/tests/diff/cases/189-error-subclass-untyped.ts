// @swift
// A field of an Error subclass reads through `any` and `unknown`: `catch (e: any) { e.code }`, `in`, Object.keys, JSON.
class CodeError extends Error {
  code: number;
  constructor(m: string) {
    super(m);
    this.code = 3;
  }
}
class HttpError extends Error {
  status = 404;
  retry(): boolean { return this.status >= 500; }
}
class TimeoutError extends HttpError {
  after = 30;
}
try {
  throw new CodeError('m');
} catch (e: any) {
  console.log(e.code, 'code' in e, e.message, e instanceof CodeError, Object.keys(e));
  e.code = 7;
  console.log(e.code, (e as CodeError).code);
}
try {
  throw new HttpError('not found');
} catch (e: unknown) {
  if (e instanceof HttpError) console.log(e.status, e.retry());
  const u: any = e;
  console.log(u.status, JSON.stringify(u), Object.keys(u));
}
const t: any = new TimeoutError('slow');
console.log(t.after, t.status, 'after' in t, 'status' in t, Object.keys(t), t.name, t.message);
