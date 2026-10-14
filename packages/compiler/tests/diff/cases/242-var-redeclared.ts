// A var declared again in the same function or module, with and without a new initializer.
var total = 1;
var total = total + 2;
console.log(total);
function tally(items: number[]) {
  var sum = 0;
  for (var i = 0; i < items.length; i++) sum += items[i];
  for (var i = 0; i < 2; i++) sum += 10;
  var sum: number;
  console.log(i, sum);
  if (sum > 0) {
    var label = 'positive';
  } else {
    var label = 'other';
  }
  return label;
}
console.log(tally([1, 2, 3]));
