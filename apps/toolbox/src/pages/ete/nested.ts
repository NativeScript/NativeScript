import { AndroidOverflowInsetData, EventData, Frame, GridLayout, Observable, Page, View } from '@nativescript/core';
import { readEdges } from './shared';

const OVERRIDE_TOP = 200;

class Nested extends Observable {
	private consume = { left: false, top: false, right: false, bottom: false };
	private overrideTop = false;
	/** What the outer view was handed, before we touched anything. */
	private seen = { left: 0, top: 0, right: 0, bottom: 0 };

	constructor(private page: Page) {
		super();
		this.publish();
		this.outer.on(View.androidOverflowInsetEvent, this.onInset, this);
		this.page.on(Page.navigatedFromEvent, () => this.outer.off(View.androidOverflowInsetEvent, this.onInset, this));
	}

	get outer(): GridLayout {
		return this.page.getViewById<GridLayout>('outer');
	}

	get inner(): GridLayout {
		return this.page.getViewById<GridLayout>('inner');
	}

	onInset(args: AndroidOverflowInsetData) {
		const inset = args.inset;
		this.seen = { left: inset.left, top: inset.top, right: inset.right, bottom: inset.bottom };

		// Writing back into the inset is the whole point of dont-apply: whatever we leave
		// unconsumed is what the children are offered.
		if (this.overrideTop) {
			inset.top = OVERRIDE_TOP;
		}

		inset.leftConsumed = this.consume.left;
		inset.topConsumed = this.consume.top;
		inset.rightConsumed = this.consume.right;
		inset.bottomConsumed = this.consume.bottom;

		setTimeout(() => this.refresh(), 0);
	}

	private requestInsets() {
		const native = this.outer?.android as android.view.View;
		if (native) {
			androidx.core.view.ViewCompat.requestApplyInsets(native);
		}
		setTimeout(() => this.refresh(), 80);
	}

	toggleTop = () => {
		this.consume.top = !this.consume.top;
		this.publish();
		this.requestInsets();
	};

	toggleBottom = () => {
		this.consume.bottom = !this.consume.bottom;
		this.publish();
		this.requestInsets();
	};

	toggleLeft = () => {
		this.consume.left = !this.consume.left;
		this.publish();
		this.requestInsets();
	};

	toggleRight = () => {
		this.consume.right = !this.consume.right;
		this.publish();
		this.requestInsets();
	};

	toggleOverride = () => {
		this.overrideTop = !this.overrideTop;
		this.publish();
		this.requestInsets();
	};

	back = () => {
		Frame.topmost().goBack();
	};

	private publish() {
		const on = Object.keys(this.consume).filter((key) => this.consume[key]);
		this.set('consuming', `consuming: ${on.length ? on.join(', ') : 'nothing'}`);
		this.set('topOverride', `top override: ${this.overrideTop ? `${OVERRIDE_TOP}px` : 'off'}`);
	}

	refresh() {
		const inner = readEdges(this.inner);
		const outer = readEdges(this.outer);
		this.set('raw', `raw insets seen by outer: ${this.seen.left}, ${this.seen.top}, ${this.seen.right}, ${this.seen.bottom}`);
		this.set('innerPadding', inner.padding);
		this.set('outerPadding', outer.padding);

		const nativeInner = this.inner?.android as android.view.View;
		const nativeOuter = this.outer?.android as android.view.View;
		if (!nativeInner || !nativeOuter) {
			return;
		}

		const expectedTop = this.consume.top ? 0 : this.overrideTop ? OVERRIDE_TOP : this.seen.top;
		const expectedBottom = this.consume.bottom ? 0 : this.seen.bottom;
		const problems: string[] = [];

		if (nativeInner.getPaddingTop() !== expectedTop) {
			problems.push(`inner top ${nativeInner.getPaddingTop()} != ${expectedTop}`);
		}
		if (nativeInner.getPaddingBottom() !== expectedBottom) {
			problems.push(`inner bottom ${nativeInner.getPaddingBottom()} != ${expectedBottom}`);
		}
		if (nativeOuter.getPaddingTop() !== 0 || nativeOuter.getPaddingBottom() !== 0) {
			problems.push('outer padded itself despite dont-apply');
		}

		this.set('verdict', problems.length ? `FAIL: ${problems.join('; ')}` : 'PASS - JS writes reached the native inset pass');
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new Nested(page);
}
