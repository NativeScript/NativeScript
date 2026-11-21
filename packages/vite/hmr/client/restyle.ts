import { Application } from '@nativescript/core';
import { restyleRootAndModals } from '../shared/runtime/restyle-roots.js';

let pending = false;

/**
 * Restyles the live root view and its modals once the stylesheet changes of
 * the current task have landed. Core's tagged CSS calls only invalidate the
 * selector tables; mounted views keep their styles until restyled.
 */
export function scheduleRestyle(): void {
	if (pending) return;
	pending = true;
	Promise.resolve().then(() => {
		pending = false;
		let root: unknown;
		try {
			root = Application.getRootView();
		} catch {}
		restyleRootAndModals(root);
	});
}
