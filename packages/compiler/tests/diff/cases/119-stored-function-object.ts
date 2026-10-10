// @swift
// Stored callbacks read as function objects: their `length` tells a test taking `done` from one that does not,
// and `apply` and `call` give them a receiver.
interface Entry {
  testFunc: (...args: any[]) => any;
  setUp: () => void;
  instance: any;
  name: string;
}

class Suite {
  name = 'suite';
  count = 0;
  testSync() {
    this.count++;
    console.log('sync', this.name, this.count);
  }
  testAsync(done: (e?: any) => void) {
    console.log('async', this.name);
    done();
  }
}

class Info implements Entry {
  testFunc: (...args: any[]) => any;
  instance: any;
  name: string;
  setUp: () => void = () => console.log('set up');
  constructor(testFunc: any, instance?: any, name?: string) {
    this.testFunc = testFunc;
    this.instance = instance || null;
    this.name = name || '';
  }
}

function plain() {
  console.log('plain');
}
function withDefaults(a: number, b: number, c = 3) {
  return a + b + c;
}

const suite = new Suite();
const entries: Entry[] = [new Info(suite.testSync, suite, 'testSync'), new Info(suite.testAsync, suite, 'testAsync'), new Info(plain, undefined, 'plain'), new Info(() => console.log('arrow'), undefined, 'arrow')];
for (const e of entries) {
  if (e.testFunc.length > 0) {
    e.testFunc.apply(e.instance, [(err?: any) => console.log('done', e.name, err === undefined)]);
  } else if (e.instance) {
    e.testFunc.apply(e.instance);
  } else {
    e.testFunc();
  }
  console.log(e.name, e.testFunc.length);
}
entries[0].testFunc.call(suite);
entries[0].setUp.call(suite);
console.log(entries[0].setUp.length);
console.log(suite.count, typeof entries[2].testFunc);

const sum = new Info(withDefaults, undefined, 'sum');
console.log(sum.testFunc.length, sum.testFunc.call(undefined, 1, 2), sum.testFunc.apply(null, [1, 2, 4]));

function startLog(this: any, label: string) {
  console.log('start', this.name, label);
}
const logged = new Info(startLog, suite, 'log');
logged.testFunc.apply(logged.instance, ['first']);
logged.testFunc.call({ name: 'other' }, 'second');
console.log(logged.testFunc.length);
