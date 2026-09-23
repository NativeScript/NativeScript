import { FrameBase } from './frame-common';
import { getActiveWindow } from '../../application/helpers-common';
import type { WindowBase } from '../../native-window';

export const frameStack: Array<FrameBase> = [];

/**
 * Gets the frame highest in the stack that belongs to the given window, or `undefined` when
 * the window hosts no frame that is currently in the stack.
 */
export function topmostForWindow(window: WindowBase): FrameBase | undefined {
	for (let i = frameStack.length - 1; i >= 0; i--) {
		const frame = frameStack[i];
		if (frame.getNativeWindow() === window) {
			return frame;
		}
	}

	return undefined;
}

/**
 * Gets the topmost frame of a window: the given one, or the active window when none is given.
 *
 * Resolution order:
 * 1. the frame highest in the stack when it belongs to no window - a frame enters the stack on
 *    `navigate()`, which can happen before it is attached to any window, and scoping cannot
 *    place such a frame in one window rather than another, so every caller gets it;
 * 2. the frame highest in the stack that belongs to the window;
 * 3. the frame highest in the stack regardless of window, when that window hosts none.
 */
export function topmost(window?: WindowBase): FrameBase {
	const globalTop = frameStack[frameStack.length - 1];

	if (!globalTop?.getNativeWindow()) {
		return globalTop;
	}

	const target = window ?? getActiveWindow();
	const scoped = target ? topmostForWindow(target) : undefined;

	return scoped ?? globalTop;
}

export function _isFrameStackEmpty(): boolean {
	return frameStack.length === 0;
}

export function _pushInFrameStack(frame: FrameBase): void {
	if (frame._isInFrameStack && frameStack[frameStack.length - 1] === frame) {
		return;
	}

	if (frame._isInFrameStack) {
		const indexOfFrame = frameStack.indexOf(frame);
		frameStack.splice(indexOfFrame, 1);
	}

	frameStack.push(frame);
	frame._isInFrameStack = true;
}

export function _popFromFrameStack(frame: FrameBase): void {
	if (!frame._isInFrameStack) {
		return;
	}

	// Position, not window: popping removes the last entry, so only that entry may be popped.
	if (frameStack[frameStack.length - 1] !== frame) {
		throw new Error('Cannot pop a Frame which is not at the top of the navigation stack.');
	}

	frameStack.pop();
	frame._isInFrameStack = false;
}

export function _removeFromFrameStack(frame: FrameBase): void {
	if (!frame._isInFrameStack) {
		return;
	}

	const index = frameStack.indexOf(frame);
	frameStack.splice(index, 1);
	frame._isInFrameStack = false;
}
