import { Label, Property, View } from '@nativescript/core';

/** What the mixins did, in order, for the views of the demo (Labels). */
export const glowLog: string[] = [];

// A plugin's mixin function, as gesturehandler and ui-material write it.
function applyMixins(derivedCtor: any, baseCtors: any[], options?: { after?: boolean; override?: boolean; omit?: string[] }) {
  const omits = options && options.omit ? options.omit : [];
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (omits.indexOf(name) !== -1) return;
      const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
      if (name === 'constructor') return;
      if (descriptor && (!descriptor.writable || !descriptor.configurable || descriptor.get || descriptor.set)) {
        Object.defineProperty(derivedCtor.prototype, name, descriptor);
      } else {
        const oldImpl = derivedCtor.prototype[name];
        if (!oldImpl) {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        } else {
          derivedCtor.prototype[name] = function (...args: any[]) {
            if (options) {
              if (!!options.override) {
                return baseCtor.prototype[name].apply(this, args);
              } else if (!!options.after) {
                oldImpl.apply(this, args);
                return baseCtor.prototype[name].apply(this, args);
              } else {
                baseCtor.prototype[name].apply(this, args);
                return oldImpl.apply(this, args);
              }
            } else {
              baseCtor.prototype[name].apply(this, args);
              return oldImpl.apply(this, args);
            }
          };
        }
      }
    });
    Object.getOwnPropertySymbols(baseCtor.prototype).forEach((symbol) => {
      const oldImpl: Function = derivedCtor.prototype[symbol];
      if (!oldImpl) {
        derivedCtor.prototype[symbol] = baseCtor.prototype[symbol];
      } else {
        derivedCtor.prototype[symbol] = function (...args: any[]) {
          baseCtor.prototype[symbol].apply(this, args);
          return oldImpl.apply(this, args);
        };
      }
    });
  });
}

export const glowProperty = new Property<View, boolean>({ name: 'glow', defaultValue: false, valueConverter: (v) => v === 'true' });

class ViewGlow extends View {
  initNativeView() {
    if (this instanceof Label) glowLog.push('init ' + this.id);
  }
  [glowProperty.setNative](value: boolean) {
    const layer = (this.nativeViewProtected as UIView).layer;
    layer.borderWidth = value ? 4 : 0;
    layer.borderColor = UIColor.systemOrangeColor.CGColor;
    glowLog.push('glow ' + this.id + ' ' + value);
  }
  glowDescription() {
    return 'glowing ' + this.id;
  }
}

export function installGlow() {
  glowProperty.register(View);
  applyMixins(View, [ViewGlow]);
}
