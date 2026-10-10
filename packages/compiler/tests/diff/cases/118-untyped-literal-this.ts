// A function expression member of an untyped object reading `this` (core's fromObject view models): the object it is called on.
const model: any = {
  anyColor: 'red',
  isVisible: function () {
    return this.anyColor === 'red';
  },
  rename: function (to: string) {
    this.anyColor = to;
  },
};
console.log(model.isVisible());
model.rename('blue');
console.log(model.isVisible(), model.anyColor);
