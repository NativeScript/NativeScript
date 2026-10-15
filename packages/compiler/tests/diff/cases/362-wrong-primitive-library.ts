// @lenient-kotlin
// Core's typed fields, set and called by name as bindings and XML do, given another primitive than they declare:
// read where they are used, as JavaScript reads the value it holds.
class Field {
  text: string = '';
  count: number = 0;
  enabled: boolean = false;
  title?: string;
  size?: number;
  visible?: boolean;
  label = '';
  setLabel(value: string): void {
    this.label = 'label ' + value;
  }
  scaled(factor: number): number {
    return this.count * factor;
  }
}
const field = new Field();
const byName = field as any;
byName['text'] = 5;
byName['count'] = '7';
byName['enabled'] = 1;
byName['title'] = 42;
byName['size'] = '12';
byName['visible'] = 'yes';
console.log(`${field.text}`, field.count * 2, field.enabled ? 'on' : 'off');
console.log(`${field.title}`, field.size + 1 > 12, field.visible ? 'shown' : 'hidden');
byName.setLabel(42);
console.log(field.label, byName.scaled('3'));
byName['enabled'] = 0;
byName['visible'] = '';
console.log(field.enabled ? 'on' : 'off', field.visible ? 'shown' : 'hidden');

interface Options {
  affectsLayout?: boolean;
  name?: string;
}
function describe(options: Options): string {
  let affects = false;
  let name = 'none';
  if (typeof options.affectsLayout !== 'undefined') {
    affects = options.affectsLayout;
  }
  if (options.name) {
    name = options.name;
  }
  return `${affects ? 'layout' : 'no layout'} ${name}`;
}
console.log(describe({ affectsLayout: 1, name: 7 } as any));
console.log(describe({}));
