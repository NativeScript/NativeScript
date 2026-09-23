import { describe, it, expect } from 'vitest';
import { IOSNativeWindow } from './native-window.ios';

function sceneWithSession(persistentIdentifier?: string): any {
	return persistentIdentifier ? { session: { persistentIdentifier } } : { session: {} };
}

const uiWindow: any = {};

/**
 * The flag decides whether a disconnect detaches the window for a later reconnect or ends
 * it outright, so it has to mean "this id came from the scene's session" and nothing looser.
 */
describe('IOSNativeWindow session identity', () => {
	it('recognises an id taken from the scene session', () => {
		const window = new IOSNativeWindow(sceneWithSession('ABC-123'), uiWindow, 'ABC-123');

		expect(window._hasSessionIdentity).toBe(true);
	});

	it('rejects a hand-minted id even when the window has a scene', () => {
		const window = new IOSNativeWindow(sceneWithSession('ABC-123'), uiWindow, 'embedded-main');

		expect(window._hasSessionIdentity).toBe(false);
	});

	it('rejects a hand-minted id on a window with no scene', () => {
		const window = new IOSNativeWindow(undefined, uiWindow, 'main');

		expect(window._hasSessionIdentity).toBe(false);
	});

	it('rejects a scene whose session carries no persistent identifier', () => {
		const window = new IOSNativeWindow(sceneWithSession(), uiWindow);

		expect(window._hasSessionIdentity).toBe(false);
		expect(window.id).toMatch(/^window-\d+$/);
	});
});
