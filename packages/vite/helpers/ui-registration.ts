import type { Plugin } from 'vite';

/**
 * Virtual module that registers @nativescript/core/ui with the bundler module
 * registry (so the XML builder's `global.loadModule('@nativescript/core/ui')`
 * resolves), registers short element names (Frame, StackLayout, …), imports the
 * bundler context, and applies View prototype guards.
 *
 * The entry (`virtual:entry-with-polyfills`, see main-entry.ts) imports this
 * module immediately after `bundle-entry-points`, so its body evaluates after
 * core's entry points but before the user's main module.
 *
 * History: this code used to be string-injected by a `transform` hook in
 * typescript.ts / javascript.ts that regex-matched the generated entry for the
 * literal `import '@nativescript/core/bundle-entry-points';`. main-entry.ts
 * later switched to `JSON.stringify(...)` (double quotes; a full dev-server URL
 * under HMR) and the marker silently stopped matching — no injection, and every
 * XML build failed with "Module 'Frame' not found". A dedicated virtual module
 * cannot drift like that.
 */
export const UI_REGISTRATION_VIRTUAL_ID = 'virtual:ns-ui-registration';
const RESOLVED_ID = '\0' + UI_REGISTRATION_VIRTUAL_ID;

// TypeScript flavor: statically import the core UI barrel (the ns-core-external
// plugin rewrites it to the canonical core URL under HMR) and register it plus
// per-element nicknames; guard flex/layout View accessors against early writes.
const TS_REGISTRATION_CODE = `import '@nativescript/core/ui/styling/style';
import '@nativescript/core/ui/styling/style-properties';
import * as __nsCoreUi from '@nativescript/core/ui';
import 'virtual:ns-bundler-context';
(function(){
  try {
    const __ui = __nsCoreUi;
    if (global.registerModule) {
      const existsFn = global.moduleExists ? (n) => global.moduleExists(n) : () => false;
      if (!existsFn('@nativescript/core/ui')) {
        try { global.registerModule('@nativescript/core/ui', () => __ui); } catch(_) {}
      }
      Object.keys(__ui || {}).forEach(k => {
        if (k && k[0] === k[0].toUpperCase() && !existsFn(k)) {
          try { global.registerModule(k, () => ({ [k]: __ui[k] })); } catch(_) {}
        }
      });
    }
    if (__ui && __ui.View) {
      const View = __ui.View;
      const props = ['order','flexGrow','flexShrink','flexWrapBefore','alignSelf'];
      for (const p of props) {
        const d = Object.getOwnPropertyDescriptor(View.prototype, p);
        if (d && typeof d.set === 'function') {
          const origSet = d.set;
          Object.defineProperty(View.prototype, p, {
            configurable: true,
            enumerable: d.enumerable,
            get: d.get,
            set(value){
              if (value === undefined || value === null) return;
              if (!this || !this._style) {
                try { if (this && !this._style) this._style = this.style; } catch(_) {}
                if (!this || !this._style) return;
              }
              return origSet.call(this, value);
            }
          });
        }
      }
      // Force layout invalidation for alignment/visibility/size property changes
      const forceProps = ['horizontalAlignment','verticalAlignment','visibility','height','width'];
      for (const p of forceProps) {
        const d = Object.getOwnPropertyDescriptor(View.prototype, p);
        if (d && typeof d.set === 'function') {
          const orig = d.set;
          Object.defineProperty(View.prototype, p, {
            configurable: true,
            enumerable: d.enumerable,
            get: d.get,
            set(value){
              const prev = this[p];
              try { orig.call(this, value); } finally {
                if (prev !== value) { try { this && this.requestLayout && this.requestLayout(); } catch(_) {} }
              }
            }
          });
        }
      }
    }
  } catch(_) {}
})();
`;

// JavaScript flavor: resolve the UI barrel via the runtime module registry
// (global.loadModule) instead of a static namespace import; flex guard only,
// plus short element name registration.
const JS_REGISTRATION_CODE = `// Ensure style system is initialized before any UI component modules register CSS properties
import '@nativescript/core/ui/styling/style';
import '@nativescript/core/ui/styling/style-properties';
import 'virtual:ns-bundler-context';
// Patch CSS accessors to be resilient to early default initializations before style exists
(function(){
  try {
    const __ui = (global.loadModule ? global.loadModule('@nativescript/core/ui') : (global.require ? global.require('@nativescript/core/ui') : null));
    if (__ui && __ui.View) {
      const View = __ui.View;
      const props = ['order','flexGrow','flexShrink','flexWrapBefore','alignSelf'];
      for (const p of props) {
        const d = Object.getOwnPropertyDescriptor(View.prototype, p);
        if (d && typeof d.set === 'function') {
          const origSet = d.set;
          Object.defineProperty(View.prototype, p, {
            configurable: true,
            enumerable: d.enumerable,
            get: d.get,
            set(value){
              if (value === undefined || value === null) return;
              if (!this || !this._style) {
                try { if (this && !this._style) this._style = this.style; } catch(_) {}
                if (!this || !this._style) return;
              }
              return origSet.call(this, value);
            }
          });
        }
      }
    }
  } catch(_) {}
})();
// Vite adjustment: register short core UI element module names (e.g. Frame, StackLayout)
// Some XML builder paths attempt to load 'Frame' directly instead of the barrel.
// We expose individual element names so global.loadModule('Frame') works.
try {
  const __ui = (global.loadModule ? global.loadModule('@nativescript/core/ui') : (global.require ? global.require('@nativescript/core/ui') : null));
  if (__ui && global.registerModule) {
    const existsFn = global.moduleExists ? (n) => global.moduleExists(n) : () => false;
    Object.keys(__ui).forEach(k => {
      if (k && k[0] === k[0].toUpperCase() && !existsFn(k)) {
        try {
          global.registerModule(k, () => ({ [k]: __ui[k] }));
        } catch (e) { /* swallow */ }
      }
    });
  }
} catch(e) { /* ignore */ }
`;

export function createUiRegistrationPlugin(flavor: 'typescript' | 'javascript'): Plugin {
	return {
		name: `ns-ui-registration-${flavor === 'typescript' ? 'ts' : 'js'}`,
		enforce: 'pre',
		resolveId(id) {
			if (id === UI_REGISTRATION_VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;
			return { code: flavor === 'typescript' ? TS_REGISTRATION_CODE : JS_REGISTRATION_CODE, map: null } as any;
		},
	};
}
