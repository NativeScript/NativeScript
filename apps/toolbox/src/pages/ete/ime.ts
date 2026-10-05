import { EventData, Frame, GridLayout, Observable, Page, TextField, Utils } from '@nativescript/core';
import { readEdges } from './shared';

class Ime extends Observable {
	private ownPadding = 0;

	constructor(private page: Page) {
		super();
		// Poll instead of waiting on a layout pass: the keyboard animates in and the
		// interesting numbers are the ones after it settles.
		const timer = setInterval(() => this.refresh(), 250);
		this.page.on(Page.navigatedFromEvent, () => clearInterval(timer));
	}

	get probe(): GridLayout {
		return this.page.getViewById<GridLayout>('probe');
	}

	/** Raising the app's own padding while the keyboard is up must not eat the keyboard gap. */
	bumpPadding = () => {
		this.ownPadding = this.ownPadding ? 0 : 24;
		this.probe.padding = this.ownPadding;
		setTimeout(() => this.refresh(), 60);
	};

	dismiss = () => {
		this.page.getViewById<TextField>('field').dismissSoftInput();
	};

	back = () => {
		Frame.topmost().goBack();
	};

	refresh() {
		const readout = readEdges(this.probe);
		this.set('padding', readout.padding);
		this.set('edgeInsets', `edge  ${readout.edgeInsets}`);
		this.set('imeInsets', `ime   ${readout.imeInsets}`);

		const native = this.probe?.android as org.nativescript.widgets.LayoutBase;
		if (!native?.getImeInsets) {
			return;
		}

		// toDevicePixels can land on a half pixel; the view rounds it, so compare rounded.
		const own = Math.round(Utils.layout.toDevicePixels(this.ownPadding));
		const expected = own + Math.max(native.getEdgeInsets().bottom, native.getImeInsets().bottom);
		const actual = native.getPaddingBottom();
		this.set('verdict', actual === expected ? `PASS - bottom padding ${actual} = own ${own} + max(nav, ime)` : `FAIL - bottom padding ${actual}, expected ${expected}`);
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new Ime(page);
}
