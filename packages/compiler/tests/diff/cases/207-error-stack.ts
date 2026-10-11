// An error's stack: its "Name: message" header, then the frames it was made in, which a crash reporter reads.
function make(message: string): Error {
  return new Error(message);
}

function frames(e: Error): string[] {
  return (e.stack ?? '').split('\n').slice(1).filter((l) => /^ {4}at \S/.test(l));
}

const made = make('boom');
const lines = (made.stack ?? '').split('\n');
console.log(lines[0], frames(made).length >= 2);

try {
  JSON.parse('{');
} catch (e) {
  console.log(((e as Error).stack ?? '').split('\n')[0].startsWith('SyntaxError'), frames(e as Error).length >= 1);
}

class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}
const own = new AppError('bad');
console.log((own.stack ?? '').includes('bad'), frames(own).length >= 1);
const header = (e: Error) => (e.stack ?? '').split('\n')[0];
own.stack = 'replaced';
console.log(header(own));
