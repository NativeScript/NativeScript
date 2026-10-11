// An error's stack replaced by script and read back: the value assigned, narrowed to a string as TypeScript does.
class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}
const own = new AppError('bad');
own.stack = 'replaced';
console.log(own.stack, own.stack.length);
const plain = new Error('x');
plain.stack = `${plain.name}: custom`;
console.log(plain.stack.split(':')[1].trim());
function restack(e: Error): string {
  e.stack = 'again';
  return e.stack.toUpperCase();
}
console.log(restack(new TypeError('t')));
