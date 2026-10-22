// An untyped value a library function iterates (`Array.from`, `new Set`): what is no iterable is
// the TypeError script throws there.
const buf: any = new Float32Array([1.5, 2, 3]);
const list: any = ['a', 'b', 'a'];
console.log(Array.from(buf).join(), new Set(list).size);

function from(x: any): string {
  try {
    return Array.from(x).join();
  } catch (e) {
    return 'from ' + (e instanceof TypeError);
  }
}
function set(x: any): string {
  try {
    return String(new Set(x).size);
  } catch (e) {
    return 'set ' + (e instanceof TypeError);
  }
}
console.log(from(list), from(undefined), from(null));
console.log(set(list), set(42));
