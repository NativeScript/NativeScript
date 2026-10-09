// @lenient
// A string a function may not give, appended to (core's gesture key `toString(type) + direction`).
function name(type: number): string | undefined {
  return type === 1 ? 'swipe' : undefined;
}
function key(type: number, direction: number): string {
  let typeString = name(type);
  if (direction) {
    typeString += direction.toString();
  }
  return typeString;
}
console.log(key(1, 2), key(1, 0), key(3, 4));
