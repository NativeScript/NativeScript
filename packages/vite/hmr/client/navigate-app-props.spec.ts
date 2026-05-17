import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * `__nsNavigateUsingApp` is the HMR navigation backend behind the `/ns/rt`
 * bridge's `$navigateTo`. It builds a fresh Vue app per navigation and mounts
 * the destination component. Vue's `createApp(rootComponent, rootProps?)`
 * accepts root props as its second argument — that's how stock
 * `nativescript-vue/$navigateTo` delivers `options.props` to the destination
 * (`createNativeView(target, options?.props, …)` →
 * `renderer.createApp(component, props)`).
 *
 * If the HMR navigator drops the props, the destination component renders with
 * `undefined` bindings and Vue logs
 *   [Vue warn]: Missing required prop: "<name>"
 *     at <DestinationComponent>
 * deep into a navigation flow — exactly the failure shape the user hit on
 * `$navigateTo(AlbumDetail, { props: { albumId, sourceTag } })`.
 *
 * Static-source assertion mirrors the pattern in `rt-ios-throttle.spec.ts`:
 * `__nsNavigateUsingApp` is a module-internal function (assigned onto
 * `globalThis` but not exported), so we lock the contract in by reading the
 * source rather than refactoring purely to surface a test seam.
 */
describe('__nsNavigateUsingApp prop forwarding', () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const clientSrc = readFileSync(path.join(__dirname, 'index.ts'), 'utf-8');

	it('forwards opts.props as Vue rootProps when building the destination app', () => {
		// The call has to be `AppFactory(component, props)` — passing only
		// `component` swallows props. We pin the exact shape so a future
		// refactor that introduces a wrapper around `AppFactory` still has
		// to touch this assertion (and the test name) to ship.
		//
		// Locate the AppFactory call and grab the trailing arg list. Using
		// non-greedy capture survives nested parens inside `normalizeComponent(...)`.
		const callMatch = clientSrc.match(/const app = AppFactory\((.*?)\);/);
		expect(callMatch).toBeTruthy();
		const argList = callMatch![1];
		// Two top-level arguments: component, props
		expect(argList).toContain('normalizeComponent(comp,');
		expect(argList).toMatch(/,\s*opts\s*&&\s*\(opts\s*as\s*any\)\.props\s*$/);
	});

	it('still calls normalizeComponent so non-defineComponent inputs resolve correctly', () => {
		// Regression guard: a prior refactor passed `comp` directly to AppFactory
		// which broke <script setup> destinations. The normalizeComponent wrap
		// must stay in place.
		expect(clientSrc).toMatch(/AppFactory\(normalizeComponent\(comp,/);
	});
});
