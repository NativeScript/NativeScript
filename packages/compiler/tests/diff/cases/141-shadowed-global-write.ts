// A module-level variable written inside a class that has a member of the same name:
// the write is the variable's, as the read is, not the member's.
let serviceName = '';
let count = 0;

class Auth {
  private static get serviceName() {
    if (serviceName === '') {
      serviceName = 'org.example.TouchID';
    }
    return serviceName;
  }

  count = 10;

  bump() {
    count += 1;
    count++;
    return count + this.count;
  }

  static read() {
    return Auth.serviceName;
  }
}

console.log(serviceName, Auth.read(), serviceName);
const a = new Auth();
console.log(a.bump(), a.bump(), count);
