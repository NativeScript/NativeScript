// @lenient
// View property access by name, shaped as @nativescript/core's dynamic paths: style-scope applying a rule's declarations
// (`property in view.style`, `view.style['css:' + property] = value`, else `view[camelCased] = value`), a Binding
// updating a view through Observable.set (`this[name]` read twice, then written), and core's Builder setting XML
// attributes (`instance[attr] = value`). The properties are core's Property and CssProperty, registered on the classes.
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

interface CssPropertyOptions<T, U> {
  name: string;
  cssName: string;
  defaultValue?: U;
  affectsLayout?: boolean;
  valueConverter?: (value: string) => U;
}

const enum ValueSource {
  Default = 0,
  Css = 2,
  Local = 3,
}

class CssProperty<T extends Style, U> {
  public readonly name: string;
  public readonly cssName: string;
  public readonly cssLocalName: string;
  public readonly key: symbol;
  public readonly sourceKey: symbol;
  public readonly setNative: symbol;
  public readonly defaultValueKey: symbol;
  public readonly defaultValue: U;
  protected readonly cssValueDescriptor: PropertyDescriptor;
  protected readonly localValueDescriptor: PropertyDescriptor;

  constructor(options: CssPropertyOptions<T, U>) {
    const propertyName = options.name;
    this.name = propertyName;
    this.cssName = `css:${options.cssName}`;
    this.cssLocalName = options.cssName;
    const key = Symbol(propertyName + ':propertyKey');
    this.key = key;
    const sourceKey = Symbol(propertyName + ':valueSourceKey');
    this.sourceKey = sourceKey;
    const setNative = Symbol(propertyName + ':setNative');
    this.setNative = setNative;
    const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
    this.defaultValueKey = defaultValueKey;
    const defaultValue: U = options.defaultValue;
    this.defaultValue = defaultValue;
    const affectsLayout = options.affectsLayout;
    const valueConverter = options.valueConverter;

    function setValue(style: T, newValue: U | string, source: ValueSource): void {
      const view = style.viewRef.get();
      if (!view) {
        return;
      }
      const current: number = style[sourceKey] || ValueSource.Default;
      if (source === ValueSource.Css && current === ValueSource.Local) {
        return;
      }
      const reset = newValue === unsetValue || newValue === '';
      let value: U;
      if (reset) {
        value = defaultValue;
        delete style[sourceKey];
      } else {
        style[sourceKey] = source;
        value = valueConverter && typeof newValue === 'string' ? valueConverter(newValue) : <U>newValue;
      }
      const oldValue = <U>(key in style ? style[key] : defaultValue);
      if (oldValue !== value) {
        if (reset) {
          delete style[key];
        } else {
          style[key] = value;
        }
        if (view[setNative]) {
          if (!(defaultValueKey in style)) {
            style[defaultValueKey] = defaultValue;
          }
          view[setNative](value);
        }
        if (style.hasListeners(propertyName + 'Change')) {
          style.notify({ object: style, propertyName, value, oldValue });
        }
        if (affectsLayout) {
          view.requestLayout();
        }
      }
    }

    function get(): U {
      return key in this ? this[key] : defaultValue;
    }

    this.cssValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: get,
      set: function (this: T, value: U | string) {
        setValue(this, value, ValueSource.Css);
      },
    };
    this.localValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: get,
      set: function (this: T, value: U | string) {
        this._localValueVersion++;
        setValue(this, value, ValueSource.Local);
      },
    };
  }

  register(cls: { prototype: T }): void {
    Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
    Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
    if (this.cssLocalName !== this.name) {
      Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
    }
  }
}

class Observable {
  private listeners: { [event: string]: number } = {};
  changes = 0;
  hasListeners(event: string): boolean {
    return !!this.listeners[event];
  }
  notify(data: any) {}
  notifyPropertyChange(name: string, value: any, oldValue: any) {
    this.changes++;
  }
  set(name: string, value: any): void {
    const oldValue = this[name];
    if (this[name] === value) {
      return;
    }
    this[name] = value;
    this.notifyPropertyChange(name, value, oldValue);
  }
}

class ViewRef {
  constructor(private view: ViewBase) {}
  get(): ViewBase {
    return this.view;
  }
}

class Style extends Observable {
  viewRef: ViewRef;
  _localValueVersion = 0;
  color: string;
  fontSize: number;
  backgroundColor: string;
  constructor(view: ViewBase) {
    super();
    this.viewRef = new ViewRef(view);
  }
}

class ViewBase extends Observable {
  _suspendNativeUpdatesCount = 0;
  _suspendedUpdates: { [name: string]: Property<ViewBase, any> } = null;
  domNode: { attributeModified(name: string, value: any): void } = null;
  layoutRequests = 0;
  style: Style;
  constructor() {
    super();
    this.style = new Style(this);
  }
  requestLayout() {
    this.layoutRequests++;
  }
}

const widthProperty = new Property<View, number>({ name: 'width', defaultValue: 0, affectsLayout: true });
const opacityProperty = new Property<View, number>({ name: 'opacity', defaultValue: 1 });
const textWrapProperty = new Property<View, boolean>({ name: 'textWrap', defaultValue: false, affectsLayout: true });
const textProperty = new Property<TextBase, string>({ name: 'text', defaultValue: '', affectsLayout: true });
const colorProperty = new CssProperty<Style, string>({ name: 'color', cssName: 'color', defaultValue: '' });
const fontSizeProperty = new CssProperty<Style, number>({ name: 'fontSize', cssName: 'font-size', defaultValue: 17, affectsLayout: true, valueConverter: (v) => parseFloat(v) });
const backgroundColorProperty = new CssProperty<Style, string>({ name: 'backgroundColor', cssName: 'background-color', defaultValue: '' });

class View extends ViewBase {
  native = 0;
  width: number;
  opacity: number;
  [widthProperty.setNative](value: number) {
    this.native += value;
  }
  [colorProperty.setNative](value: string) {
    this.native += value.length;
  }
  [fontSizeProperty.setNative](value: number) {
    this.native += value;
  }
}

class TextBase extends View {
  text: string;
  textWrap: boolean;
  [textProperty.setNative](value: string) {
    this.native += value.length;
  }
}

class Label extends TextBase {}

widthProperty.register(View);
opacityProperty.register(View);
textWrapProperty.register(TextBase);
textProperty.register(TextBase);
colorProperty.register(Style);
fontSizeProperty.register(Style);
backgroundColorProperty.register(Style);

// style-scope camel-cases with a regex; precomputed here, so the runtime's regex is not what is measured.
const camelCased: { [property: string]: string } = { 'text-wrap': 'textWrap' };
const declarations: [string, any][] = [
  ['color', 'red'],
  ['font-size', '14'],
  ['background-color', 'blue'],
  ['text-wrap', true],
];

/** style-scope's applying of a rule's declarations to a view. */
function applyCss(view: View, values: [string, any][]) {
  for (let i = 0; i < values.length; i++) {
    const property = values[i][0];
    const value = values[i][1];
    if (property in view.style) {
      view.style[`css:${property}`] = value;
    } else {
      view[camelCased[property]] = value;
    }
  }
}

/** 100 rows of four labels: created as core's Builder does from XML, styled by a rule, then bound to a row's item. */
function build(round: number): number {
  let check = 0;
  const attributes: [string, any][] = [
    ['text', 'Cell'],
    ['width', 10 + round],
    ['opacity', 0.5],
  ];
  for (let i = 0; i < 100; i++) {
    for (let k = 0; k < 4; k++) {
      const label: Label = new Label();
      for (let a = 0; a < attributes.length; a++) label[attributes[a][0]] = attributes[a][1];
      applyCss(label, declarations);
      label.set('text', 'Row ' + i + '.' + k);
      label.set('opacity', k / 4);
      label.set('opacity', k / 4);
      check += label['text'].length + label['width'] + label['opacity'] + label.style['fontSize'] + label.style.color.length + label.native + label.layoutRequests + label.changes;
    }
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
