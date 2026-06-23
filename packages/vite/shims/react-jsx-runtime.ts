// NativeScript-safe JSX runtime shim for the React flavor (automatic JSX with
// jsxImportSource: 'react').
//
// `react/jsx-runtime` and `react/jsx-dev-runtime` are CJS modules that re-export
// their implementation through a conditional `module.exports = require('./cjs/…')`.
// The dev server serves node_modules over `/ns/m` as raw transformed CJS, and
// static named-export detection can't see through that conditional require — so on
// device `import { jsx } from 'react/jsx-runtime'` fails with "does not provide an
// export named 'jsx'". (The non-HMR rolldown build bundles them fine; this is the
// HMR/dev path.)
//
// This shim reimplements the runtime on top of `React.createElement` — `react` is
// vendored (esbuild → working named exports), and createElement produces the exact
// same elements the reconciler consumes. It is plain ESM with explicit
// jsx/jsxs/jsxDEV/Fragment named exports and never imports the real runtime, so
// there's no circular reference back through the alias.
import { createElement, Fragment as ReactFragment } from 'react';

export const Fragment = ReactFragment;

// The automatic runtime passes `key` separately from `config` (which carries the
// remaining props, including `children`). createElement reads `key` off the config
// object, so fold it back in when present; otherwise pass config straight through.
function jsxImpl(type: any, config: any, maybeKey?: any) {
	if (maybeKey !== undefined) {
		return createElement(type, { ...(config || {}), key: maybeKey });
	}
	return createElement(type, config);
}

export function jsx(type: any, config: any, maybeKey?: any) {
	return jsxImpl(type, config, maybeKey);
}

export function jsxs(type: any, config: any, maybeKey?: any) {
	return jsxImpl(type, config, maybeKey);
}

export function jsxDEV(type: any, config: any, maybeKey?: any) {
	return jsxImpl(type, config, maybeKey);
}
