import { describe, it, expect, afterEach } from 'vitest';
import { FrameBase } from './frame-common';
import { frameStack, _pushInFrameStack } from './frame-stack';
import type { BackstackEntry } from './frame-interfaces';
import { NavigationType } from './frame-interfaces';

/**
 * `FrameBase` is used directly instead of the platform `Frame`: the navigation queue and the
 * frame stack live in the common layer, while `Frame` only adds native fragment/controller work.
 */
function createFrame(canGoBack: boolean): FrameBase {
	const frame = new FrameBase();

	if (canGoBack) {
		const entry: BackstackEntry = {
			entry: {},
			resolvedPage: undefined,
			navDepth: undefined,
			fragmentTag: undefined,
		};
		backStackOf(frame).push(entry);
	}

	return frame;
}

function backStackOf(frame: FrameBase): Array<BackstackEntry> {
	return frame['_backStack'];
}

function navigationQueueOf(frame: FrameBase) {
	return frame['_navigationQueue'];
}

function isNavigatingBack(frame: FrameBase): boolean {
	return navigationQueueOf(frame).some((context) => context.navigationType === NavigationType.back);
}

describe('FrameBase.goBack', () => {
	afterEach(() => {
		frameStack.splice(0).forEach((frame) => (frame._isInFrameStack = false));
	});

	it('navigates the topmost frame when no frame is given', () => {
		const first = createFrame(true);
		const second = createFrame(true);
		_pushInFrameStack(first);
		_pushInFrameStack(second);

		expect(FrameBase.goBack()).toBe(true);

		expect(isNavigatingBack(second)).toBe(true);
		expect(isNavigatingBack(first)).toBe(false);
	});

	it('navigates the given frame even when another frame is topmost', () => {
		const first = createFrame(true);
		const second = createFrame(true);
		_pushInFrameStack(first);
		_pushInFrameStack(second);

		expect(FrameBase.goBack(first)).toBe(true);

		expect(isNavigatingBack(first)).toBe(true);
		expect(isNavigatingBack(second)).toBe(false);
	});

	it('falls back to an ancestor frame of the given frame', () => {
		const parent = createFrame(true);
		const child = createFrame(false);
		child.parent = parent;
		const topmost = createFrame(true);
		_pushInFrameStack(child);
		_pushInFrameStack(topmost);

		expect(FrameBase.goBack(child)).toBe(true);

		expect(isNavigatingBack(parent)).toBe(true);
		expect(isNavigatingBack(child)).toBe(false);
		expect(isNavigatingBack(topmost)).toBe(false);
	});

	it('falls back to an ancestor frame of the topmost frame when no frame is given', () => {
		const parent = createFrame(true);
		const child = createFrame(false);
		child.parent = parent;
		_pushInFrameStack(child);

		expect(FrameBase.goBack()).toBe(true);

		expect(isNavigatingBack(parent)).toBe(true);
		expect(isNavigatingBack(child)).toBe(false);
	});

	it('reports no navigation and leaves the stack alone when the given frame is not topmost', () => {
		const first = createFrame(false);
		const second = createFrame(true);
		_pushInFrameStack(first);
		_pushInFrameStack(second);

		expect(FrameBase.goBack(first)).toBe(false);

		expect(frameStack).toEqual([first, second]);
		expect(isNavigatingBack(second)).toBe(false);
	});

	it('pops the topmost frame when it cannot navigate back', () => {
		const first = createFrame(true);
		const second = createFrame(false);
		_pushInFrameStack(first);
		_pushInFrameStack(second);

		expect(FrameBase.goBack()).toBe(false);

		expect(frameStack).toEqual([first]);
		expect(second._isInFrameStack).toBe(false);
	});

	it('keeps the last frame in the stack when it cannot navigate back', () => {
		const only = createFrame(false);
		_pushInFrameStack(only);

		expect(FrameBase.goBack()).toBe(false);
		expect(FrameBase.goBack(only)).toBe(false);

		expect(frameStack).toEqual([only]);
	});
});
