import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { installHttpCoreCssSupport, preloadHttpCoreStyleScope } from './entry-runtime.js';

describe('installHttpCoreCssSupport', () => {
	beforeEach(() => {
		delete (globalThis as any).__NS_HMR_APPLY_CSS__;
		delete (globalThis as any).__NS_HMR_APP_CSS__;
		delete (globalThis as any).__NS_HMR_HTTP_APP_CSS_APPLIED__;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('installs a global CSS applier and applies pending app.css once', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		const Application = {
			addCss,
			getRootView: vi.fn(() => ({
				_onCssStateChange: onCssStateChange,
			})),
		};

		(globalThis as any).__NS_HMR_APP_CSS__ = '.boot { color: red; }';

		const applier = installHttpCoreCssSupport({ Application }, true);

		expect(typeof applier).toBe('function');
		expect((globalThis as any).__NS_HMR_APPLY_CSS__).toBe(applier);
		expect(addCss).toHaveBeenCalledWith('.boot { color: red; }');
		expect(onCssStateChange).toHaveBeenCalled();
		expect((globalThis as any).__NS_HMR_HTTP_APP_CSS_APPLIED__).toBe(true);
	});

	it('does not reapply the seeded app.css once the HTTP realm flag is set', () => {
		const addCss = vi.fn();
		const Application = {
			addCss,
			getRootView: vi.fn(() => null),
		};

		(globalThis as any).__NS_HMR_APP_CSS__ = '.boot { color: red; }';
		(globalThis as any).__NS_HMR_HTTP_APP_CSS_APPLIED__ = true;

		const applier = installHttpCoreCssSupport({ Application }, true);

		expect(typeof applier).toBe('function');
		expect(addCss).not.toHaveBeenCalled();
	});

	it('preloads the HTTP core style-scope module before CSS application', async () => {
		const importer = vi.fn().mockResolvedValue({});

		const result = await preloadHttpCoreStyleScope(importer, 'http://localhost:5173', '7', true);

		expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/core/7?p=ui/styling/style-scope.js');
		expect(result).toMatchObject({
			ok: true,
			url: 'http://localhost:5173/ns/core/7?p=ui/styling/style-scope.js',
		});
	});

	it('returns preload failure information when the HTTP core style-scope import fails', async () => {
		const importer = vi.fn().mockRejectedValue(new Error('boom'));

		const result = await preloadHttpCoreStyleScope(importer, 'http://localhost:5173', '7', true);

		expect(result.ok).toBe(false);
		expect(result.url).toBe('http://localhost:5173/ns/core/7?p=ui/styling/style-scope.js');
		expect(result.err).toContain('boom');
	});
});
