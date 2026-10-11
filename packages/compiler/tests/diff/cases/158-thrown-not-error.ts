// A thrown or rejected value of any type read as an Error (`(e as Error).message`, `.catch((e: Error) => …)`):
// its members as the value has them, undefined where it has none.
try {
  throw 'plain string';
} catch (e) {
  console.log('message', (e as Error).message, (e as Error).name);
}
try {
  throw { message: 'from an object', code: 42 };
} catch (e) {
  const err = e as Error;
  console.log('object', err.message);
}
try {
  throw new RangeError('real');
} catch (e) {
  console.log('error', (e as Error).message, (e as Error).name);
}
Promise.reject('offline')
  .catch((e: Error) => console.log('rejected', e.message))
  .then(() => console.log('after rejection'));
console.log('end');
