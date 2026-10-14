// Built-in constructors used as values: as callbacks, and compared with an error's constructor.
const texts = ['1', '2.5', 'x'];
console.log(texts.map(Number).join(','), ['a', '', 'b'].filter(Boolean).join(','), [1, 0, 2].map(String).join('|'), [0, 1].map(Boolean).join(','));
function check(e: Error) {
  return e.constructor === TypeError ? 'type' : e.constructor === RangeError ? 'range' : e.constructor === Error ? 'plain' : 'other';
}
console.log(check(new TypeError('t')), check(new RangeError('r')), check(new Error('e')));
