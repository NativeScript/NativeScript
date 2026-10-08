// @lenient
// Core's CSS transform parsing: a global regex walked with exec, a frozen table of converters taking
// destructured pairs or numbers, `??=` defaults, and an identity object spread and filled by key.
type Pair = { x: number; y: number };
type TransformationValue = Pair | number;
interface Transformation {
  property: string;
  value: TransformationValue | { x: number; y: number; z: number };
}
const IDENTITY = { translate: { x: 0, y: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1 } };
const SPLITTER = new RegExp(/\s*(.+?)\((.*?)\)/g);
const NAMES = Object.freeze<string[]>(['rotate', 'rotateX', 'translate', 'translateX', 'scale', 'scaleX']);
const MAP = Object.freeze<{ [key: string]: (value: TransformationValue) => Transformation }>({
  scale: (value: number) => ({ property: 'scale', value }),
  scaleX: ({ x }: Pair) => ({ property: 'scale', value: { x, y: IDENTITY.scale.y } }),
  translate: (value) => ({ property: 'translate', value }),
  translateX: ({ x }: Pair) => ({ property: 'translate', value: { x, y: IDENTITY.translate.y } }),
  rotateX: (x: number) => ({ property: 'rotate', value: { x, y: IDENTITY.rotate.y, z: IDENTITY.rotate.z } }),
  rotate: (z: number) => ({ property: 'rotate', value: { x: IDENTITY.rotate.x, y: IDENTITY.rotate.y, z } }),
});
function convert(property: string, raw: string): TransformationValue {
  const values = raw.split(',').map(parseFloat);
  const x = values[0];
  let y = values[1];
  let z = values[2];
  if (property === 'translate') {
    y ??= IDENTITY.translate.y;
  } else {
    y ??= x;
    z ??= y;
  }
  if (property === 'rotate' || property === 'rotateX') {
    return raw.slice(-3) === 'rad' ? (x * 180) / Math.PI : x;
  }
  return { x, y, z } as any;
}
function parse(text: string): Transformation[] {
  const matches: Transformation[] = [];
  let match: RegExpExecArray;
  while ((match = SPLITTER.exec(text)) !== null) {
    const property = match[1];
    if ((NAMES as string[]).indexOf(property) !== -1) {
      matches.push(MAP[property](convert(property, match[2])));
    }
  }
  return matches;
}
function transformConverter(text: string) {
  const transformations = parse(text);
  if (text === 'none' || !transformations.length) return IDENTITY;
  const full = { ...IDENTITY };
  transformations.forEach((t) => {
    full[t.property] = t.value;
  });
  return full;
}
for (const text of ['rotate(20)', 'rotate(0.5rad)', 'scale(1.2, 0.7)', 'translate(20, 8)', 'rotateX(50)', 'none']) {
  console.log(text, JSON.stringify(transformConverter(text)));
}
