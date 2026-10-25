// An empty slot of new Array(n) is no own property: hasOwnProperty and getOwnPropertyNames leave it out.
const sparse: string[] = new Array<string>(4);
sparse[2] = 'c';
console.log(Object.getOwnPropertyNames(sparse).join(','), sparse.hasOwnProperty(0), sparse.hasOwnProperty(2), sparse.hasOwnProperty('length'));
const counts: number[] = new Array<number>(3);
counts[0] = 1;
console.log(Object.getOwnPropertyNames(counts).join(','), counts.hasOwnProperty(1), Object.prototype.hasOwnProperty.call(counts, 0));
