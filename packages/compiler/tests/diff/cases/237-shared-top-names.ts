// Top-level names several modules declare, two of them files of the same name in other folders: each keeps its own.
import { label as labelOne, Item as ItemOne, limit as limitOne } from './helpers/shared-names/one/index.ts';
import { label as labelTwo, Item as ItemTwo, limit as limitTwo } from './helpers/shared-names/two/index.ts';
function label(): string {
  return 'case';
}
console.log(labelOne(), labelTwo(), label(), new ItemOne().name, new ItemTwo().name, limitOne + limitTwo);
