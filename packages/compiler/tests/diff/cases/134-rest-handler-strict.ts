// @swift
// An app's handlers for slots taking any arguments (core's XMLHttpRequest and FileReader handlers): none, some or all of them named.
class Source {
  onload: (...args: any[]) => void = () => {};
  onerror: (...args: any[]) => void = () => {};
  load(...args: any[]) {
    this.onload(...args);
  }
  fail(...args: any[]) {
    this.onerror(...args);
  }
}
const s = new Source();
s.onload = () => console.log('load, no parameters');
s.load('a', 1);
s.onload = (a: string, b: number, c?: string) => console.log('three', a, b * 2, c === undefined ? 'no c' : c);
s.load('x', 21);
s.load('y', 1, 'z');
s.onerror = (error) => console.log('error', error);
s.fail('boom', 'ignored');
s.onerror = function (e: Error) {
  console.log('error object', e instanceof Error, e.message);
};
s.fail(new Error('typed'));
s.onerror = (e?: Error) => console.log('nothing given', e === undefined);
s.fail();
