// A class printed as a value (an error message naming what `new` was given).
class Plain {}
class Events {
  static on(name: string) {
    return name;
  }
}
class Child extends Events {}
console.log(Plain);
console.log(Events);
console.log(Child, [Plain]);
