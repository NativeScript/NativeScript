import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { computeAndroidPanelLayout, ensureHmrDevOverlayRuntimeInstalled, hexRgbaToAndroidArgb } from './dev-overlay.js';
import { getGlobalScope } from './global-scope.js';

// Minimal stand-ins for the Android widget surface the host touches. Method
// bodies record just enough to assert attachment and visibility.
class FakeView {
	parent: FakeView | null = null;
	children: FakeView[] = [];
	visibility = 8;
	clickable = false;
	layoutParams: any = null;
	text = '';
	translationY = 0;
	alpha = 1;
	endAction: any = null;
	addView(child: FakeView, params?: any) {
		child.parent = this;
		child.layoutParams = params ?? null;
		this.children.push(child);
	}
	removeView(child: FakeView) {
		this.children = this.children.filter((c) => c !== child);
		child.parent = null;
	}
	getParent() {
		return this.parent;
	}
	getWidth() {
		return 1080;
	}
	setClickable(value: boolean) {
		this.clickable = value;
	}
	setFocusable() {}
	setVisibility(value: number) {
		this.visibility = value;
	}
	setBackgroundColor() {}
	setBackground() {}
	setLayoutParams(params: any) {
		this.layoutParams = params;
	}
	setPadding() {}
	setElevation() {}
	setOrientation() {}
	setGravity() {}
	setTextSize() {}
	setTypeface() {}
	setText(value: string) {
		this.text = value;
	}
	setTextColor() {}
	setTranslationY(value: number) {
		this.translationY = value;
	}
	setAlpha(value: number) {
		this.alpha = value;
	}
	bringToFront() {}
	equals(other: unknown) {
		return other === this;
	}
	animate() {
		const chain: any = {
			translationY: () => chain,
			alpha: () => chain,
			setDuration: () => chain,
			setInterpolator: () => chain,
			withEndAction: (runnable: any) => {
				this.endAction = runnable;
				return chain;
			},
			start: () => {
				this.endAction?.run?.();
				this.endAction = null;
			},
		};
		return chain;
	}
}

class FakeLayoutParams {
	gravity = 0;
	topMargin = 0;
	margins: number[] = [];
	constructor(
		public width: number,
		public height: number,
	) {}
	setMargins(left: number, top: number, right: number, bottom: number) {
		this.margins = [left, top, right, bottom];
	}
}

class FakeDrawable {
	setCornerRadius() {}
	setColor() {}
}

class FakeFrameLayout extends FakeView {
	static LayoutParams = FakeLayoutParams;
}
class FakeLinearLayout extends FakeView {
	static LayoutParams = FakeLayoutParams;
	static VERTICAL = 1;
}
class FakeTextView extends FakeView {}

class FakeRunnable {
	constructor(private readonly impl: { run: () => void }) {}
	run() {
		this.impl.run();
	}
}

// NativeScript layouts the in-tree host would build if it were reached.
class FakeNsLayout {
	children: any[] = [];
	addChild(child: any) {
		this.children.push(child);
	}
}

function installFakeAndroid(decor: FakeView, page: { content: any }) {
	const g = getGlobalScope();
	g.android = {
		widget: { FrameLayout: FakeFrameLayout, LinearLayout: FakeLinearLayout, TextView: FakeTextView },
		view: {
			View: { VISIBLE: 0, GONE: 8 },
			Gravity: { TOP: 48, BOTTOM: 80, CENTER: 17, CENTER_HORIZONTAL: 1 },
			animation: { DecelerateInterpolator: class {}, AccelerateInterpolator: class {} },
		},
		util: { TypedValue: { COMPLEX_UNIT_SP: 2 } },
		graphics: { Typeface: { DEFAULT_BOLD: {} }, drawable: { GradientDrawable: FakeDrawable } },
	};
	g.java = { lang: { Runnable: FakeRunnable } };
	const activity = {
		getWindow: () => ({ getDecorView: () => decor }),
		getResources: () => ({ getDisplayMetrics: () => ({ density: 2 }) }),
	};
	g.Application = { android: { foregroundActivity: activity }, getRootView: () => page };
	g.GridLayout = FakeNsLayout;
	g.StackLayout = FakeNsLayout;
	g.Label = FakeNsLayout;
}

const GLOBALS = ['__NS_HMR_DEV_OVERLAY__', '__NS_HMR_DEV_OVERLAY_STATE__', '__NS_HMR_ANDROID_SAFE_INSETS__', 'android', 'java', 'Application', 'GridLayout', 'StackLayout', 'Label'];

function clearGlobals() {
	const g = getGlobalScope();
	for (const key of GLOBALS) {
		delete g[key];
	}
}

describe('Android overlay colour packing', () => {
	it('packs #RRGGBBAA into a signed ARGB int', () => {
		expect(hexRgbaToAndroidArgb('#FFFFFFFF')).toBe(-1);
		expect(hexRgbaToAndroidArgb('#00000000')).toBe(0);
		expect(hexRgbaToAndroidArgb('#FF000080')).toBe((0x80ff0000 | 0) >> 0);
		expect(hexRgbaToAndroidArgb('#0e6e2fff')).toBe((0xff0e6e2f | 0) >> 0);
	});

	it('treats six-digit values as opaque and rejects garbage', () => {
		expect(hexRgbaToAndroidArgb('#112233')).toBe(hexRgbaToAndroidArgb('#112233FF'));
		expect(hexRgbaToAndroidArgb('nope')).toBe(0);
	});
});

describe('Android overlay panel layout', () => {
	it('scales the safe-area margins by density and caps the width by the host', () => {
		const layout = computeAndroidPanelLayout({ position: 'top', density: 2, hostWidthPx: 500, safeInsets: { top: 24, bottom: 0, left: 0, right: 0 } });
		expect(layout.marginPx).toEqual({ top: 64, right: 32, bottom: 0, left: 32 });
		expect(layout.widthPx).toBe(500 - 64);
	});

	it('uses the full panel width when the host has not been measured yet', () => {
		const layout = computeAndroidPanelLayout({ position: 'bottom', density: 3, hostWidthPx: 0 });
		expect(layout.widthPx).toBe(960);
		expect(layout.marginPx.bottom).toBe(24);
	});
});

describe('Android overlay host', () => {
	beforeEach(clearGlobals);
	afterEach(clearGlobals);

	it('mounts the chip on the DecorView and leaves the page content untouched', () => {
		const decor = new FakeView();
		const content = { id: 'app-root' };
		const page = { content };
		installFakeAndroid(decor, page);

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		api.setUpdateStage('received', { detail: 'Updating /src/app/guitar/guitar.component.html' });

		expect(page.content).toBe(content);
		expect(decor.children).toHaveLength(1);
		const root = decor.children[0];
		expect(root.visibility).toBe(0);
		expect(root.clickable).toBe(false);
		const [panel] = root.children;
		const [title, status] = panel.children;
		expect(title.text).toBe(api.getSnapshot().title);
		expect(status.text).toContain('Updating /src/app/guitar/guitar.component.html');
		expect(panel.layoutParams.gravity).toBe(48 | 1);
	});

	it('reuses the mounted chip across stages and hides it on demand', () => {
		const decor = new FakeView();
		installFakeAndroid(decor, { content: {} });

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		api.setUpdateStage('received');
		api.setUpdateStage('rebooting');
		expect(decor.children).toHaveLength(1);

		api.hide('test');
		expect(decor.children[0].visibility).toBe(8);
	});

	it('rebuilds the chip when the Activity hands out a new DecorView', () => {
		const firstDecor = new FakeView();
		installFakeAndroid(firstDecor, { content: {} });
		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		api.setUpdateStage('received');
		expect(firstDecor.children).toHaveLength(1);

		const secondDecor = new FakeView();
		getGlobalScope().Application.android.foregroundActivity.getWindow = () => ({ getDecorView: () => secondDecor });
		api.setUpdateStage('reimporting');

		expect(firstDecor.children).toHaveLength(0);
		expect(secondDecor.children).toHaveLength(1);
	});
});
