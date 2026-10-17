// Objects from untyped values placed in typed slots (a field, a variable, a parameter, a return, a literal field): JavaScript
// stores undefined and null as given, and throws only where a member of one is used.
class View {
  constructor(public id: string) {}
  describe() {
    return `view ${this.id}`;
  }
}
const registry: any = { header: new View('header'), empty: null };

class Screen {
  header: View = new View('default header');
  footer: View = new View('default footer');
}
const screen = new Screen();
screen.header = registry.header;
screen.footer = registry.footer;
console.log(screen.header.describe(), screen.footer === undefined, screen.footer ? 'footer' : 'no footer');

function show(view: View): string {
  return view ? view.describe() : 'nothing to show';
}
console.log(show(registry.header), show(registry.footer), show(registry.empty));

function find(id: string): View {
  return registry[id];
}
const found = find('none');
console.log(found === undefined, found?.describe() ?? 'not found', find('header').describe());

const chosen: View = registry.empty;
console.log(chosen === null || chosen === undefined, chosen ? 'truthy' : 'falsy');

interface Slots {
  top: View;
  bottom: View;
}
const slots: Slots = { top: registry.header, bottom: registry.footer };
console.log(slots.top.describe(), slots.bottom === undefined, slots.bottom?.describe() ?? 'no bottom');

try {
  console.log(find('none').describe());
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
try {
  console.log(screen.footer.id);
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
