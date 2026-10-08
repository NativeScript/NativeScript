// @lenient
// An array written at fractional and sparse indices and read back with for...in: a map from number to
// value, as core's keyframe parser collects keyframes by their time (0, 0.5, 1).
interface KeyframeInfo {
  duration: number;
  declarations: string[];
}
function keyframes(times: string[][]): KeyframeInfo[] {
  const parsed = new Array<KeyframeInfo>();
  for (const values of times) {
    for (const value of values) {
      const time = value === 'from' ? 0 : value === 'to' ? 1 : parseFloat(value) / 100;
      let current = parsed[time];
      if (current === undefined) {
        current = <KeyframeInfo>{};
        current.duration = time;
        current.declarations = [];
        parsed[time] = current;
      }
      current.declarations = current.declarations.concat([value]);
    }
  }
  const array = [];
  for (const key in parsed) {
    array.push(parsed[key]);
  }
  array.sort((a, b) => a.duration - b.duration);
  return array;
}
console.log(keyframes([['from'], ['50%'], ['to', '100%']]).map((k) => `${k.duration}:${k.declarations.join('+')}`).join(' '));
