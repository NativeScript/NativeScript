// throw, catch, finally, custom errors.
class ValidationError extends Error {
  constructor(message: string, readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function check(age: number): number {
  if (age < 0) throw new ValidationError('age is negative', 'age');
  if (age > 150) throw new RangeError('age is too large');
  return age;
}

const order: string[] = [];
function attempt(age: number): string {
  try {
    order.push('try ' + age);
    return 'ok ' + check(age);
  } catch (e) {
    if (e instanceof ValidationError) return `invalid ${e.field}: ${e.message}`;
    if (e instanceof Error) return `${e.name}: ${e.message}`;
    return 'unknown';
  } finally {
    order.push('finally ' + age);
  }
}

console.log(attempt(30), '|', attempt(-1), '|', attempt(200));
console.log(order.join(', '));

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    return (e as Error).name;
  }
}
console.log(parse('{"a": [1, 2, {"b": null}]}'), parse('{oops'));

try {
  throw 'a string';
} catch (e) {
  console.log(typeof e, e);
}

function rethrow() {
  try {
    check(-5);
  } catch (e) {
    throw new Error('wrapped: ' + (e as Error).message);
  }
}
try {
  rethrow();
} catch (e) {
  console.log((e as Error).message);
}
