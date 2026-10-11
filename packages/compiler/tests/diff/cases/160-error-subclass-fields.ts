// @kotlin
// Fields of an Error subclass: read through `any` and `unknown`, after `instanceof`, by `in`, `Object.keys` and JSON.
class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
class CodedError extends Error {
  code = 'E_CODE';
  detail?: string;
}

try {
  throw new HttpError('not found', 404);
} catch (e: any) {
  console.log(e.status, 'status' in e, e.message, e.name, e.missing);
}
try {
  throw new HttpError('gone', 410);
} catch (e: unknown) {
  if (e instanceof HttpError) console.log(e.status, e.message);
}
try {
  throw new CodedError('coded');
} catch (e) {
  if (e instanceof CodedError) console.log(e.code, e.detail);
  const err = e as any;
  console.log(err.code, 'code' in err, Object.keys(err).filter((k) => k !== 'detail').join(','), JSON.stringify(err));
  err.code = 'E_OTHER';
  err.extra = 1;
  console.log(err.code, (e as CodedError).code, Object.keys(err).filter((k) => k !== 'detail').join(','));
}
const h: any = new HttpError('teapot', 418);
console.log(h['status'], h.stack.split('\n')[0]);
