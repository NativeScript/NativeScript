// A class's static initialization blocks run once, in order with its static fields, with `this` the class.
const steps: string[] = [];
class Registry {
  static names: string[] = ['a'];
  static count = 0;
  static {
    Registry.names.push('b');
    this.count = Registry.names.length;
    steps.push('first block');
  }
  static total = Registry.count * 10;
  static {
    steps.push('second block ' + Registry.total);
  }
}
console.log(Registry.names.join(','), Registry.count, Registry.total, steps.join('; '));
