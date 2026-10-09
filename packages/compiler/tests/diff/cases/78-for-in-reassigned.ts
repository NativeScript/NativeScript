// A for…in loop's variable the body reassigns (core's component builder strips a platform prefix from each attribute).
const attributes: Record<string, string> = { 'ios:text': 'a', 'android:text': 'b', width: '10' };
const applied: string[] = [];
for (let attr in attributes) {
  const value = attributes[attr];
  if (attr.indexOf(':') !== -1) {
    if (attr.split(':')[0] !== 'ios') continue;
    attr = attr.split(':')[1].trim();
  }
  applied.push(`${attr}=${value}`);
}
console.log(applied.join(','));
