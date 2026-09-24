import { EventData, Page } from '@nativescript/core';
import { FramesProbe } from './frames-shared';

class HostProbe extends FramesProbe {
	constructor(page: Page) {
		super(page, 'page 3 - no scroll, hosts a nested frame');

		// Page 4's css never changes; only what page 3 declares here does.
		page.overflowSafeArea = 'bottom';
		this.set('mode', 'page 3 passes the bottom through');
		setTimeout(() => {
			page.overflowSafeArea = 'none';
			this.set('mode', 'page 3 consumes the bottom');
			console.log('[frames] page 3 switched to overflowSafeArea="none"');
		}, 4200);
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new HostProbe(page);
}
