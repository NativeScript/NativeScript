import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBackPreview } from './back-preview.android';

class View {
	parent: any;
	x = 0;
	sx = 1;
	sy = 1;
	alpha = 1;
	elevation = 0;
	background: any = null;
	animator = new Animator(this);
	getWidth() {
		return 400;
	}
	getHeight() {
		return 800;
	}
	getLeft() {
		return 0;
	}
	getTop() {
		return 0;
	}
	getParent() {
		return this.parent;
	}
	getTranslationX() {
		return this.x;
	}
	setTranslationX(value) {
		this.x = value;
	}
	getScaleX() {
		return this.sx;
	}
	setScaleX(value) {
		this.sx = value;
	}
	getScaleY() {
		return this.sy;
	}
	setScaleY(value) {
		this.sy = value;
	}
	getAlpha() {
		return this.alpha;
	}
	setAlpha(value) {
		this.alpha = value;
	}
	getElevation() {
		return this.elevation;
	}
	setElevation(value) {
		this.elevation = value;
	}
	getBackground() {
		return this.background;
	}
	setBackground(value) {
		this.background = value;
	}
	getContext() {
		return { getTheme: () => ({ resolveAttribute: () => false }) };
	}
	getResources() {
		return { getDisplayMetrics: () => ({ density: 1 }) };
	}
	draw() {}
	animate() {
		return this.animator;
	}
}
class Animator {
	timer: any;
	constructor(private view: View) {}
	cancel() {
		clearTimeout(this.timer);
	}
	translationX(value) {
		this.view.x = value;
		return this;
	}
	scaleX(value) {
		this.view.sx = value;
		return this;
	}
	scaleY(value) {
		this.view.sy = value;
		return this;
	}
	alpha(value) {
		this.view.alpha = value;
		return this;
	}
	setDuration(_) {
		return this;
	}
	withEndAction(action) {
		this.timer = setTimeout(() => action.run(), 200);
		return this;
	}
}
class Group extends View {
	children: View[] = [];
	getChildCount() {
		return this.children.length;
	}
	getChildAt(index) {
		return this.children[index];
	}
	addView(view, index) {
		this.children.splice(index, 0, view);
		view.parent = this;
	}
	removeView(view) {
		this.children = this.children.filter((child) => child !== view);
		view.parent = null;
	}
}
class Image extends View {
	bitmap: any;
	constructor(_context) {
		super();
	}
	setImageBitmap(value) {
		this.bitmap = value;
	}
	setImageDrawable(value) {
		this.bitmap = value;
	}
	setImportantForAccessibility(_) {}
	setClickable(_) {}
	setFocusable(_) {}
	measure() {}
	layout() {}
}
const bitmap = { recycle: vi.fn(), getAllocationByteCount: () => 1280000 };
function setup() {
	const container = new Group();
	const top = new View();
	const below = new View();
	container.addView(top, 0);
	const frame: any = { currentPage: { nativeViewProtected: top }, backStack: [{ resolvedPage: { nativeViewProtected: below } }], nativeViewProtected: container, android: { activity: { getWindow: () => ({ getAttributes: () => ({ flags: 0 }) }) } } };
	const disposed = vi.fn();
	return { frame, container, top, below, disposed, begin: () => createBackPreview(frame, { onDispose: disposed })! };
}
beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal('android', {
		view: { View: Object.assign(View, { IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS: 4, MeasureSpec: { EXACTLY: 1, makeMeasureSpec: (value) => value } }), ViewGroup: Group, SurfaceView: class extends View {}, TextureView: class extends View {}, WindowManager: { LayoutParams: { FLAG_SECURE: 8192 } } },
		graphics: { Bitmap: { createBitmap: () => bitmap, Config: { ARGB_8888: 1 } }, Canvas: class {}, drawable: { ColorDrawable: class {} } },
		widget: { ImageView: Image },
		util: { TypedValue: class {} },
		R: { attr: { colorBackground: 1 } },
	});
	vi.stubGlobal('org', { nativescript: { widgets: { CommonLayoutParams: class {} } } });
	vi.stubGlobal('java', {
		lang: {
			Runnable: class {
				run;
				constructor(value) {
					this.run = value.run;
				}
			},
		},
	});
});
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('Frame snapshot back preview', () => {
	it('never reparents or transforms the previous Page and removes only the snapshot', () => {
		const { begin, below, container, top, disposed } = setup();
		const session = begin();
		session.update(0.5, 'left');
		expect(below.parent).toBeUndefined();
		expect(below.x).toBe(0);
		expect(container.children[0]).toBeInstanceOf(Image);
		expect(top.sx).toBe(0.95);
		session.dispose();
		session.dispose();
		expect(container.children).toEqual([top]);
		expect(top.sx).toBe(1);
		expect(disposed).toHaveBeenCalledOnce();
		expect(session.snapshotBytes).toBe(0);
	});
	it('cancels while finishing and settles the pending promise as interrupted', async () => {
		const { begin, top } = setup();
		const session = begin();
		session.update(0.7, 'right');
		const done = session.finish();
		session.cancel();
		await expect(done).resolves.toBe(false);
		vi.runAllTimers();
		expect(session.active).toBe(false);
		expect(top.x).toBe(0);
	});
	it('finishes presentation without modifying Frame history', async () => {
		const { begin, frame } = setup();
		const session = begin();
		const done = session.finish();
		vi.runAllTimers();
		await expect(done).resolves.toBe(true);
		expect(frame.backStack).toHaveLength(1);
		expect(session.active).toBe(true);
		session.dispose();
	});
	it('disposal interrupts pending completion', async () => {
		const { begin } = setup();
		const session = begin();
		const done = session.finish();
		session.dispose();
		vi.runAllTimers();
		await expect(done).resolves.toBe(false);
	});
	it('declines secure windows, surfaces and oversized snapshots', () => {
		const { frame, below, begin, container } = setup();
		frame.android.activity.getWindow = () => ({ getAttributes: () => ({ flags: 8192 }) });
		expect(begin()).toBeUndefined();
		frame.android.activity.getWindow = () => ({ getAttributes: () => ({ flags: 0 }) });
		below.getWidth = () => 10000;
		expect(begin()).toBeUndefined();
		frame.backStack[0].resolvedPage.nativeViewProtected = new android.view.SurfaceView(null);
		expect(begin()).toBeUndefined();
		expect(container.children).toHaveLength(1);
	});
	it('releases a bitmap when capture fails', () => {
		const { below, begin } = setup();
		below.draw = () => {
			throw new Error('unsupported software drawing');
		};
		expect(begin()).toBeUndefined();
		expect(bitmap.recycle).toHaveBeenCalledOnce();
	});
});
