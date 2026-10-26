// Untyped values asserted to a string or number (`x as T`, `JSON.parse(…) as T`): one of another type is JavaScript's
// TypeError where it is first used as the asserted type, and the typed slot's where it enters, never a converted value.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const raw: any = 42;
attempt('upper', () => (raw as string).toUpperCase());
attempt('fixed', () => (JSON.parse('"7"') as number).toFixed(1));
attempt('trim', () => {
  const s = JSON.parse('{"a": 1}').a as string;
  return s.trim();
});
attempt('same string', () => (JSON.parse('"ok"') as string).toUpperCase());
attempt('same number', () => (JSON.parse('3') as number).toFixed(2));
const words = JSON.parse('["a", "b"]') as string[];
console.log('array', words.length, words.join('+'));
