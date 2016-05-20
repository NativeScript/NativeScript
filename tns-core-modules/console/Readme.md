Sample code:
```
console.time('test');

console.log("this is a log test");
console.info("infoooo");
console.error("errorrrr");
console.log("test formatting: %.2f", 1.43234);
console.log("test", "more", "params");

console.assert((2 == 1), 'assertion failed:', 'error');

console.warn('calling trace');
console.trace();

console.dump(console);

console.timeEnd('test');
```