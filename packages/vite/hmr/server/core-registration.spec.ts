import { describe, expect, it } from 'vitest';
import { coreRegistrationFooter, coreRequireKeys } from './core-registration.js';

describe('coreRequireKeys', () => {
	it('derives every require() spelling a core file answers to', () => {
		expect(coreRequireKeys('/core/ui/core/view/index.ios.js', '/core')).toEqual(['@nativescript/core/ui/core/view/index.ios.js', '@nativescript/core/ui/core/view/index.ios', '@nativescript/core/ui/core/view/index', '@nativescript/core/ui/core/view']);
		expect(coreRequireKeys('/core/index.js', '/core')).toEqual(['@nativescript/core/index.js', '@nativescript/core/index', '@nativescript/core']);
	});

	it('strips TypeScript extensions of a workspace core served from source', () => {
		expect(coreRequireKeys('/repo/packages/core/ui/core/view/index.ios.ts', '/repo/packages/core')).toEqual(['@nativescript/core/ui/core/view/index.ios.ts', '@nativescript/core/ui/core/view/index.ios', '@nativescript/core/ui/core/view/index', '@nativescript/core/ui/core/view']);
	});

	it('ignores files outside the core package', () => {
		expect(coreRequireKeys('/elsewhere/x.js', '/core')).toEqual([]);
		expect(coreRequireKeys('/core-utils/x.js', '/core')).toEqual([]);
	});
});

describe('coreRegistrationFooter', () => {
	it('lets the first instance keep a key, and a timestamped one replace it', () => {
		const first = coreRegistrationFooter('/node_modules/@nativescript/core/index.js', ['@nativescript/core'], false);
		expect(first).toContain('import * as __ns_core_self__ from "/node_modules/@nativescript/core/index.js";');
		expect(first).toContain('if (!t[k]) t[k] = v;');
		const replacing = coreRegistrationFooter('/node_modules/@nativescript/core/index.js', ['@nativescript/core'], true);
		expect(replacing).not.toContain('if (!t[k])');
		expect(replacing).toContain('t[k] = v;');
	});
});
