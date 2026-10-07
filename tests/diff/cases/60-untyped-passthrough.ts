// @lenient
// Members of an untyped definition copied into new objects in an untyped list: an absent one stays
// absent, as core's animation pushes `{ iterations: animationDefinition.iterations }` and tests `!== undefined`.
interface Definition {
  duration?: number;
  iterations?: number;
  opacity?: number;
}
function copy(definition: any): any[] {
  const animations: any[] = [];
  animations.push({ duration: definition.duration, iterations: definition.iterations, opacity: definition.opacity });
  return animations;
}
const made: any = copy({ opacity: 0.5 })[0];
console.log(made.iterations === undefined, made.duration === undefined, made.opacity, JSON.stringify(made));
console.log(made.iterations !== undefined ? 'set' : 'unset');
