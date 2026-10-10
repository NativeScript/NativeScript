// @lenient
// A handler property typed to take any arguments, given a function taking none (XMLHttpRequest's `onload`), called by name.
class Emitter {
  public onload: (...args: any[]) => void;
  public onreadystatechange: Function;
  emit(name: string, ...args: any[]) {
    if (typeof this['on' + name] === 'function') {
      this['on' + name](...args);
    }
  }
}
const e = new Emitter();
let count = 0;
e.onload = () => {
  count++;
  console.log('load', count);
};
e.onreadystatechange = () => console.log('state', count);
e.emit('load', 1, 2);
e.emit('readystatechange');
e.onload(3);
e.onload = function (first: any) {
  console.log('load with', first);
};
e.emit('load', 'x');
