import { describe, expect, it, vi } from 'vitest';

vi.mock('@vue/compiler-sfc', () => {
	throw new Error('Vue compiler loaded for a non-Vue flavor');
});

describe('framework dependency isolation', () => {
	it('does not load the Vue compiler for Angular', async () => {
		const { hmrWebSocketPluginForFlavor } = await import('./websocket.js');

		expect(hmrWebSocketPluginForFlavor('angular', {})).toBeDefined();
	});
});
