// @app-lenient
// A non-strict app's members whose callers the program can't see take what any caller may give: an object literal's
// methods called by a computed key (a typed literal's with nothing, an untyped one's with null), and an Angular class's
// public methods and setters, which the framework calls (forms reset a value accessor with null).
import '@angular/compiler';
import { Injectable, Injector } from '@angular/core';

class Item { name: string; constructor(name: string) { this.name = name; } }

const commands = {
  run(name: string) { return name ? `run ${name}` : 'run nothing'; },
  open(item: Item) { return item ? `open ${item.name}` : 'open nothing'; },
  count: (items: Item[]) => (items ? `${items.length} items` : 'no items'),
};
console.log(commands.run('a'), commands.open(new Item('b')), commands.count([new Item('c')]));
for (const key of Object.keys(commands)) console.log(commands[key]());
const handlers: any = {
  greet(name: string) { return name ? `hello ${name}` : 'hello nobody'; },
  show(item: Item) { return item ? `show ${item.name}` : 'show nothing'; },
};
const verb = ['gre', 'et'].join('');
console.log(handlers.greet('d'), handlers[verb](null), handlers[verb](), handlers[verb]('e'));
for (const key of Object.keys(handlers)) console.log(handlers[key](null));

@Injectable({ providedIn: 'root' })
class FieldAccessor {
  value: Item = new Item('start');
  label = '';
  writeValue(v: Item) { this.value = v; return v ? `wrote ${v.name}` : 'reset'; }
  set current(v: Item) { this.value = v; }
  get current() { return this.value; }
  rename(label: string) { this.label = label; return `${this.label.length}`; }
  describe() { return `${this.value.name}/${this.label}`; }
}

const field = Injector.create({ providers: [{ provide: FieldAccessor, useClass: FieldAccessor }] }).get(FieldAccessor);
field.current = new Item('set');
console.log(field.writeValue(new Item('x')), field.rename('y'), field.describe(), field.current.name);
