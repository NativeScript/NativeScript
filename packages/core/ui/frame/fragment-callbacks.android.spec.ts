import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FragmentCallbacksImplementation } from './frame-helper-for-android';

vi.mock('./fragment.transitions', () => ({}));
vi.mock('../../application/helpers-common', async (importOriginal) => ({
	...(await importOriginal<object>()),
	getNativeApp: () => ({ getApplicationContext: () => ({ getResources: () => ({}) }) }),
}));

class BitmapDrawable {}

function createNativeFrameView(cachedDrawable?: object) {
	let background: object | null = null;

	return {
		_cachedDrawable: cachedDrawable,
		getBackground: () => background,
		setBackgroundDrawable: (drawable: object) => {
			background = drawable;
		},
	};
}

function destroyViewOfRemovedParent(nativeFrameView: object) {
	const callbacks = new FragmentCallbacksImplementation();
	callbacks.frame = { nativeViewProtected: nativeFrameView } as any;
	const superFunc = vi.fn();

	callbacks.onDestroyView({ getRemovingParentFragment: () => ({}) } as any, superFunc);

	expect(superFunc).toHaveBeenCalledTimes(1);
}

describe('fragment view destroyed while its parent fragment is removed', () => {
	beforeEach(() => {
		vi.stubGlobal('android', { graphics: { drawable: { BitmapDrawable } } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('caches the background from before the snapshot as the default', () => {
		const nativeFrameView = createNativeFrameView();

		destroyViewOfRemovedParent(nativeFrameView);

		expect(nativeFrameView._cachedDrawable).toBeNull();
		expect(nativeFrameView.getBackground()).toBeInstanceOf(BitmapDrawable);
	});

	it('keeps a default background that is already cached', () => {
		const cachedDrawable = {};
		const nativeFrameView = createNativeFrameView(cachedDrawable);

		destroyViewOfRemovedParent(nativeFrameView);

		expect(nativeFrameView._cachedDrawable).toBe(cachedDrawable);
		expect(nativeFrameView.getBackground()).toBeInstanceOf(BitmapDrawable);
	});
});
