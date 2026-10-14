// Top-level names several modules declare, two of them files of the same name in other folders: each keeps its own,
// destructured ones too, and a function passed by its name is the module's own.
import { label as labelOne, Item as ItemOne, limit as limitOne } from './helpers/shared-names/one/index.ts';
import { label as labelTwo, Item as ItemTwo, limit as limitTwo } from './helpers/shared-names/two/index.ts';
import { label as labelThree, apply, labels, width, first } from './helpers/shared-names/three/index.ts';
function label(): string {
  return 'case';
}
const { height } = { height: 10 };
const [second] = ['z'];
console.log(labelOne(), labelTwo(), label(), new ItemOne().name, new ItemTwo().name, limitOne + limitTwo);
console.log(apply(label), apply(labelOne), apply(labelThree), labels.join(), width, height, first, second);
