import { CoreTypes, EventData, Frame, GridLayout, Observable, Page } from '@nativescript/core';
import { readEdges, readWindowInsets } from './shared';

interface Case {
	edge: CoreTypes.AndroidOverflow;
	description: string;
}

/**
 * One entry per shape androidOverflowEdge can take. Walk them with prev/next and the
 * green ring tells you which edges the probe padded.
 */
const CASES: Case[] = [
	{ edge: 'none', description: 'pads every edge and consumes them - expect a green ring all the way round' },
	{ edge: 'ignore', description: 'takes no part at all - expect no green ring, and no ring left over from the previous case' },
	{ edge: 'top', description: 'overflows the top - blue should reach up under the status bar, green on the other three' },
	{ edge: 'bottom', description: 'overflows the bottom - blue should reach down under the navigation bar' },
	{ edge: 'left', description: 'overflows the left - only visible when there is a left inset (landscape / gesture nav)' },
	{ edge: 'right', description: 'overflows the right - only visible when there is a right inset' },
	{ edge: 'top,bottom', description: 'overflows both - green only on left/right, which are usually 0 in portrait' },
	{ edge: 'left,right', description: 'overflows the sides - green top and bottom' },
	{ edge: 'all-but-top', description: 'only the top is padded' },
	{ edge: 'all-but-bottom', description: 'only the bottom is padded' },
	{ edge: 'top-dont-consume', description: 'pads the top AND passes the top inset on to children' },
	{ edge: 'bottom-dont-consume', description: 'pads the bottom AND passes the bottom inset on to children' },
	{ edge: 'dont-apply', description: 'hands the insets to JS and pads nothing - expect no green ring' },
	{ edge: 'none,none', description: 'a stacked value that resolves to none - must behave exactly like the first case' },
	{ edge: 'ignore,bottom', description: 'ignore wins over anything after it - must behave exactly like ignore' },
];

class EdgeMatrix extends Observable {
	private index = 0;

	constructor(private page: Page) {
		super();
		this.apply();
	}

	get probe(): GridLayout {
		return this.page.getViewById<GridLayout>('probe');
	}

	next = () => {
		this.index = (this.index + 1) % CASES.length;
		this.apply();
	};

	prev = () => {
		this.index = (this.index - 1 + CASES.length) % CASES.length;
		this.apply();
	};

	back = () => {
		Frame.topmost().goBack();
	};

	private apply() {
		const current = CASES[this.index];
		this.set('edge', current.edge);
		this.set('heading', `androidOverflowEdge = "${current.edge}"`);
		this.set('description', current.description);
		this.set('hint', `green ring = padded edge, blue to the screen edge = overflowing (${this.index + 1} of ${CASES.length})`);
		// The insets land on the next layout pass, so read the probe after it.
		setTimeout(() => this.refresh(), 80);
	}

	refresh() {
		const readout = readEdges(this.probe);
		this.set('padding', readout.padding);
		this.set('edgeInsets', readout.edgeInsets);
		this.set('imeInsets', readout.imeInsets);
		this.set('windowInsets', readWindowInsets(this.page));
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new EdgeMatrix(page);
}
