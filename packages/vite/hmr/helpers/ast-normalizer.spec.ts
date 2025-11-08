import { describe, it, expect } from 'vitest';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from './ast-normalizer';

describe('ast-normalizer', () => {
	it('normalizes vue-like imports to /ns/rt and injects a single default import + destructure for underscored helpers', () => {
		const input = `
import { ref, reactive, computed } from 'vue';
const x = _ref(1);
const y = _reactive({ a: 1 });
function useC() { return _computed(() => x.value + y.a); }
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		expect(out).toMatch(/\* \[ast-normalized\] \*\//);
		// Ensure /ns/rt reference exists (import rewritten)
		expect(out).toContain('/ns/rt');
		// No remaining named import from 'vue'
		expect(out).not.toMatch(/from\s+["']vue["']/);
		// Has destructure mapping ref->_ref, reactive->_reactive, computed->_computed (order-independent)
		expect(out).toMatch(/const\s*\{[^}]*ref:\s*_ref[^}]*reactive:\s*_reactive[^}]*computed:\s*_computed[^}]*}\s*=\s*\w+\s*;/s);
	});

	it('filters $navigateTo/$navigateBack from /ns/rt named imports', () => {
		const input = `
import { $navigateTo, $navigateBack, ref } from '/ns/rt';
const v = _ref(0);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Should not contain $navigateTo or $navigateBack in any import/destructure
		expect(out).not.toMatch(/\$navigateTo|\$navigateBack/);
		// But still inject destructure for underscored helpers
		expect(out).toMatch(/\b_ref\b/);
	});

	it('drops vite virtual imports and prebundle deps in normalizer (import declarations)', () => {
		const input = `
import '/@id/__x00__vite/dynamic-import-helper.js';
import something from '/node_modules/.vite/deps/vue.js?v=abc';
export const ok = true;
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Virtual and prebundle imports should be removed by normalizer
		expect(out).not.toMatch(/\/__x00__vite\/dynamic-import-helper\.js/);
		expect(out).not.toMatch(/node_modules\/\.vite\/deps\/vue/);
		expect(out).toMatch(/export const ok = true;/);
	});

	it('annotates duplicate top-level bindings', () => {
		const input = `
const a = 1;
let a = 2;
`;
		const out = astVerifyAndAnnotateDuplicates(input);
		expect(out).toMatch(/\[ast-verify\]\[duplicate-bindings\]/);
	});

	it('does not rebind default rt local when merging destructures', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
// This import will be normalized/kept; we simulate another destructure creation
const dummy = 1;
`;
		// Force underscored helper usage to trigger destructure creation
		const withUse = input + `const x = _ref(1);`;
		const out = astNormalizeModuleImportsAndHelpers(withUse);
		// Ensure we never create a mapping like { ns_rt_ns_1: __ns_rt_ns_1 }
		expect(out).not.toMatch(/\{[^}]*ns_rt_ns_1\s*:\s*__ns_rt_ns_1[^}]*\}/);
	});

	it('respects existing default rt import and does not add a second default import', () => {
		const input = `
import __ns_rt_ns_5 from '/ns/rt';
import { ref } from 'vue';
const x = _ref(1);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Only one default import from /ns/rt should remain
		const defImports = out.match(/import\s+\w+\s+from\s+["']\/ns\/rt["']/g) || [];
		// There should be at least one default import and it should keep the original local
		expect(defImports.some((l) => l.includes('__ns_rt_ns_5'))).toBe(true);
	});

	it('chooses a non-conflicting default local when __ns_rt_ns_1 is already declared', () => {
		const input = `
const __ns_rt_ns_1 = 42;
import { ref } from 'vue';
const x = _ref(1);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Should import a different default local (e.g., __ns_rt_ns_2 or higher)
		const m = out.match(/import\s+(\w+)\s+from\s+["']\/ns\/rt["']/);
		expect(m).toBeTruthy();
		const local = m && m[1];
		expect(local).not.toBe('__ns_rt_ns_1');
	});

	it('dedupes multiple /ns/rt default imports with same local', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
import __ns_rt_ns_1 from '/ns/rt';
const x = _ref(1);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Ensure we do not have two identical default imports with the same local
		// Ensure no repeated identical default import lines for the same local
		expect(out).not.toMatch(/import\s+__ns_rt_ns_1\s+from\s+["']\/ns\/rt["'][\s\S]*import\s+__ns_rt_ns_1\s+from\s+["']\/ns\/rt["']/);
	});

	it('dedupes multiple /ns/rt default imports with different locals by aliasing', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
import __ns_rt_ns_2 from '/ns/rt';
const y = _reactive({});
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		const defImports = out.match(/import\s+\w+\s+from\s+["']\/ns\/rt["']/g) || [];
		expect(defImports.length).toBe(1);
		// Look for alias: const __ns_rt_ns_2 = __ns_rt_ns_1;
		expect(out).toMatch(/const\s+__ns_rt_ns_2\s*=\s*__ns_rt_ns_1\s*;/);
	});

	it('removes subsequent /ns/rt imports with named specifiers and emits destructure against first default', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
import { ref, computed } from '/ns/rt';
const a = _ref(1); const b = _computed(() => a.value);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Only one import should remain
		const defImports = out.match(/import\s+\w+\s+from\s+["']\/ns\/rt["']/g) || [];
		expect(defImports.length).toBe(1);
		// Destructure should be emitted mapping ref -> _ref, computed -> _computed
		expect(out).toMatch(/const\s*\{[^}]*ref:\s*_ref[^}]*computed:\s*_computed[^}]*}\s*=\s*__ns_rt_ns_1\s*;/s);
	});

	it('navigation wrappers via property access survive normalization/dedupe', () => {
		const input = `
import __ns_rt_nav_to_mod from '/ns/rt';
const $navigateTo = (...args) => __ns_rt_nav_to_mod.$navigateTo(...args);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Keep a default import from /ns/rt, might be renamed but should exist
		expect(out).toMatch(/import\s+\w+\s+from\s+["']\/ns\/rt["']/);
		// Ensure wrapper remains and uses property access (no intermediate __ns_rt_nav_to var)
		expect(out).toMatch(/const\s+\$navigateTo\s*=\s*\(.*\)\s*=>\s*\w+\._?\$?navigateTo\(/);
		expect(out).not.toMatch(/\b__ns_rt_nav_to\b/);
	});

	it('injects navigation wrappers when $navigateTo is used but undeclared', () => {
		const input = `
export const fn = () => $navigateTo(Comp);
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Should import /ns/rt and declare wrapper
		expect(out).toMatch(/import\s+\w+\s+from\s+["']\/ns\/rt["']/);
		expect(out).toMatch(/const\s+\$navigateTo\s*=\s*\(\.\.\.args\)\s*=>\s*\w+\.\$navigateTo\(\.\.\.args\)/);
	});

	it('rewrites @nativescript/core and subpaths to /ns/core', () => {
		const input = `
import { Frame } from '@nativescript/core';
import core, { Observable as Obs } from '@nativescript/core/index.js';
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// No remaining references to the package names
		expect(out).not.toMatch(/@nativescript\/core/);
		// Rewritten to bridge
		const coreImports = out.match(/from\s+['"]\/ns\/core['"]/g) || [];
		expect(coreImports.length).toBeGreaterThan(0);
		// Named imports turned into destructures against respective default locals
		// One for Frame
		expect(out).toMatch(/const\s*\{\s*Frame\s*}\s*=\s*\w+\s*;/);
		// And one for Observable as Obs
		expect(out).toMatch(/const\s*\{\s*Observable\s*:\s*Obs\s*}\s*=\s*\w+\s*;/);
	});

	it('rewrites core import when two imports share one line', () => {
		const input = `import { Frame } from '@nativescript/core/index.js';import X from './local.js';`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		expect(out).toMatch(/from\s+['"]\/ns\/core['"]/);
	});

	it('rewrites dynamic import/require of @nativescript/core to /ns/core', () => {
		const input = `
async function load() {
  const a = await import('@nativescript/core/index.js');
  const b = require('@nativescript/core');
  return { a, b };
}
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		expect(out).toMatch(/import\(['"]\/ns\/core['"]\)/);
		expect(out).toMatch(/require\(['"]\/ns\/core['"]\)/);
	});

	it('flags duplicate __ns_core_ns_1 when both rt destructure ns_core_ns_1 and core default import exist', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
const { ns_core_ns_1: __ns_core_ns_1 } = __ns_rt_ns_1;
import __ns_core_ns_1 from '@nativescript/core/index.js';
`;
		const norm = astNormalizeModuleImportsAndHelpers(input);
		const verified = astVerifyAndAnnotateDuplicates(norm);
		// Expect duplicate binding annotation to include the specific identifier
		expect(verified).toMatch(/\[ast-verify\]\[duplicate-bindings\].*__ns_core_ns_1/);
	});

	it('filters $navigateTo/$navigateBack from nativescript-vue imports and rewrites to /ns/rt', () => {
		const input = `
import { ref, computed, $navigateTo, $navigateBack } from 'nativescript-vue';
const a = _ref(1); const b = _computed(() => a.value + 1);
$navigateTo(Comp); $navigateBack();
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Rewritten to bridge
		expect(out).toContain('/ns/rt');
		// No remaining import from nativescript-vue
		expect(out).not.toMatch(/from\s+["']nativescript-vue["']/);
		// Ensure destructure for underscored helpers exists (order-independent)
		expect(out).toMatch(/const\s*\{[^}]*ref:\s*_ref[^}]*computed:\s*_computed[^}]*}\s*=\s*\w+\s*;/s);
		// Navigation helpers must not appear in imports or destructures
		expect(out).not.toMatch(/import\s*\{[^}]*\$navigate(?:To|Back)[^}]*}/);
		expect(out).not.toMatch(/const\s*\{[^}]*\$navigate(?:To|Back)[^}]*}\s*=\s*__ns_rt_ns/);
		// Usage sites remain (to be wrapped later by the SFC pipeline)
		expect(out).toMatch(/\$navigateTo\(Comp\)/);
		expect(out).toMatch(/\$navigateBack\(\)/);
	});

	it('Home.vue-like: rewrites nativescript-vue + @nativescript/core and filters nav imports', () => {
		const input = `
import { ref, computed, onMounted, onUnmounted, $navigateTo } from "nativescript-vue";
import { Frame } from '@nativescript/core';
import Details from "./Details.vue";
const counter = ref(0);
const message = computed(() => counter.value);
function navigateNow() { $navigateTo(Details); }
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// nativescript-vue import rewritten to /ns/rt and nav filtered
		expect(out).toContain('/ns/rt');
		expect(out).not.toMatch(/from\s+["']nativescript-vue["']/);
		// Navigation helpers must not appear in imports or destructures
		expect(out).not.toMatch(/import\s*\{[^}]*\$navigate(?:To|Back)[^}]*}/);
		expect(out).not.toMatch(/const\s*\{[^}]*\$navigate(?:To|Back)[^}]*}\s*=\s*__ns_rt_ns/);
		// core import rewritten to /ns/core with destructure for Frame
		expect(out).not.toMatch(/@nativescript\/core/);
		expect(out).toMatch(/from\s+['"]\/ns\/core['"]/);
		expect(out).toMatch(/const\s*\{\s*Frame\s*}\s*=\s*\w+\s*;/);
		// Usage remains
		expect(out).toMatch(/\$navigateTo\(Details\)/);
	});

	it('keeps createApp local name stable when rewriting nativescript-vue import', () => {
		const input = `
import { createApp } from 'nativescript-vue';
import Home from './Home.vue';
createApp(Home).start();
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Ensure rewritten to /ns/rt with a default import
		expect(out).toMatch(/import\s+\w+\s+from\s+["']\/ns\/rt["']/);
		// Ensure destructure maps createApp->createApp (no alias suffix like createApp_1)
		expect(out).toMatch(/const\s*\{[^}]*\bcreateApp\b[^}]*}\s*=\s*\w+\s*;/s);
		expect(out).not.toMatch(/createApp_\d+/);
		// Usage remains valid
		expect(out).toMatch(/createApp\(Home\)\.start\(\)/);
	});

	it('does not inject a destructure for `_this` usages (no { "this": _this })', () => {
		const input = `
export class Svc {
  m() {
    const _this = this;
    return _this;
  }
}
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// No destructure mapping trying to pull 'this' off /ns/rt
		expect(out).not.toMatch(/\{\s*\"this\"\s*:/);
		expect(out).not.toMatch(/\{\s*\[object Object]\s*:/);
	});

	it('injects defineStore destructure when used without import', () => {
		const input = `
export const useServices = defineStore('services', () => {
  return {};
});
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Should import /ns/rt and destructure defineStore
		expect(out).toMatch(/import\s+\w+\s+from\s+["']\/ns\/rt["']/);
		expect(out).toMatch(/const\s*\{\s*defineStore\s*}\s*=\s*\w+\s*;/);
		// Usage remains
		expect(out).toMatch(/defineStore\('services'/);
	});

	it('keeps pinia prebundle by rewriting to bare pinia and does not inject rt defineStore', () => {
		const input = `import { defineStore } from "/node_modules/.vite/deps/pinia.js?v=abc123";\nexport const useServices = defineStore('services', () => ({}));`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// Should rewrite the import source to bare 'pinia'
		expect(out).toMatch(/from\s+['"]pinia['"]/);
		// Should NOT destructure defineStore from /ns/rt
		expect(out).not.toMatch(/\{\s*defineStore\s*}\s*=\s*__ns_rt_ns/);
	});

	it('removes ns_core_ns<n> destructures from /ns/rt locals', () => {
		const input = `
import _rt from '/ns/rt';
const { ns_core_ns_2: __ns_core_ns_2, resolveComponent: _resolveComponent } = _rt;
export default {};
`;
		const out = astNormalizeModuleImportsAndHelpers(input);
		// should not contain any ns_core_ns_2 destructure mapping
		expect(out).not.toMatch(/ns_core_ns_2\s*:\s*__ns_core_ns_2/);
	});
});
