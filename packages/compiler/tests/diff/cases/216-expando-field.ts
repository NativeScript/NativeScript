// Members a class doesn't declare, written on its instances: own properties, read back, counted and enumerated as in JS.
// A plugin's component is typed by the plugin's declarations but compiled against its platform file, where a stub class
// may declare none of the members the component sets.
class Stub {}

class Counted {
  label = 'counted';
}

const stub = new Stub();
console.log(Object.keys(stub).length, JSON.stringify(stub));
// @ts-expect-error
stub.callback = (message: string) => console.log('got', message);
// @ts-expect-error
stub.count = 2;
// @ts-expect-error
stub.count += 3;
// @ts-expect-error
stub.callback?.('hello');
// @ts-expect-error
console.log(Object.keys(stub).join(','), stub.count, 'count' in stub, typeof stub.callback);

const counted = new Counted();
// @ts-expect-error
counted.extra = 'more';
// @ts-expect-error
console.log(counted.label, counted.extra, JSON.stringify(counted));
