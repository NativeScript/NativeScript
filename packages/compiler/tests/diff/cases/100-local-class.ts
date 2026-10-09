// A class declared inside a function that uses nothing of the function: a class of the module's.
let made = 0;
class Base {
  name = 'base';
  describe(): string {
    return this.name;
  }
}
function make(): Base {
  class Local extends Base {
    constructor() {
      super();
      this.name = 'local';
      made++;
    }
  }
  return new Local();
}
console.log(make().describe(), make().describe(), made);
