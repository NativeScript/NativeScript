import { describe, expect, it } from 'vitest';

import { getBlockedDeviceNodeModulesReason } from './websocket-module-specifiers.js';

describe('device build-time package guards', () => {
	it('blocks NativeScript Vite build-time roots and configuration modules', () => {
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite')).toBe('build-time NativeScript Vite package root is not device-loadable');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/configuration/base.js')).toBe('build-time NativeScript Vite module is not device-loadable: @nativescript/vite/configuration/base.js');
	});

	it('allows NativeScript Vite runtime subpaths that are served over HTTP', () => {
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/angular/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/vue/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite/runtime/core-aliases-early.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/shims/angular-animations-stub.js')).toBeNull();
	});

	it('blocks other known build-time packages from device loading', () => {
		expect(getBlockedDeviceNodeModulesReason('vite')).toBe('build-time package is not device-loadable: vite');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@vitejs/plugin-vue/dist/index.js')).toBe('build-time package is not device-loadable: @vitejs/plugin-vue');
	});
});
