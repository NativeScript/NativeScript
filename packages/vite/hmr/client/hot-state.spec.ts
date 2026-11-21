import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearEntryBoundary, getEntryBoundarySettled, registerEntryBoundary } from './hot-state.js';
import * as viteClient from './thin-vite-client.js';

vi.mock('@nativescript/core', () => ({ addTaggedAdditionalCSS: vi.fn(), removeTaggedAdditionalCSS: vi.fn() }));

describe('registerEntryBoundary', () => {
	afterEach(() => clearEntryBoundary());

	it('is served from /@vite/client', () => {
		expect(viteClient.registerEntryBoundary).toBe(registerEntryBoundary);
	});

	it('keeps the latest provider until cleared', () => {
		const first = () => 1;
		const second = () => 2;
		expect(getEntryBoundarySettled()).toBeNull();

		registerEntryBoundary(first);
		registerEntryBoundary(second);
		expect(getEntryBoundarySettled()).toBe(second);

		clearEntryBoundary();
		expect(getEntryBoundarySettled()).toBeNull();
	});

	it('registers a no-op provider when the entry passes none', () => {
		registerEntryBoundary();
		expect(getEntryBoundarySettled()?.()).toBeUndefined();
	});
});
