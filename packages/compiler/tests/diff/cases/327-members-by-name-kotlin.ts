// @lenient-kotlin
// Members read and written by name (`view[name]`, `name in view`, Observable.set's `this[name]`): a registered
// property's accessor, the names a registration defines beside it, and what script changes on the prototypes
// after a name was looked up.
const events: string[] = [];

class Property<T, U> {
  public readonly name: string;
  public readonly key: symbol;
  public get: () => U;
  public set: (value: U) => void;
  public enumerable = true;
  public configurable = true;

  constructor(options: { name: string; defaultValue?: U }) {
    const name = options.name;
    this.name = name;
    const key = Symbol(name + ':propertyKey');
    this.key = key;
    const defaultValue = options.defaultValue;
    this.set = function (this: any, value: U): void {
      events.push(`set ${name}=${value}`);
      this[key] = value;
    };
    this.get = function (this: any): U {
      return key in this ? this[key] : defaultValue;
    };
  }

  register(cls: { prototype: any }): void {
    Object.defineProperty(cls.prototype, this.name, this);
    Object.defineProperty(cls.prototype, 'css:' + this.name, { get: this.get, set: this.set, configurable: true });
  }
}

class Observable {
  set(name: string, value: any): void {
    const oldValue = this[name];
    if (this[name] === value) {
      return;
    }
    this[name] = value;
    events.push(`changed ${name} ${oldValue}->${this[name]}`);
  }
}

const textProperty = new Property<View, string>({ name: 'text', defaultValue: '' });
const widthProperty = new Property<View, number>({ name: 'width', defaultValue: 0 });

class View extends Observable {
  text: string;
  width: number;
  plain = 1;
}
textProperty.register(View);
widthProperty.register(View);

const labelTextProperty = new Property<View, string>({ name: 'text', defaultValue: 'label' });
class Label extends View {}
labelTextProperty.register(Label);
class Button extends View {}

const v = new View();
const label = new Label();
const button = new Button();
const names = ['text', 'width', 'plain', 'css:text', 'missing'];
for (const n of names) console.log(n, JSON.stringify(v[n]), JSON.stringify(label[n]), n in v, n in label);
v['text'] = 'one';
label['css:text'] = 'two';
button['width'] = 3;
console.log(v.text, label.text, button.width, v['css:text'], label['text'], events.join(' | '));
events.length = 0;

label.set('text', 'three');
label.set('text', 'three');
v.set('plain', 2);
console.log(label.text, v.plain, events.join(' | '));
events.length = 0;

// A name looked up by name before script puts it on a prototype, then after.
console.log(JSON.stringify(button['missing']), 'missing' in button);
(View.prototype as any).missing = 'proto';
console.log(button['missing'], 'missing' in button, label['missing']);
Object.defineProperty(Button.prototype, 'missing', { get: () => 'button', configurable: true });
console.log(button['missing'], label['missing']);
delete (Button.prototype as any).missing;
console.log(button['missing']);
Object.assign(Label.prototype, { missing: 'assigned' });
console.log(label['missing'], button['missing']);

// An instance's own property under a registered name, given by name.
Object.defineProperty(button, 'text', { value: 'own', writable: true, configurable: true });
button['text'] = 'own2';
console.log(button['text'], button.text, v['text'], events.join(' | '));
events.length = 0;

// The registered name redefined on a subclass's prototype after it was read by name.
console.log(label['width']);
Object.defineProperty(Label.prototype, 'width', { get: () => -1, set: (x: number) => events.push(`patched ${x}`), configurable: true });
label['width'] = 9;
console.log(label['width'], v['width'], events.join(' | '));
