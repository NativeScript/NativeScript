import { describe, it, expect, afterEach } from 'vitest';
import { FrameBase } from './frame-common';
import { frameStack, topmostForWindow, _pushInFrameStack } from './frame-stack';
import { setActiveWindow } from '../../application/helpers-common';
import type { NativeWindow } from '../../native-window';
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

/**
 * Window doubles: `topmost()` only ever compares window references, so a bare object is
 * enough and keeps the real window lifecycle out of these tests.
 */
function createWindow(id: string): NativeWindow {
	return { id } as unknown as NativeWindow;
}

function createFrameInWindow(window: NativeWindow | undefined): FrameBase {
	const frame = new FrameBase();
	frame._nativeWindow = window;
	_pushInFrameStack(frame);

	return frame;
}

describe('topmostForWindow', () => {
	afterEach(() => {
		frameStack.splice(0).forEach((frame) => (frame._isInFrameStack = false));
	});

	it('returns the frame highest in the stack that belongs to the window', () => {
		const window = createWindow('a');
		const other = createWindow('b');
		const first = createFrameInWindow(window);
		const second = createFrameInWindow(window);
		createFrameInWindow(other);

		expect(topmostForWindow(window)).toBe(second);
		expect(first._isInFrameStack).toBe(true);
	});

	it('returns undefined when the window hosts no frame in the stack', () => {
		createFrameInWindow(createWindow('a'));

		expect(topmostForWindow(createWindow('b'))).toBeUndefined();
	});
});

describe('FrameBase.topmost', () => {
	afterEach(() => {
		frameStack.splice(0).forEach((frame) => (frame._isInFrameStack = false));
		setActiveWindow(undefined);
	});

	it("returns the given window's frame while another window sits at the top of the stack", () => {
		const window = createWindow('a');
		const scoped = createFrameInWindow(window);
		const other = createFrameInWindow(createWindow('b'));

		expect(FrameBase.topmost(window)).toBe(scoped);
		expect(FrameBase.topmost()).toBe(other);
	});

	it('scopes to the active window when no window is given', () => {
		const active = createWindow('a');
		const scoped = createFrameInWindow(active);
		createFrameInWindow(createWindow('b'));
		setActiveWindow(active);

		expect(FrameBase.topmost()).toBe(scoped);
	});

	it('falls back to the topmost frame of the stack when the window hosts none', () => {
		const other = createFrameInWindow(createWindow('b'));

		expect(FrameBase.topmost(createWindow('a'))).toBe(other);
	});

	it('returns the frame highest in the stack while it belongs to no window', () => {
		setActiveWindow(createWindow('a'));
		createFrameInWindow(undefined);
		const unattached = createFrameInWindow(undefined);

		expect(FrameBase.topmost()).toBe(unattached);
	});

	it('returns an unattached top frame in a single-window arrangement', () => {
		const window = createWindow('a');
		createFrameInWindow(window);
		const unattached = createFrameInWindow(undefined);
		setActiveWindow(window);

		expect(FrameBase.topmost()).toBe(unattached);
	});

	it('returns an unattached top frame even to a caller scoped to a window that hosts one', () => {
		const window = createWindow('a');
		const hosted = createFrameInWindow(window);
		const unattached = createFrameInWindow(undefined);

		expect(FrameBase.topmost(window)).toBe(unattached);
		expect(topmostForWindow(window)).toBe(hosted);
	});

	it('matches the unscoped topmost when every frame belongs to the same window', () => {
		const window = createWindow('a');
		createFrameInWindow(window);
		const last = createFrameInWindow(window);
		setActiveWindow(window);

		expect(FrameBase.topmost()).toBe(last);
		expect(FrameBase.topmost()).toBe(frameStack[frameStack.length - 1]);
	});

	it('returns undefined when the stack is empty', () => {
		setActiveWindow(createWindow('a'));

		expect(FrameBase.topmost()).toBeUndefined();
	});

	it("leaves the stack alone when the active window's frame cannot go back and is not the last entry", () => {
		const active = createWindow('a');
		const scoped = createFrameInWindow(active);
		const other = createFrameInWindow(createWindow('b'));
		setActiveWindow(active);

		expect(FrameBase.goBack()).toBe(false);

		expect(frameStack).toEqual([scoped, other]);
	});
});
