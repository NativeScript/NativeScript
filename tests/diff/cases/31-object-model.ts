// @lenient
// The object model @nativescript/core's property system is built on: symbol-keyed
// storage, accessors defined on prototypes, methods named by symbols.
const symbolPropertyMap = {};

class Property<T, U> {
  public readonly name: string;
  public readonly key: symbol;
  public readonly setNative: symbol;
  public readonly defaultValue: U;
  public get: () => U;
  public set: (value: U) => void;
  public enumerable = true;
  public configurable = true;

  constructor(options: { name: string; defaultValue?: U }) {
    const name = options.name;
    this.name = name;
    const key = Symbol(name + ':propertyKey');
    this.key = key;
    const setNative = Symbol(name + ':setNative');
    this.setNative = setNative;
    const defaultValue = options.defaultValue;
    this.defaultValue = defaultValue;
    this.set = function (this: any, value: U): void {
      const old = key in this ? this[key] : defaultValue;
      if (old === value) {
        return;
      }
      this[key] = value;
      if (this[setNative]) {
        this[setNative](value);
      }
      this.notify(name + 'Change', value);
    };
    this.get = function (this: any): U {
      return key in this ? this[key] : defaultValue;
    };
    symbolPropertyMap[key] = this;
  }

  register(cls: { prototype: any }): void {
    Object.defineProperty(cls.prototype, this.name, this);
  }
}

class Observable {
  log: string[] = [];
  notify(event: string, value: any) {
    this.log.push(`${event}=${value}`);
  }
  set(name: string, value: any) {
    this[name] = value;
  }
  get(name: string): any {
    return this[name];
  }
}

const textProperty = new Property<Base, string>({ name: 'text', defaultValue: '' });

class Base extends Observable {
  text: string;
  native = '';
  [textProperty.setNative](value: string) {
    this.native = `base:${value}`;
  }
}
textProperty.register(Base);

class Derived extends Base {
  [textProperty.setNative](value: string) {
    this.native = `derived:${value}`;
  }
}

const b = new Base();
console.log(JSON.stringify(b.text), b.native);
b.text = 'one';
b.text = 'one';
console.log(b.text, b.native, b.log.join());
const d = new Derived();
d.set('text', 'two');
console.log(d.get('text'), d.native, d.text);
console.log(Object.getOwnPropertySymbols(d).length, textProperty.key in d, 'text' in d, textProperty.setNative in d);
delete d[textProperty.key];
console.log(JSON.stringify(d.text));
textProperty.set.call(d, 'three');
console.log(d.text, d.native, d.log.join());
const extra: any = d;
extra.custom = 5;
console.log(extra.custom, 'custom' in d, symbolPropertyMap[textProperty.key] === textProperty);
