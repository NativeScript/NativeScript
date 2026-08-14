// NativeScript-safe JSX runtime shim for packages that use automatic JSX transform
// with jsxImportSource: 'solid-js'. Maps jsx() calls to Solid's createComponent().
// This avoids pulling in solid-js/h which depends on the web renderer.
import { createComponent } from 'solid-js';

export function Fragment(props: any) {
	return props?.children ?? null;
}

export function jsx(type: any, props: any) {
	if (typeof type === 'function') {
		return createComponent(type, props || {});
	}
	// Intrinsic elements (rare in pre-built packages) — return a minimal shape.
	return { type, props: props || {} };
}

export const jsxs = jsx;
export const jsxDEV = jsx;
