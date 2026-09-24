import { Frame, Observable, Page, SafeArea, Screen, ScrollView, View } from '@nativescript/core';

/** Distance from the view's bottom edge to the bottom of the screen, in dip. */
export function gapBelow(view: View): number | null {
	const location = view?.getLocationOnScreen();
	if (!location) {
		return null;
	}

	return Math.round(Screen.mainScreen.heightDIPs - (location.y + view.getActualSize().height));
}

export function verdictFor(gap: number | null, inset: number): string {
	if (gap === null) {
		return 'not laid out yet';
	}
	if (inset === 0) {
		return 'no bottom inset on this device';
	}
	if (Math.abs(gap - inset) <= 1) {
		return 'OK - clear of the bar by exactly one inset';
	}
	if (Math.abs(gap - inset * 2) <= 1) {
		return 'DOUBLE PADDING';
	}
	if (gap <= 1) {
		return 'UNDER THE BAR';
	}

	return `unexpected gap (${gap}dip vs ${inset}dip)`;
}

/**
 * Wires the readout and the shared navigation every page in this repro carries.
 */
export class FramesProbe extends Observable {
	constructor(
		protected page: Page,
		private label: string,
		private lineId?: string,
	) {
		super();

		SafeArea.on('insetsChanged', this.measure, this);
		page.on(Page.unloadedEvent, () => SafeArea.off('insetsChanged', this.measure, this));

		this.set('label', label);
		setTimeout(() => this.measure(), 150);
	}

	// The padding sits inside the marker, so measure its last content pixel. The id is
	// per page, because getViewById also walks into a nested frame's page.
	get line(): View {
		return this.lineId ? this.page.getViewById<View>(this.lineId) : null;
	}

	measure = () => {
		const inset = SafeArea.insets.bottom;
		// A marker scrolled out of view says nothing, so run the scroll to its end first.
		const scroll = this.page.getViewById<ScrollView>('scroll');
		if (scroll) {
			scroll.scrollToVerticalOffset(scroll.scrollableHeight, false);
		}
		const gap = gapBelow(this.line);

		this.set('numbers', `${this.label}\nsafe-area-inset-bottom  ${inset}dip\ngap below last content  ${gap === null ? '?' : gap}dip`);
		this.set('verdict', verdictFor(gap, inset));
		const remaining = (this.line as any)?.getRemainingSafeAreaInsets?.().bottom;
		console.log(`[frames] ${this.label.padEnd(46)} window=${inset}dip remaining=${remaining}dip gap=${gap}dip ${verdictFor(gap, inset)}`);
	};

	// The outer frame is the one hosting pages 1-3, which is this page's own frame
	// unless we are page 4, which lives in page 3's nested frame.
	private outerFrame(): Frame {
		let frame = this.page.frame;
		while (frame?.parent) {
			const parentFrame = (frame.parent as View).page?.frame;
			if (!parentFrame || parentFrame === frame) {
				break;
			}
			frame = parentFrame;
		}

		return frame;
	}

	go1 = () => this.outerFrame()?.navigate('pages/ete/frames-p1');
	go2 = () => this.outerFrame()?.navigate('pages/ete/frames-p2');
	go3 = () => this.outerFrame()?.navigate('pages/ete/frames-p3');
	back = () => Frame.topmost().goBack();
}
