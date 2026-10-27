// A field whose slot is shared with a declaration the program doesn't own (a member of an interface of JavaScript's
// library it implements) is not held for its untyped value, even where its type is tested: the value is converted
// checked where it enters, and one of another type is JavaScript's TypeError there. Each such value below is then used
// as its declared type, which throws in JavaScript too. A held field beside it keeps what it is given.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Failure implements Error {
  name = 'Failure';
  message: string;
  code: string;
  constructor(raw: any) {
    this.message = raw.message;
    this.code = raw.code;
  }
}

function report(f: Failure) {
  const message = typeof f.message === 'string' ? f.message.toUpperCase() : 'no message';
  const code = typeof f.code === 'string' ? f.code.padEnd(4, '-') : `code ${f.code}`;
  return `${f.name}: ${message} (${code})`;
}

attempt('right', () => report(new Failure({ message: 'broke', code: 'E1' })));
attempt('wrong code', () => report(new Failure({ message: 'broke', code: 42 })));
attempt('wrong message', () => new Failure({ message: 7, code: 'E2' }).message.toUpperCase());
