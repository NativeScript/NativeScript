// NativeScript-safe JSX runtime shim for the React flavor (automatic JSX with
// jsxImportSource: 'react').
//
// The React flavor aliases `react/jsx-runtime` and `react/jsx-dev-runtime` (CJS
// modules that re-export through a conditional `require('./cjs/…')`) to this
// file in builds and in dev, so the real runtimes never reach the device and
// are not in the flavor's `optimizeDeps.include`.
//
// It reimplements the runtime on top of `React.createElement`, and must import
// nothing but `react`, which dev serves pre-bundled with ESM named exports. createElement
// produces the exact same elements the reconciler consumes. It is plain ESM with explicit
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
