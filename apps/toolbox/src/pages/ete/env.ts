import { CoreTypes, EventData, Frame, Observable, Page, SafeArea, StackLayout, Utils } from '@nativescript/core';

interface Case {
	declaration: CoreTypes.CssFunctionValue;
	description: string;
}

// The green ring around the probe IS the padding env() resolved to.
const CASES: Case[] = [
	{ declaration: 'env(safe-area-inset-bottom)', description: 'the bare inset - the ring should match the navigation bar / home indicator exactly' },
	{ declaration: 'calc(12dip + env(safe-area-inset-bottom))', description: 'the everyday form - 12dip of breathing room on top of the inset' },
	{ declaration: 'env(safe-area-max-inset-bottom)', description: 'the largest inset seen this session - rotate twice and it stops shrinking back' },
	{ declaration: 'env(safe-area-inset-bottom, 32dip)', description: 'a fallback that is never read, because the name resolves' },
	{ declaration: 'env(not-a-real-variable, 32dip)', description: 'an unknown name, so the fallback is used - expect a 32dip ring' },
	{ declaration: 'env(not-a-real-variable)', description: 'unknown with no fallback - invalid at computed-value time, so no ring at all' },
	{ declaration: 'calc(env(safe-area-inset-top) + env(safe-area-inset-bottom))', description: 'both insets added - the ring should be the two bars together' },
];

class EnvProbe extends Observable {
	private index = 0;

	constructor(private page: Page) {
		super();

		SafeArea.on('insetsChanged', this.onInsetsChanged, this);
		page.on(Page.unloadedEvent, () => SafeArea.off('insetsChanged', this.onInsetsChanged, this));

		this.apply();
	}

	get probe(): StackLayout {
		return this.page.getViewById<StackLayout>('probe');
	}

	get twin(): StackLayout {
		return this.page.getViewById<StackLayout>('twin');
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

	private onInsetsChanged = () => {
		this.refresh();
	};

	private apply() {
		const current = CASES[this.index];

		// Set from ts, which is the half a stylesheet cannot demonstrate.
		this.probe.style.paddingBottom = current.declaration;
		this.twin.style.paddingBottom = current.declaration;

		this.set('heading', `style.paddingBottom = '${current.declaration}'`);
		this.set('description', current.description);
		this.set('hint', `${this.index + 1} of ${CASES.length} - the two rings should match`);

		this.refresh();
	}

	refresh() {
		const insets = SafeArea.insets;
		const max = SafeArea.maxInsets;

		this.set('insets', `insets     ${insets.left}, ${insets.top}, ${insets.right}, ${insets.bottom}`);
		this.set('maxInsets', `maxInsets  ${max.left}, ${max.top}, ${max.right}, ${max.bottom}`);
		this.set('resolved', `overflowSafeArea="bottom"  ->  ${this.describePadding(this.probe)}\noverflowSafeArea="none"    ->  ${this.describePadding(this.twin)}`);
	}

	private describePadding(view: StackLayout): string {
		if (!view) {
			return 'not laid out yet';
		}

		const dip = Math.round(Utils.layout.toDeviceIndependentPixels(view.effectivePaddingBottom));

		return `padding-bottom ${dip}dip`;
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new EnvProbe(page);
}
