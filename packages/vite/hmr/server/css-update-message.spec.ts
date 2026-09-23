import { describe, expect, it } from 'vitest';

import { appCssRootRelPath, buildCssUpdateItem } from './css-update-message.js';

describe('appCssRootRelPath', () => {
	it('returns the root-relative posix path with a leading slash', () => {
		expect(appCssRootRelPath('/proj', '/proj/src/app.css')).toBe('/src/app.css');
	});

	it('tolerates a trailing slash on root and Windows separators', () => {
		expect(appCssRootRelPath('/proj/', '/proj/src/app.css')).toBe('/src/app.css');
		expect(appCssRootRelPath('C:/proj', 'C:\\proj\\src\\app.css')).toBe('/src/app.css');
	});

	it('returns null when the stylesheet escapes the project root (a /../ fetch URL is unresolvable)', () => {
		expect(appCssRootRelPath('/proj', '/elsewhere/app.css')).toBeNull();
		expect(appCssRootRelPath('/proj', '/proj')).toBeNull();
	});
});

describe('buildCssUpdateItem', () => {
	it('omits the tag for global stylesheet updates and carries it for component updates', () => {
		expect(buildCssUpdateItem('/src/app.css', { timestamp: 1 })).toEqual({ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 1 });
		expect(buildCssUpdateItem('/src/a.component.css', { tag: '/src/a.component.css', timestamp: 2 })).toEqual({
			type: 'css-update',
			path: '/src/a.component.css',
			acceptedPath: '/src/a.component.css',
			timestamp: 2,
			tag: '/src/a.component.css',
		});
	});
});
