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

function checked(v: number): number {
  if (v < 0) throw new Error('negative');
  return v;
}
class Sized {
  private _w = 0;
  get width(): number {
    return checked(this._w);
  }
  set width(v: number) {
    this._w = checked(v);
  }
}
const sized = new Sized();
sized.width = 3;
console.log(sized.width);

// Method values carried by locals, made by local functions, passed back to fields (InheritedProperty).
class Tagged extends Property<Base, string> {
  public readonly setTagged: (value: string) => void;
  constructor(options: { name: string; defaultValue?: string }) {
    super(options);
    const setBase = this.set;
    const setFunc = (tag: string) =>
      function (value: string): void {
        setBase.call(this, `${tag}:${value}`);
      };
    const setTagged = setFunc('tagged');
    this.setTagged = setTagged;
    this.set = setFunc('local');
  }
}
const tagged = new Tagged({ name: 'label', defaultValue: '-' });
tagged.register(Base);
const t1 = new Base();
t1['label'] = 'x';
console.log(t1['label'], t1.log.join());
tagged.setTagged.call(t1, 'y');
console.log(t1['label']);

// A field a subclass redeclares narrower is the base's, and untyped values read as objects may be undefined.
class Holder {
  native: any;
  label(): string {
    return this.native ? 'set' : 'unset';
  }
}
class Named {
  constructor(public name: string) {}
}
class NamedHolder extends Holder {
  native: Named;
  describe(): string {
    return this.native ? this.native.name : 'none';
  }
}
const holder = new NamedHolder();
console.log(holder.describe(), holder.label());
holder.native = new Named('n1');
console.log(holder.describe(), holder.label());
const loose: any = {};
const missing: Named = loose.named;
console.log(missing === undefined, missing?.name);
