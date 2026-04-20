import { describe, expect, it, vi } from 'vitest';

import { handleAngularHotUpdateMessage } from './index.js';

describe('handleAngularHotUpdateMessage', () => {
	it('bumps the HMR import nonce before rebooting Angular modules', async () => {
		const reboot = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousNonce = g.__NS_HMR_IMPORT_NONCE__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT_NONCE__ = 4;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			expect(handled).toBe(true);
			expect(g.__NS_HMR_IMPORT_NONCE__).toBe(5);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT_NONCE__ = previousNonce;
		}
	});

	it('refreshes Angular bootstrap options from the versioned main entry before rebooting', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousRegisterOnly = g.__NS_ANGULAR_HMR_REGISTER_ONLY__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update', version: 408, origin: 'http://localhost:5173' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			expect(handled).toBe(true);
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/__ns_hmr__/v408/src/main.ts');
			expect(reboot).toHaveBeenCalledWith(true);
			expect(g.__NS_ANGULAR_HMR_REGISTER_ONLY__).toBe(false);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previousRegisterOnly;
		}
	});
});
