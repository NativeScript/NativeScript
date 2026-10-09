// @lenient
// Keys added by name to an object made from a literal (core's binding options, `{ targetProperty }` then `o[prop] = …`).
function options(name: string, params: any): any {
  const o = { targetProperty: name };
  for (const k in params) {
    o[k] = params[k];
  }
  if (o['twoWay'] === undefined) {
    o['twoWay'] = true;
  }
  return o;
}
const o = options('text', { sourceProperty: 'message', expression: 'a + b' });
console.log(o.sourceProperty, o.expression, o.twoWay, Object.keys(o).join(','));
console.log(JSON.stringify(options('class', {})));
