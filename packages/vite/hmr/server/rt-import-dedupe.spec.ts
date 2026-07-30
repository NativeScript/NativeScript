import { describe, it, expect } from 'vitest';
import { __test_processCodeForDevice as transform } from './websocket';

// Helper: run the sanitizer and return code
function run(code: string) {
	return transform(code, false);
}

describe('ns/rt import dedupe for $showModal', () => {
	it('does not emit both named import and destructure for $showModal', () => {
		const input = `
      import { $navigateTo, $navigateBack, $showModal } from "nativescript-vue";
      export function demo(c:any,p:any){ $showModal(c,p); }
    `;
		const out = run(input);
		// should not contain named import for $showModal from /ns/rt
		expect(out).not.toMatch(/import\s*\{[^}]*\$showModal[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt/);
		// should bind $showModal via destructure or wrapper
		expect(out).toMatch(/\bconst\s*\{[^}]*\$showModal[^}]*\}\s*=\s*__ns_rt_ns/);
	});

	it('binds free-use $showModal without named import', () => {
		const input = `
      export const go = (c:any,p:any)=>{ $showModal(c,p); }
    `;
		const out = run(input);
		expect(out).not.toMatch(/import\s*\{[^}]*\$showModal[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt/);
		expect(out).toMatch(/\bconst\s*\{[^}]*\$showModal[^}]*\}\s*=\s*__ns_rt_ns/);
	});
});
