// An object asserted from an untyped value (`args.object as View`), passed on and used only where present.
class View {
  constructor(public id: string) {}
  describe() { return `view ${this.id}`; }
}
const registry: any = { header: new View('header') };

function show(view: View | undefined): string {
  return view ? view.describe() : 'nothing to show';
}
console.log(show(registry.header as View), show(registry.footer as View));
const footer: View | undefined = registry.footer as View;
if (footer) console.log('footer present');
else console.log('no footer', footer === undefined);
const slots: { top?: View; bottom?: View } = { top: registry.header as View, bottom: registry.footer as View };
console.log(slots.top?.describe(), slots.bottom?.describe(), slots.bottom === undefined);
const header = registry.header as View;
console.log(header && header.describe(), (registry.footer as View)?.describe() ?? 'absent');
const chosen = (registry.footer as View) || (registry.header as View);
console.log(chosen.describe());
