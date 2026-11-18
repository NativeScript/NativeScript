import { describe, expect, it } from 'vitest';
import { toDeviceRelayPayload } from './device-relay-payload';

describe('toDeviceRelayPayload', () => {
	it('relays custom events unchanged', () => {
		const payload = { type: 'custom', event: 'angular:component-update', data: { id: 'x', timestamp: 1 } };
		expect(toDeviceRelayPayload(payload)).toBe(payload);
	});

	it('keeps only the css-update entries of a stock update', () => {
		const css = { type: 'css-update', path: '/src/a.component.css?direct&ngcomp=ng-c1&e=0', acceptedPath: '/src/a.component.css', timestamp: 2 };
		const js = { type: 'js-update', path: '/src/a.ts', acceptedPath: '/src/a.ts', timestamp: 2 };
		expect(toDeviceRelayPayload({ type: 'update', updates: [js, css] })).toEqual({ type: 'update', updates: [css] });
	});

	it('drops updates without css-update entries and other payload types', () => {
		expect(toDeviceRelayPayload({ type: 'update', updates: [{ type: 'js-update', path: '/src/a.ts' }] })).toBeNull();
		expect(toDeviceRelayPayload({ type: 'full-reload' })).toBeNull();
		expect(toDeviceRelayPayload(undefined)).toBeNull();
	});
});
