import { Application, Frame, Page } from '@nativescript/core';

export function onLoaded(args) {
	try {
		console.log('[automated] app-root onLoaded');
		const rootPage = args.object as Page;
		// Create a Frame and navigate to main-page to ensure code-behind is bound
		const frame = new Frame();
		try {
			frame.navigate('main-page');
		} catch (e) {
			try {
				console.error('[automated] app-root onLoaded: navigate to main-page failed', e);
			} catch {}
		}
		// Replace the temporary Page root with the Frame containing the page
		try {
			if ((Application as any).resetRootView) {
				(Application as any).resetRootView({ create: () => frame });
			}
		} catch (e) {
			try {
				console.error('[automated] app-root onLoaded: resetRootView failed', e);
			} catch {}
		}
	} catch (e) {
		try {
			console.error('[automated] app-root onLoaded failed', e);
		} catch {}
	}
}
