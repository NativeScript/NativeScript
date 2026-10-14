// test262's harness/doneprintHandle.js, printing with console.log.
export function $DONE(error?: any): void {
  if (error) {
    if (typeof error === 'object' && error !== null && 'name' in error) console.log('Test262:AsyncTestFailure:' + error.name + ': ' + error.message);
    else console.log('Test262:AsyncTestFailure:Test262Error: ' + String(error));
  } else {
    console.log('Test262:AsyncTestComplete');
  }
}
