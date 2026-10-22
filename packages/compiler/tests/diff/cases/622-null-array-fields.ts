// @app-lenient
// Array fields declared without a value, or set to null, hold undefined and null, not an empty array.
class Chart {
  indices: number[];
  colors: string[] = null;
  clear() { this.indices = null; }
  set(h: number[]) { this.indices = h.length ? h : null; }
  get highlighted() { return !!this.indices; }
}
const c = new Chart();
console.log(c.indices === undefined, c.colors === null, !c.indices, !c.colors, c.highlighted);
c.set([1]);
console.log(c.indices.length, c.highlighted);
c.set([]);
console.log(c.indices === null, c.highlighted);
c.clear();
console.log(String(c.indices), JSON.stringify(c));
