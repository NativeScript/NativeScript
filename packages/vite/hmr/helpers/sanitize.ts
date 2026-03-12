// Small, targeted sanitizers applied late in the SFC assembly to prevent device parse errors

// Remove any ns_core_ns_1 mapping from destructuring off the runtime default (__ns_rt_ns_*),
// which would otherwise create a local like __ns_core_ns_1 that can collide with explicit core imports.
export function stripRtCoreSentinel(code: string): string {
	try {
		let out = code;
		// Remove the standalone form: const { ns_core_ns_1: __ns_core_ns_1 } = __ns_rt_ns_<n|re>;
		out = out.replace(/(^|\n)\s*const\s*\{\s*ns_core_ns_1\s*:\s*__ns_core_ns_1\s*\}\s*=\s*__ns_rt_ns_(?:\d+|re)\s*;\s*/g, '$1');
		// Remove leading property in a multi-prop destructure
		out = out.replace(/(\{\s*)ns_core_ns_1\s*:\s*__ns_core_ns_1\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns_(?:\d+|re)\s*;)/g, '{$2');
		// Remove trailing property in a multi-prop destructure
		out = out.replace(/(\{[^}]*?,)\s*ns_core_ns_1\s*:\s*__ns_core_ns_1\s*(\}\s*=\s*__ns_rt_ns_(?:\d+|re)\s*;)/g, '$1$2');
		// Remove middle property in a multi-prop destructure
		out = out.replace(/(\{[^}]*?,)\s*ns_core_ns_1\s*:\s*__ns_core_ns_1\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns_(?:\d+|re)\s*;)/g, '$1$2');
		// Ultra-conservative fallback: strip any occurrence of mapping and clean up dangling commas
		out = out.replace(/ns_core_ns_1\s*:\s*__ns_core_ns_1\s*,?\s*/g, (m) => '');
		// Remove empty destructures: const { } = __ns_rt_ns_<n|re>;
		out = out.replace(/(^|\n)\s*const\s*\{\s*\}\s*=\s*__ns_rt_ns_(?:\d+|re)\s*;\s*/g, '$1');
		return out;
	} catch {
		return code;
	}
}

// Neutralize dangling Vite CJS import helper usages like:
//   const foo = __vite__cjsImport4__pkg_flat["prop"];
// when the helper variable was stripped earlier and never declared. Replace with undefined.
export function stripDanglingViteCjsImports(code: string): string {
	try {
		// Collect declared helper symbols
		const declared = new Set<string>();
		try {
			const declRe = /(^|\n)\s*(?:const|let|var)\s+(__vite__cjsImport\d+__\w+)\s*=/g;
			let m: RegExpExecArray | null;
			while ((m = declRe.exec(code))) {
				declared.add(m[2]);
			}
		} catch {}
		// Replace initializer when helper symbol is not declared
		const usageRe = /(^|\n)\s*(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(__vite__cjsImport\d+__\w+)\s*\[\s*["']([A-Za-z_$][\w$]*)["']\s*]\s*;?/g;
		const out = code.replace(usageRe, (full, pfx, kind, local, helper, _prop) => {
			if (!declared.has(helper)) {
				return `${pfx}${kind} ${local} = undefined; // [hmr-sanitize] dropped unresolved Vite CJS import`;
			}
			return full;
		});
		return out;
	} catch {
		return code;
	}
}

export default { stripRtCoreSentinel };
