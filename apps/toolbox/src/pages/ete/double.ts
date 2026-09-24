import { CoreTypes, EventData, Frame, GridLayout, Observable, Page, SafeArea, Screen, StackLayout, View } from '@nativescript/core';

interface Case {
	host: CoreTypes.SafeAreaEdges;
	padding: string;
	hostPadding?: string;
	title: string;
	expected: (inset: number) => number;
}

const CASES: Case[] = [
	{ host: 'none', padding: '', title: 'framework only - the host is inset, the probe adds nothing', expected: (i) => i },
	{ host: 'bottom', padding: 'env(safe-area-inset-bottom)', title: 'author only - the host overflows, the probe pads itself', expected: (i) => i },
	{ host: 'none', padding: 'env(safe-area-inset-bottom)', title: 'BOTH - the host is inset AND the probe pads itself', expected: (i) => i * 2 },
	{ host: 'bottom', padding: '', title: 'NEITHER - the host overflows and nobody pads', expected: () => 0 },
	{ host: 'none', padding: '', hostPadding: 'env(safe-area-inset-bottom)', title: 'SMART - the host pads itself, so the framework stops insetting it there', expected: (i) => i },
	{ host: 'none', padding: 'env(ns-safe-area-inset-bottom)', title: 'BOTH, remaining inset - the host consumed the bottom, so the probe adds 0', expected: (i) => i },
];

function verdict(gap: number | null, inset: number): string {
	if (gap === null) {
		return 'not laid out';
	}
	if (Math.abs(gap - inset) <= 1) {
		return 'OK';
	}
	if (inset > 0 && Math.abs(gap - inset * 2) <= 1) {
		return 'DOUBLE PADDING';
	}
	if (gap <= 1) {
		return 'UNDER THE BAR';
	}

	return `unexpected ${gap}dip`;
}

class DoublePadding extends Observable {
	private index = 0;

	constructor(private page: Page) {
		super();
		SafeArea.on('insetsChanged', this.measure, this);
		page.on(Page.unloadedEvent, () => SafeArea.off('insetsChanged', this.measure, this));
		this.apply();
		setTimeout(() => this.runAll(), 600);
	}

	get host(): GridLayout {
		return this.page.getViewById<GridLayout>('host');
	}

	get marker(): StackLayout {
		return this.page.getViewById<StackLayout>('marker');
	}

	// The padding sits inside the probe, so the probe's own bottom edge never moves -
	// what matters is where its last content pixel ended up.
	get line(): View {
		return this.page.getViewById<View>('line');
	}

	next = () => {
		this.index = (this.index + 1) % CASES.length;
		this.apply();
	};

	prev = () => {
		this.index = (this.index - 1 + CASES.length) % CASES.length;
		this.apply();
	};

	back = () => Frame.topmost().goBack();

	/** Walks every case on a timer and prints one table, so no tapping is needed. */
	runAll = () => {
		const lines: string[] = [];
		const fmt = (v: any) => (v ? `${v.left},${v.top},${v.right},${v.bottom}` : 'n/a');
		lines.push(`[double-padding] page.getSafeAreaInsets = ${fmt(this.page.getSafeAreaInsets())}`);
		lines.push(`[double-padding] host.getSafeAreaInsets = ${fmt(this.host.getSafeAreaInsets())}`);
		lines.push(`[double-padding] host.native.safeAreaInsets = ${fmt((this.host as any).nativeViewProtected?.safeAreaInsets)}`);
		let i = 0;

		const step = () => {
			// Read late: on Android the first insets pass can land after the page is shown.
			const inset = SafeArea.insets.bottom;
			if (i > 0) {
				const c = CASES[i - 1];
				const gap = this.gapBelow(this.line);
				lines.push(`[double-padding] host=${c.host.padEnd(6)} probe=${(c.padding || 'none').padEnd(30)} hostPad=${(c.hostPadding || 'none').padEnd(27)} gap=${gap}dip expected=${c.expected(inset)}dip ${verdict(gap, inset)}`);
			}

			if (i === CASES.length) {
				lines.unshift(`[double-padding] safe-area-inset-bottom = ${inset}dip`);
				lines.forEach((line) => console.log(line));
				this.set('report', lines.slice(1).join('\n'));
				this.index = 0;
				this.apply();

				return;
			}

			this.index = i++;
			this.apply();
			setTimeout(step, 350);
		};

		step();
	};

	private apply() {
		const current = CASES[this.index];
		this.host.overflowSafeArea = current.host;
		this.host.style.paddingBottom = (current.hostPadding || 0) as never;
		this.marker.style.paddingBottom = (current.padding || 0) as never;

		this.set('heading', `host overflowSafeArea="${current.host}"  probe padding-bottom: ${current.padding || 'none'}`);
		this.set('description', current.title);
		this.set('hint', `${this.index + 1} of ${CASES.length}`);

		setTimeout(() => this.measure(), 120);
	}

	measure = () => {
		const inset = SafeArea.insets.bottom;
		const gap = this.gapBelow(this.line);

		this.set('numbers', `safe-area-inset-bottom  ${inset}dip\ngap below the probe     ${gap === null ? '?' : gap}dip\nexpected for this case  ${CASES[this.index].expected(inset)}dip`);
		this.set('verdict', verdict(gap, inset));
	};

	// Distance from the view's bottom edge to the bottom of the screen.
	private gapBelow(view: View): number | null {
		const location = view?.getLocationOnScreen();
		if (!location) {
			return null;
		}

		return Math.round(Screen.mainScreen.heightDIPs - (location.y + view.getActualSize().height));
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DoublePadding(page);
}
