import { describe, expect, it, vi } from 'vitest';

import { handleAngularHotUpdateMessage } from './index.js';

describe('handleAngularHotUpdateMessage', () => {
	it('bumps the HMR import nonce before rebooting Angular modules', () => {
		const reboot = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousNonce = g.__NS_HMR_IMPORT_NONCE__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT_NONCE__ = 4;

		try {
			const handled = handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			expect(handled).toBe(true);
			expect(g.__NS_HMR_IMPORT_NONCE__).toBe(5);
			expect(reboot).toHaveBeenCalledWith(false);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT_NONCE__ = previousNonce;
		}
	});
});
