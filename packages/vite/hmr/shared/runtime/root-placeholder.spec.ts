import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';
import { tryFinalizeBootPlaceholder } from './root-placeholder.js';

describe('root placeholder finalization', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		delete (globalThis as any).Application;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
		delete (globalThis as any).__NS_HMR_BOOT_COMPLETE__;
		delete (globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
		delete (globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
		delete (globalThis as any).__NS_DEV_BOOT_STATUS_LABEL__;
		delete (globalThis as any).__NS_DEV_BOOT_ACTIVITY_INDICATOR__;
		delete (globalThis as any).__NS_DEV_PLACEHOLDER_APPLICATION__;
		delete (globalThis as any).__NS_DEV_PLACEHOLDER_LAUNCH_HANDLER__;
		delete (globalThis as any).__NS_DEV_ORIGINAL_APP_RUN__;
		delete (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
		delete (globalThis as any).__NS_DEV_PLACEHOLDER_RESTORE_TIMER__;
	});

	it('marks boot complete only after a real root replaces the placeholder', () => {
		const placeholderRoot = { __ns_dev_placeholder: true };
		const launchHandler = vi.fn();
		const originalRun = vi.fn();
		const application = {
			launchEvent: 'launch',
			off: vi.fn(),
			run: vi.fn(),
			getRootView: vi.fn(() => ({
				constructor: { name: 'Frame' },
				currentPage: { constructor: { name: 'Page' } },
			})),
		};

		(globalThis as any).Application = application;
		(globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_VIEW__ = placeholderRoot;
		(globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_EARLY__ = true;
		(globalThis as any).__NS_DEV_BOOT_STATUS_LABEL__ = { text: 'waiting' };
		(globalThis as any).__NS_DEV_PLACEHOLDER_APPLICATION__ = application;
		(globalThis as any).__NS_DEV_PLACEHOLDER_LAUNCH_HANDLER__ = launchHandler;
		(globalThis as any).__NS_DEV_ORIGINAL_APP_RUN__ = originalRun;

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		const finalized = tryFinalizeBootPlaceholder('spec', true);

		expect(finalized).toBe(true);
		expect((globalThis as any).__NS_HMR_BOOT_COMPLETE__).toBe(true);
		expect((globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_VIEW__).toBeUndefined();
		expect(application.off).toHaveBeenCalledWith('launch', launchHandler);
		expect(application.run).toBe(originalRun);
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Real app root committed',
			progress: 100,
		});
	});

	it('does not finalize while the placeholder is still the active root', () => {
		const placeholderRoot = { __ns_dev_placeholder: true };
		const application = {
			getRootView: vi.fn(() => placeholderRoot),
		};

		(globalThis as any).Application = application;
		(globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_VIEW__ = placeholderRoot;
		(globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_EARLY__ = true;

		expect(tryFinalizeBootPlaceholder('spec')).toBe(false);
		expect((globalThis as any).__NS_HMR_BOOT_COMPLETE__).not.toBe(true);
	});
});
