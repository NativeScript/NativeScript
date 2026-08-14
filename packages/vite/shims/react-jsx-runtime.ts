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
// remaining props, including `children`). We bridge to `React.createElement`, which
// expects `key` IN the props object and `children` as TRAILING POSITIONAL ARGS.
//
// Children must be spread positionally — NOT left as a single `config.children`
// array — otherwise React treats a multi-child element (what `jsxs` produces for
// static markup like `<view><a/><b/></view>`) as a DYNAMIC list and emits a spurious
// "Each child in a list should have a unique key" warning for ordinary static JSX.
// Spreading them as args is the classic-createElement shape React exempts from key
// checks, while genuinely keyed `.map()` lists keep their keys on each element.
function jsxImpl(type: any, config: any, maybeKey?: any) {
	const props: any = {};
	let children: any;
	let hasChildren = false;
	if (config) {
		for (const k in config) {
			if (k === 'children') {
				children = config.children;
				hasChildren = true;
			} else {
				props[k] = config[k];
			}
		}
	}
	if (maybeKey !== undefined) props.key = maybeKey;
	if (!hasChildren) return createElement(type, props);
	if (Array.isArray(children)) return createElement(type, props, ...children);
	return createElement(type, props, children);
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
