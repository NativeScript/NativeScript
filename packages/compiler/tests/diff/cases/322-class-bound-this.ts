// @lenient
// A class's type parameter bound by a class (`T extends ViewBase`) is that class where the code is typed by it:
// a function's `this: T`, a field holding `(owner: T) => void`, a parameter, a cast `<T>this`. A class's
// prototype, typed as its instances are (`{ prototype: T }`), is still the prototype.
const calls: string[] = [];

class ViewBase {
  parent: ViewBase = null;
  children: ViewBase[] = [];
  layouts = 0;
  name = 'view';
  requestLayout() {
    this.layouts++;
  }
  eachChild(callback: (child: ViewBase) => boolean) {
    for (const c of this.children) callback(c);
  }
  addChild(child: ViewBase) {
    child.parent = this;
    this.children.push(child);
  }
}

class Property<T extends ViewBase, U> {
  public readonly name: string;
  public readonly key: symbol;
  public readonly setNative: symbol;
  public readonly getDefault: symbol;
  public readonly defaultValueKey: symbol;
  public readonly defaultValue: U;
  public get: () => U;
  public set: (value: U) => void;
  public readonly nativeValueChange: (owner: T, value: U) => void;
  public enumerable = true;
  public configurable = true;

  constructor(options: { name: string; defaultValue: U; affectsLayout?: boolean }) {
    const name = options.name;
    this.name = name;
    const key = Symbol(name);
    this.key = key;
    const setNative = Symbol(name + ':setNative');
    this.setNative = setNative;
    const getDefault = Symbol(name + ':getDefault');
    this.getDefault = getDefault;
    const defaultValueKey = Symbol(name + ':nativeDefaultValue');
    this.defaultValueKey = defaultValueKey;
    const defaultValue = options.defaultValue;
    this.defaultValue = defaultValue;
    const affectsLayout = options.affectsLayout;
    this.set = function (this: T, value: U): void {
      const old = key in this ? this[key] : defaultValue;
      if (old === value) return;
      this[key] = value;
      if (affectsLayout) this.requestLayout();
      calls.push(`${this.name}.${name}=${value}`);
      if (this[setNative]) {
        if (!(defaultValueKey in this)) {
          this[defaultValueKey] = this[getDefault] ? this[getDefault]() : defaultValue;
        }
        this[setNative](value);
      }
    };
    this.get = function (this: T): U {
      return <U>(key in this ? this[key] : defaultValue);
    };
    this.nativeValueChange = function (owner: T, value: U): void {
      owner[key] = value;
      calls.push(`native ${owner.name}.${name}=${value}`);
    };
  }

  register(cls: { prototype: T }): void {
    Object.defineProperty(cls.prototype, this.name, this);
  }

  isSet(instance: T): boolean {
    return this.key in instance;
  }
}

class InheritedProperty<T extends ViewBase, U> extends Property<T, U> {
  constructor(options: { name: string; defaultValue: U }) {
    super(options);
    const setBase = this.set;
    const name = options.name;
    this.set = function (value: U): void {
      const that = <T>this;
      setBase.call(that, value);
      that.eachChild((child) => {
        child[name] = value;
        return true;
      });
    };
  }
}

const widthProperty = new Property<View, number>({ name: 'width', defaultValue: 0, affectsLayout: true });
const colorProperty = new InheritedProperty<View, string>({ name: 'color', defaultValue: 'black' });

class View extends ViewBase {
  width: number;
  color: string;
  [widthProperty.getDefault](): number {
    return -1;
  }
  [widthProperty.setNative](value: number) {
    calls.push(`native width ${value}`);
  }
}
widthProperty.register(View);
colorProperty.register(View);

const root = new View();
root.name = 'root';
const child = new View();
child.name = 'child';
root.addChild(child);
console.log(root.width, widthProperty.isSet(root), root.color);
root.width = 10;
root.width = 10;
root.color = 'red';
console.log(root.width, root.layouts, widthProperty.isSet(root), child.color, colorProperty.isSet(child));
widthProperty.set.call(child, 4);
widthProperty.nativeValueChange(child, 5);
console.log(child.width, child.layouts, widthProperty.get.call(child), root[widthProperty.defaultValueKey], widthProperty.defaultValueKey in child);
delete root[widthProperty.defaultValueKey];
console.log(widthProperty.defaultValueKey in root);
console.log(Object.getOwnPropertyNames(View.prototype).filter((n) => n === 'width' || n === 'color').join());
console.log(calls.join(' | '));
