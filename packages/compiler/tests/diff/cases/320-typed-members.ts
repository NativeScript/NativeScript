// @lenient
// Members a registered property gives its class natively: the accessor `register` defines, and what script
// does at run time that changes which accessor the prototype chain resolves the name to.
const events: string[] = [];

class Property<T, U> {
  public readonly name: string;
  public readonly key: symbol;
  public readonly setNative: symbol;
  public readonly defaultValue: U;
  public get: () => U;
  public set: (value: U) => void;
  public enumerable = true;
  public configurable = true;

  constructor(options: { name: string; defaultValue?: U; valueChanged?: (target: T, oldValue: U, newValue: U) => void }) {
    const name = options.name;
    this.name = name;
    const key = Symbol(name + ':propertyKey');
    this.key = key;
    const setNative = Symbol(name + ':setNative');
    this.setNative = setNative;
    const defaultValue = options.defaultValue;
    this.defaultValue = defaultValue;
    const valueChanged = options.valueChanged;
    this.set = function (this: any, value: U): void {
      const old = key in this ? this[key] : defaultValue;
      if (old === value) {
        return;
      }
      this[key] = value;
      if (valueChanged) {
        valueChanged(this, old, value);
      }
      if (this[setNative]) {
        this[setNative](value);
      }
      this.notify(name + 'Change', value);
    };
    this.get = function (this: any): U {
      return key in this ? this[key] : defaultValue;
    };
  }

  register(cls: { prototype: any }): void {
    Object.defineProperty(cls.prototype, this.name, this);
  }
}

class Observable {
  notify(event: string, value: any) {
    events.push(`notify ${event}=${value}`);
  }
}

const textProperty = new Property<View, string>({ name: 'text', defaultValue: '', valueChanged: (t, o, n) => events.push(`changed ${o}->${n}`) });
const sizeProperty = new Property<View, number>({ name: 'size', defaultValue: 1 });

class View extends Observable {
  text: string;
  size: number;
  col: number;
  [textProperty.setNative](value: string) {
    events.push(`native ${value}`);
  }
}

// Written before its property is registered: the instance's own value, which the accessor never sees.
const early = new View();
early.size = 7;
textProperty.register(View);
sizeProperty.register(View);
console.log(early.size, early.hasOwnProperty('size'));

// The set's order: the change handler, the native setter, then the event.
const v = new View();
console.log(JSON.stringify(v.text), v.size);
v.text = 'one';
v.text = 'one';
console.log(v.text, events.join(' | '));
events.length = 0;

// A field a base declares, registered on a subclass: the subclass's accessor.
const colProperty = new Property<View, number>({ name: 'col', defaultValue: 0 });
class Cell extends View {}
colProperty.register(Cell);
const cell = new Cell();
cell.col = 2;
console.log(cell.col, events.join(' | '));
events.length = 0;

// A subclass registering a property under the same name: its own.
const labelTextProperty = new Property<View, string>({ name: 'text', defaultValue: 'label' });
class Label extends View {}
labelTextProperty.register(Label);
const label = new Label();
console.log(label.text, v.text);
label.text = 'two';
console.log(label.text, v.text, events.join(' | '));
events.length = 0;

// An instance's own property, defined at run time, hides the class's.
const own = new View();
Object.defineProperty(own, 'text', { get: () => 'own', set: (x: string) => events.push(`own set ${x}`), configurable: true });
own.text = 'three';
console.log(own.text, v.text, events.join(' | '));
events.length = 0;
delete (own as any).text;
console.log(JSON.stringify(own.text));

// A prototype patched at run time: the subclass's instances read the patch, the base's keep the property.
class Button extends View {}
Object.defineProperty(Button.prototype, 'size', { get: () => 99, set: (x: number) => events.push(`patched ${x}`), configurable: true });
const button = new Button();
button.size = 5;
console.log(button.size, v.size, events.join(' | '));
events.length = 0;

// The registering class's own prototype redefined, then the name deleted from it.
Object.defineProperty(View.prototype, 'size', { get: () => -1, set: (x: number) => events.push(`redefined ${x}`), configurable: true });
v.size = 3;
console.log(v.size, cell.size, events.join(' | '));
delete View.prototype.size;
cell.size = 4;
console.log(cell.size, cell.hasOwnProperty('size'));
