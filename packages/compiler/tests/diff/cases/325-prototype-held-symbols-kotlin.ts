// @lenient-kotlin
// What core's property classes keep under their symbols: on an instance once it has its own, and on the class's
// prototype (`cls.prototype[computedValue] = defaultValue`) for every instance that has none.
class Style {
  notified: string[] = [];
  opacity: number;
  scaleX: number;
}

class CssAnimationProperty<T extends Style, U> {
  public readonly name: string;
  public readonly key: symbol;
  public readonly source: symbol;
  public register: (cls: { prototype: T }) => void;

  constructor(options: { name: string; defaultValue: U }) {
    const propertyName = options.name;
    this.name = propertyName;
    const computedValue = Symbol('computed-value:' + propertyName);
    this.key = computedValue;
    const computedSource = Symbol('computed-source:' + propertyName);
    this.source = computedSource;
    const localValue = Symbol('local:' + propertyName);
    const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');

    function descriptor(getsComputed: boolean): PropertyDescriptor {
      return {
        enumerable: true,
        configurable: true,
        get: getsComputed
          ? function (this: T) {
              return this[computedValue];
            }
          : function (this: T) {
              return this[localValue];
            },
        set(this: T, value: U) {
          const oldValue = this[computedValue];
          if (<any>value === -1) {
            delete this[localValue];
            delete this[computedSource];
            delete this[computedValue];
          } else {
            this[localValue] = value;
            if (this[computedSource] <= 1) {
              this[computedSource] = 1;
              this[computedValue] = value;
            }
          }
          if (!(defaultValueKey in this)) {
            this[defaultValueKey] = oldValue;
          }
          this.notified.push(`${propertyName} ${oldValue}->${this[computedValue]} default ${this[defaultValueKey]}`);
        },
      };
    }

    this.register = (cls: { prototype: T }) => {
      cls.prototype[computedValue] = options.defaultValue;
      cls.prototype[computedSource] = 0;
      Object.defineProperty(cls.prototype, propertyName, descriptor(true));
      Object.defineProperty(cls.prototype, 'local:' + propertyName, descriptor(false));
    };
  }
}

const opacityProperty = new CssAnimationProperty<Style, number>({ name: 'opacity', defaultValue: 1 });
const scaleXProperty = new CssAnimationProperty<Style, number>({ name: 'scaleX', defaultValue: 1 });
opacityProperty.register(Style);
scaleXProperty.register(Style);

const a = new Style();
const b = new Style();
console.log(a.opacity, a.scaleX, opacityProperty.key in a, a.hasOwnProperty(opacityProperty.key));
a.opacity = 0.5;
console.log(a.opacity, b.opacity, a.hasOwnProperty(opacityProperty.key), b.hasOwnProperty(opacityProperty.key));
a.opacity = -1;
console.log(a.opacity, a[opacityProperty.source], a.notified.join(' | '));
b.scaleX = 2;
b.scaleX = 3;
console.log(b.scaleX, a.scaleX, b['local:scaleX'], a['local:scaleX'], b.notified.join(' | '));
