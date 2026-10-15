// @lenient-both
// typeof tests core makes, checked as core is without strictNullChecks: a member its type calls a function or a
// boolean may be missing, a parameter narrowed to string may be undefined, and a variable declared without a value
// reads undefined until it is assigned.
interface ModalOptions {
  context?: unknown;
  closeCallback?: Function;
}
class ModalHost {
  log: string[] = [];
  closeModal(options: ModalOptions, ...args: unknown[]) {
    const whenClosed = () => {
      if (typeof options.closeCallback === 'function') {
        options.closeCallback.apply(undefined, args);
      }
      this.log.push('teardown');
      this.log.push('closedModally');
    };
    whenClosed();
  }
}
const host = new ModalHost();
try {
  host.closeModal({ context: 1 }, 'a');
  host.closeModal({ closeCallback: (x: string) => host.log.push('callback ' + x) }, 'b');
  console.log(host.log.join(','));
} catch (e) {
  console.log('threw', (e as Error).name, (e as Error).message);
}

interface PropertyOptions<T> {
  name: string;
  equalityComparer?: (a: T, b: T) => boolean;
  affectsLayout?: boolean;
  valueChanged?: (oldValue: T, newValue: T) => void;
}
class Property<T> {
  public overrideHandlers: (options: PropertyOptions<T>) => void;
  public describe: () => string;
  constructor(options: PropertyOptions<T>) {
    let equalityComparer = options.equalityComparer;
    let affectsLayout: boolean = options.affectsLayout;
    let valueChanged = options.valueChanged;
    this.overrideHandlers = function (options: PropertyOptions<T>) {
      if (typeof options.equalityComparer !== 'undefined') {
        equalityComparer = options.equalityComparer;
      }
      if (typeof options.affectsLayout !== 'undefined') {
        affectsLayout = options.affectsLayout;
      }
      if (typeof options.valueChanged !== 'undefined') {
        valueChanged = options.valueChanged;
      }
    };
    this.describe = () => [typeof equalityComparer, affectsLayout, typeof valueChanged, !!equalityComparer, !!valueChanged].join(' ');
  }
}
const property = new Property<number>({ name: 'width', equalityComparer: (a, b) => a === b, affectsLayout: true, valueChanged: () => {} });
console.log(property.describe());
console.log(new Property<number>({ name: 'height' }).describe());
property.overrideHandlers({ name: 'width', affectsLayout: false });
console.log(property.describe());
property.overrideHandlers({ name: 'width', valueChanged: undefined });
console.log(property.describe());

let a11yServiceEnabled: boolean;
function isA11yEnabled(): boolean {
  if (typeof a11yServiceEnabled === 'boolean') {
    return a11yServiceEnabled;
  }
  return undefined;
}
function setA11yEnabled(value: boolean): void {
  a11yServiceEnabled = value;
}
function isAccessibilityServiceEnabled(): string {
  const cached = isA11yEnabled();
  if (typeof cached === 'boolean') {
    return 'cached ' + cached;
  }
  return 'detected';
}
console.log(isA11yEnabled() === undefined, isA11yEnabled(), isAccessibilityServiceEnabled());
setA11yEnabled(false);
console.log(isA11yEnabled() === undefined, isA11yEnabled(), isAccessibilityServiceEnabled());

function firstPositive(xs: number[]): string {
  let found: boolean;
  let at: number;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] > 0) {
      found = true;
      at = i;
      break;
    }
  }
  return [typeof found, found, typeof at, at].join(' ');
}
console.log(firstPositive([-1, 2]), '|', firstPositive([-1]));

function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }
  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }
  return [];
}
console.log(enforceArray('a, b').length, enforceArray(['x']).length, enforceArray(undefined).length);
