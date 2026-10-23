// NgClass's and NgStyle's runtime (runtime/angular.ts) on stand-in views: the classes an element gets from its static
// class, NgClass's value and [class.x] as each changes, one className change at a time, and the styles NgStyle sets,
// removes and leaves. The code is the runtime's (a release-check compares it); NgClass and NgStyle take their view here.
const unsetValue = 'UNSET';

function ngClassNames(base: string, value: any, toggles: any[]): string {
  const names: string[] = [];
  const enabled: boolean[] = [];
  const decide = (written: string, on: boolean) => {
    for (const name of written.trim().split(/\s+/)) {
      if (!name) continue;
      const at = names.indexOf(name);
      if (at < 0) {
        names.push(name);
        enabled.push(on);
      } else enabled[at] = on;
    }
  };
  decide(base, true);
  if (typeof value === 'string') decide(value, true);
  else if (Array.isArray(value) || value instanceof Set) {
    for (const name of value) {
      if (typeof name !== 'string') throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${name}`);
      decide(name, true);
    }
  } else if (value != null && typeof value === 'object') {
    for (const key of Object.keys(value)) decide(key, !!value[key]);
  }
  for (let k = 0; k + 1 < toggles.length; k += 2) if (toggles[k + 1] !== undefined) decide(String(toggles[k]), !!toggles[k + 1]);
  return names.filter((_, k) => enabled[k]).join(' ');
}

class NgClass {
  private readonly view: any;
  constructor(view: any) {
    this.view = view;
  }
  private classes: string[] = [];
  private started = false;
  private names: string[] = [];
  private enabled: boolean[] = [];
  private changed: boolean[] = [];
  private touched: boolean[] = [];
  private toggled: any[] = [];

  apply(input: any[]): void {
    const base: string = input[0];
    const value: any = input[1];
    const toggles: any = input[2];
    const statics = base.trim().split(/\s+/).filter((c) => !!c);
    if (!this.started) {
      this.started = true;
      this.classes = statics.slice();
      this.view.className = this.classes.join(' ');
    }
    for (const name of statics) this.update(name, true);
    if (typeof value === 'string') {
      for (const name of value.trim().split(/\s+/)) this.update(name, true);
    } else if (Array.isArray(value) || value instanceof Set) {
      for (const name of value) {
        if (typeof name !== 'string') throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${name}`);
        this.update(name, true);
      }
    } else if (value != null && typeof value === 'object') {
      for (const key of Object.keys(value)) this.update(key, !!value[key]);
    }
    const names: string[] = [];
    const enabled: boolean[] = [];
    for (let k = 0; k < this.names.length; k++) {
      if (this.changed[k]) this.toggle(this.names[k], this.enabled[k]);
      else if (!this.touched[k]) {
        if (this.enabled[k]) this.toggle(this.names[k], false);
        continue;
      }
      names.push(this.names[k]);
      enabled.push(this.enabled[k]);
    }
    this.names = names;
    this.enabled = enabled;
    this.changed = names.map(() => false);
    this.touched = names.map(() => false);
    for (let k = 0, t = 0; k + 1 < toggles.length; k += 2, t++) {
      const name: string = toggles[k];
      const on = toggles[k + 1] === undefined ? statics.indexOf(name) >= 0 : !!toggles[k + 1];
      if (this.toggled[t] === on) continue;
      this.toggled[t] = on;
      this.toggle(name, on);
    }
  }

  private update(name: string, on: boolean): void {
    const at = this.names.indexOf(name);
    if (at < 0) {
      this.names.push(name);
      this.enabled.push(on);
      this.changed.push(true);
      this.touched.push(true);
      return;
    }
    if (this.enabled[at] !== on) {
      this.enabled[at] = on;
      this.changed[at] = true;
    }
    this.touched[at] = true;
  }

  private toggle(written: string, on: boolean): void {
    for (const name of written.trim().split(/\s+/)) {
      if (!name) continue;
      const at = this.classes.indexOf(name);
      if (on === at >= 0) continue;
      if (on) this.classes.push(name);
      else this.classes.splice(at, 1);
      this.view.className = this.classes.join(' ');
    }
  }
}

interface NgStyleEntry {
  key: string;
  name: string;
  value: any;
}

function ngStyleEntries(value: any): NgStyleEntry[] {
  const entries: NgStyleEntry[] = [];
  const add = (key: string, given: any) => {
    const parts = key.split('.');
    entries.push({ key, name: parts[0], value: given == null ? null : parts.length > 1 ? `${given}${parts[1]}` : given });
  };
  if (value instanceof Map) {
    for (const [key, given] of value) add(String(key), given);
  } else if (typeof value === 'object') {
    for (const key of Object.keys(value)) add(key, value[key]);
  } else throw new Error(`NgStyle takes an object or a Map of styles, got ${value}`);
  return entries;
}

class NgStyle {
  private readonly view: any;
  private readonly unset: any;
  private applied: NgStyleEntry[] = [];

  constructor(view: any, unset: any) {
    this.view = view;
    this.unset = unset;
  }

  apply(input: any[]): void {
    const value: any = input[0];
    if (value == null) return;
    const entries = ngStyleEntries(value);
    for (const old of this.applied) if (!entries.some((e) => e.key === old.key)) this.set(old.name, null);
    for (const entry of entries) {
      const old = this.applied.find((e) => e.key === entry.key);
      if (!old || !Object.is(old.value, entry.value)) this.set(entry.name, entry.value);
    }
    this.applied = entries;
  }

  private set(name: string, value: any): void {
    const style = this.view.style;
    if (name.startsWith('--')) {
      if (value == null) style.unscopedCssVariables.delete(name);
      else style.setUnscopedCssVariable(name, value);
      this.view._onCssStateChange();
    } else style[name] = value == null ? this.unset : value;
  }
}

const steps: [string, any, any[]][] = [
  ['card x', { a: true, 'b c': 1, d: 0 }, ['on', true]],
  ['card x', { 'b c': 1, e: true }, ['on', true]],
  ['card x', { x: false, 'b c': 1, e: true }, ['on', true]],
  ['card x', { 'b c': 1, e: true }, ['on', true]],
  ['card x', ['e'], ['on', false]],
  ['card x', 'e  f ', ['on', undefined]],
  ['card x', new Set(['f']), ['on', 'yes']],
  ['card x', null, ['on', true]],
];
const classView: any = { className: '' };
const ngClass = new NgClass(classView);
for (const [base, value, toggles] of steps) {
  ngClass.apply([base, value, toggles]);
  console.log(JSON.stringify(classView.className), JSON.stringify(ngClassNames(base, value, toggles)));
}
try {
  ngClass.apply(['card', [1], []]);
} catch (e) {
  console.log((e as Error).message);
}

const vars = new Map<string, any>();
let restyled = 0;
const style: any = { unscopedCssVariables: vars, setUnscopedCssVariable: (k: string, v: any) => vars.set(k, v) };
const view: any = { style, _onCssStateChange: () => restyled++ };
const shown = () => Object.keys(style).filter((k) => typeof style[k] !== 'function' && k !== 'unscopedCssVariables').map((k) => `${k}=${style[k]}`).join(' ');
const ngStyle = new NgStyle(view, unsetValue);
const values: any[] = [
  { 'width.px': 10, 'font-size': 12, color: 'red' },
  { 'width.px': 20, 'font-size': 12 },
  { 'width.px': null, 'font-size': 12 },
  null,
  { 'width.%': 50, 'font-size': 12 },
  new Map<string, any>([['width.%', 50], ['color', 'blue']]),
  { '--accent': 'red', color: 'blue' },
  {},
];
for (const value of values) {
  ngStyle.apply([value]);
  console.log(shown(), [...vars.keys()].join(','), restyled);
}
try {
  ngStyleEntries('color: red');
} catch (e) {
  console.log((e as Error).message);
}
