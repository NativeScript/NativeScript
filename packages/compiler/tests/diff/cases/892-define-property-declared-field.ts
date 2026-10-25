// Object.defineProperty restricting a class's declared field: read-only, hidden from keys, and an accessor in its place.
class Account {
  id = 1;
  name = 'a';
  balance = 0;
}
const acct = new Account();
Object.defineProperty(acct, 'id', { value: 7, writable: false });
Object.defineProperty(acct, 'name', { enumerable: false });
Object.defineProperty(acct, 'balance', { get() { return 42; } });
console.log(acct.id, acct.name, acct.balance, Object.keys(acct).join(','), JSON.stringify(acct));
try {
  acct.id = 8;
} catch (e) {
  console.log('read-only', (e as Error).constructor.name, acct.id);
}
