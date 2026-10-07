// @lenient
// `'key' in object` for an object built field by field from a literal of an interface's type:
// a field never assigned is not there, as core's keyframe animation tests `'rotate' in animation`.
interface Pair { x: number; y: number }
interface KeyframeStep {
  duration?: number;
  translate?: Pair;
  rotate?: { x: number; y: number; z: number };
  opacity?: number;
}
function step(declarations: [string, any][]): KeyframeStep {
  const animation: KeyframeStep = {};
  for (const [property, value] of declarations) {
    animation[property] = value;
  }
  return animation;
}
const s = step([['translate', { x: 1, y: 2 }], ['duration', 300]]);
console.log('translate' in s, 'rotate' in s, 'opacity' in s, 'duration' in s, Object.keys(s).join());
const t: KeyframeStep = { opacity: 0.5 };
console.log('opacity' in t, 'rotate' in t, JSON.stringify(t));
