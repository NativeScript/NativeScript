// `toReversed`: newest first for display, a copy; the original order kept.
const history = ['open', 'edit', 'save', 'close'];
const newestFirst = history.toReversed();
console.log(newestFirst.join(' < '), history.join(' > '));
console.log(newestFirst.length, newestFirst !== history);
const empty: number[] = [];
console.log(empty.toReversed().length, [1].toReversed().join(','));
