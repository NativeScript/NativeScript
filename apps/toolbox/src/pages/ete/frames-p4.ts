import { EventData, Page, ScrollView, StackLayout } from '@nativescript/core';
import { FramesProbe } from './frames-shared';

class NestedProbe extends FramesProbe {
	private scrolls = true;

	constructor(page: Page) {
		super(page, 'page 4 - nested in page 3, scrolls', 'line-p4');
		this.set('mode', 'scrolls');
		// Re-measure after page 3 changes what it consumes.
		setTimeout(() => this.measure(), 2000);
		setTimeout(() => this.measure(), 5200);
	}

	toggle = () => {
		this.scrolls = !this.scrolls;

		const scroll = this.page.getViewById<ScrollView>('scroll');
		const filler = this.page.getViewById<StackLayout>('filler');
		filler.height = this.scrolls ? 600 : 0;
		scroll.scrollToVerticalOffset(0, false);

		this.set('mode', this.scrolls ? 'scrolls' : 'does not scroll');
		this.set('label', `page 4 - nested in page 3, ${this.scrolls ? 'scrolls' : 'does not scroll'}`);
		setTimeout(() => this.measure(), 150);
	};
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new NestedProbe(page);
}
