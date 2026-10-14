// @lenient
// View property access shaped as @nativescript/core's: a Property whose `set` and `get` are core's (converter, comparer,
// requestLayout, symbol-keyed storage, the default captured from getDefault, setNative or the suspended queue, the change
// event, domNode), registered on view classes, then set and read through the views' members as an app's code does.
const unsetValue = {};

interface PropertyOptions<T, U> {
  name: string;
  defaultValue?: U;
  affectsLayout?: boolean;
  equalityComparer?: (x: U, y: U) => boolean;
  valueChanged?: (target: T, oldValue: U, newValue: U) => void;
  valueConverter?: (value: string) => U;
}

class Property<T extends ViewBase, U> {
  public readonly name: string;
  public readonly key: symbol;
  public readonly getDefault: symbol;
  public readonly setNative: symbol;
  public readonly defaultValueKey: symbol;
  public readonly defaultValue: U;
  public get: () => U;
  public set: (value: U) => void;
  public enumerable = true;
  public configurable = true;

  constructor(options: PropertyOptions<T, U>) {
    const propertyName = options.name;
    this.name = propertyName;
    const key = Symbol(propertyName + ':propertyKey');
    this.key = key;
    const getDefault = Symbol(propertyName + ':getDefault');
    this.getDefault = getDefault;
    const setNative = Symbol(propertyName + ':setNative');
    this.setNative = setNative;
    const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
    this.defaultValueKey = defaultValueKey;
    const defaultValue: U = options.defaultValue;
    this.defaultValue = defaultValue;
    const eventName = propertyName + 'Change';
    const equalityComparer = options.equalityComparer;
    const affectsLayout = options.affectsLayout;
    const valueChanged = options.valueChanged;
    const valueConverter = options.valueConverter;
    const property = this;

    this.set = function (this: T, boxedValue: U): void {
      const reset = boxedValue === unsetValue;
      let value: U;
      if (reset) {
        value = defaultValue;
      } else {
        value = boxedValue;
        if (valueConverter && typeof value === 'string') {
          value = valueConverter(value);
        }
      }
      const oldValue = <U>(key in this ? this[key] : defaultValue);
      const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;
      if (changed) {
        if (affectsLayout) {
          this.requestLayout();
        }
        if (reset) {
          delete this[key];
          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }
          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else if (defaultValueKey in this) {
              this[setNative](this[defaultValueKey]);
              delete this[defaultValueKey];
            } else {
              this[setNative](defaultValue);
            }
          }
        } else {
          this[key] = value;
          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }
          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = this[getDefault] ? this[getDefault]() : defaultValue;
              }
              this[setNative](value);
            }
          }
        }
        if (this.hasListeners(eventName)) {
          this.notify({ object: this, eventName, propertyName, value, oldValue });
        }
        if (this.domNode) {
          this.domNode.attributeModified(propertyName, value);
        }
      }
    };

    this.get = function (this: T): U {
      return <U>(key in this ? this[key] : defaultValue);
    };
  }

  register(cls: { prototype: T }): void {
    Object.defineProperty(cls.prototype, this.name, this);
  }
}

const widthProperty = new Property<View, number>({ name: 'width', defaultValue: 0, affectsLayout: true });
const opacityProperty = new Property<View, number>({ name: 'opacity', defaultValue: 1 });
const classNameProperty = new Property<View, string>({ name: 'className', defaultValue: '' });
const textProperty = new Property<TextBase, string>({ name: 'text', defaultValue: '', affectsLayout: true });
const orientationProperty = new Property<StackLayout, string>({ name: 'orientation', defaultValue: 'vertical', affectsLayout: true });

class ViewBase {
  _suspendNativeUpdatesCount = 0;
  _suspendedUpdates: { [name: string]: Property<ViewBase, any> } = null;
  domNode: { attributeModified(name: string, value: any): void } = null;
  layoutRequests = 0;
  private listeners: { [event: string]: number } = {};
  hasListeners(event: string): boolean {
    return !!this.listeners[event];
  }
  notify(data: any) {}
  requestLayout() {
    this.layoutRequests++;
  }
}

class View extends ViewBase {
  native = 0;
  width: number;
  opacity: number;
  className: string;
  [widthProperty.setNative](value: number) {
    this.native += value;
  }
}

class TextBase extends View {
  text: string;
  [textProperty.getDefault](): string {
    return '';
  }
  [textProperty.setNative](value: string) {
    this.native += value.length;
  }
}

class Label extends TextBase {}

class StackLayout extends View {
  orientation: string;
}

widthProperty.register(View);
opacityProperty.register(View);
classNameProperty.register(View);
textProperty.register(TextBase);
orientationProperty.register(StackLayout);

/** 100 rows of a stack and four labels, as the bench app's views-500 builds them, each property then set again and read. */
function build(round: number): number {
  let check = 0;
  for (let i = 0; i < 100; i++) {
    const row = new StackLayout();
    row.orientation = 'horizontal';
    row.className = 'vrow';
    for (let k = 0; k < 4; k++) {
      const label = new Label();
      label.text = 'Cell ' + i + '.' + k;
      label.className = k === 0 ? 'vhead' : 'vcell';
      label.width = 10 + k + round;
      label.opacity = 0.5;
      label.text = label.text + '!';
      check += label.text.length + label.width + label.opacity + label.className.length + label.native + label.layoutRequests;
    }
    check += row.orientation.length + row.className.length + row.layoutRequests;
  }
  return check;
}

const times: number[] = [];
let check = 0;
for (let round = 0; round < 25; round++) {
  const t = Date.now();
  for (let n = 0; n < 20; n++) check += build(n);
  if (round >= 5) times.push(Date.now() - t);
}
times.sort((a, b) => a - b);
console.log(JSON.stringify({ median: times[Math.floor(times.length / 2)], min: times[0], check }));
