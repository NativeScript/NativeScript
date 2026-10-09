// @lenient
// An untyped value returned as an interface (core's parseLoginOptions): the value itself, whatever object it is.
interface LoginOptions {
  title?: string;
  message?: string;
  userName?: string;
}
function isObject(value: any): boolean {
  return value !== null && typeof value === 'object';
}
function parse(args: any[]): LoginOptions {
  if (args.length === 1 && isObject(args[0])) {
    return args[0];
  }
  const options: LoginOptions = { title: 'Login' };
  if (typeof args[0] === 'string') options.message = args[0];
  return options;
}
function login(...args: any[]): string {
  const options = parse(args);
  return `${options.title}|${options.message}`;
}
console.log(login({ title: 'Sign in', message: 'Hi', userName: 'ada' }));
console.log(login('Just a message'));

class Shape {
  constructor(public title: string) {}
}
console.log(parse([new Shape('From a class')]).title);
const shapes: any[] = [new Shape('In an untyped array')];
function first(xs: any[]): LoginOptions | null {
  return isObject(xs[0]) ? xs[0] : null;
}
console.log(first(shapes)!.title);
