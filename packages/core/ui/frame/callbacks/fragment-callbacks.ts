import { profile } from '../../../profiling';
import { AndroidFragmentCallbacks, BackstackEntry, Frame } from '..';
import { Trace } from '../../../trace';
import { Application } from '../../../application';
import { Color } from '../../../color';
import { getFrameByNumberId } from '../index.android';
import { _updateTransitions } from '../fragment.transitions';
import { Page } from 'ui/page';

const FRAMEID = '_frameId';
const CALLBACKS = '_callbacks';

export class FragmentCallbacksImplementation implements AndroidFragmentCallbacks {
	public frame: Frame;
	public entry: BackstackEntry;
	private backgroundBitmap: android.graphics.Bitmap = null;

	@profile
	public onHiddenChanged(fragment: androidx.fragment.app.Fragment, hidden: boolean, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write(`${fragment}.onHiddenChanged(${hidden})`, Trace.categories.NativeLifecycle);
		}
		superFunc.call(fragment, hidden);
	}

	@profile
	public onCreateAnimator(fragment: androidx.fragment.app.Fragment, transit: number, enter: boolean, nextAnim: number, superFunc: Function): android.animation.Animator {
		let animator = null;
		const entry = <any>this.entry;

		// Return enterAnimator only when new (no current entry) nested transition.
		if (enter && entry.isNestedDefaultTransition) {
			animator = entry.enterAnimator;
			entry.isNestedDefaultTransition = false;
		}

		return animator || superFunc.call(fragment, transit, enter, nextAnim);
	}

	@profile
	public onCreate(fragment: androidx.fragment.app.Fragment, savedInstanceState: android.os.Bundle, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write(`${fragment}.onCreate(${savedInstanceState})`, Trace.categories.NativeLifecycle);
		}

		superFunc.call(fragment, savedInstanceState);
		// There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
		// We should find its corresponding page in our backstack and set it manually.
		if (!this.entry) {
			const args = fragment.getArguments();
			const frameId = args.getInt(FRAMEID);
			const frame = getFrameByNumberId(frameId);
			if (!frame) {
				throw new Error(`Cannot find Frame for ${fragment}`);
			}

			findPageForFragment(fragment, frame);
		}
	}

	@profile
	public onCreateView(fragment: androidx.fragment.app.Fragment, inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle, superFunc: Function): android.view.View {
		if (Trace.isEnabled()) {
			Trace.write(`${fragment}.onCreateView(inflater, container, ${savedInstanceState})`, Trace.categories.NativeLifecycle);
		}

		const entry = this.entry;
		if (!entry) {
			Trace.error(`${fragment}.onCreateView: entry is null or undefined`);

			return null;
		}

		const page = entry.resolvedPage;
		if (!page) {
			Trace.error(`${fragment}.onCreateView: entry has no resolvedPage`);

			return null;
		}

		const frame = this.frame;
		if (!frame) {
			Trace.error(`${fragment}.onCreateView: this.frame is null or undefined`);

			return null;
		}

		frame._resolvedPage = page;

		if (page.parent === frame) {
			frame._inheritStyles(page);

			// If we are navigating to a page that was destroyed
			// reinitialize its UI.
			if (!page._context) {
				const context = (container && container.getContext()) || (inflater && inflater.getContext());
				page._setupUI(context);
			}

			if (frame.isLoaded && !page.isLoaded) {
				page.callLoaded();
			}
		} else {
			if (!page.parent) {
				if (!frame._styleScope) {
					// Make sure page will have styleScope even if parents don't.
					page._updateStyleScope();
				}

				frame._addView(page);
			} else {
				throw new Error('Page is already shown on another frame.');
			}
		}

		const savedState = entry.viewSavedState;
		if (savedState) {
			(<android.view.View>page.nativeViewProtected).restoreHierarchyState(savedState);
			entry.viewSavedState = null;
		}

		// fixes 'java.lang.IllegalStateException: The specified child already has a parent. You must call removeView() on the child's parent first'.
		// on app resume in nested frame scenarios with support library version greater than 26.0.0
		// HACK: this whole code block shouldn't be necessary as the native view is supposedly removed from its parent
		// right after onDestroyView(...) is called but for some reason the fragment view (page) still thinks it has a
		// parent while its supposed parent believes it properly removed its children; in order to "force" the child to
		// lose its parent we temporarily add it to the parent, and then remove it (addViewInLayout doesn't trigger layout pass)
		const nativeView = page.nativeViewProtected;
		if (nativeView != null) {
			const parentView = nativeView.getParent();
			if (parentView instanceof android.view.ViewGroup) {
				if (parentView.getChildCount() === 0) {
					parentView.addViewInLayout(nativeView, -1, new org.nativescript.widgets.CommonLayoutParams());
				}

				parentView.removeAllViews();
			}
		}

		return page.nativeViewProtected;
	}

	@profile
	public onSaveInstanceState(fragment: androidx.fragment.app.Fragment, outState: android.os.Bundle, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write(`${fragment}.onSaveInstanceState(${outState})`, Trace.categories.NativeLifecycle);
		}
		superFunc.call(fragment, outState);
	}

	@profile
	public onDestroyView(fragment: org.nativescript.widgets.FragmentBase, superFunc: Function): void {
		try {
			if (Trace.isEnabled()) {
				Trace.write(`${fragment}.onDestroyView()`, Trace.categories.NativeLifecycle);
			}

			const hasRemovingParent = fragment.getRemovingParentFragment();

			if (hasRemovingParent) {
				const nativeFrameView = this.frame.nativeViewProtected;
				if (nativeFrameView) {
					const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(Application.android.context.getResources(), this.backgroundBitmap);
					this.frame._originalBackground = this.frame.backgroundColor || new Color('White');
					nativeFrameView.setBackgroundDrawable(bitmapDrawable);
					this.backgroundBitmap = null;
				}
			}
		} finally {
			superFunc.call(fragment);
		}
	}

	@profile
	public onDestroy(fragment: androidx.fragment.app.Fragment, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write(`${fragment}.onDestroy()`, Trace.categories.NativeLifecycle);
		}

		superFunc.call(fragment);

		const entry = this.entry;
		if (!entry) {
			Trace.error(`${fragment}.onDestroy: entry is null or undefined`);

			return null;
		}

		// [nested frames / fragments] see https://github.com/NativeScript/NativeScript/issues/6629
		// retaining reference to a destroyed fragment here somehow causes a cryptic
		// "IllegalStateException: Failure saving state: active fragment has cleared index: -1"
		// in a specific mixed parent / nested frame navigation scenario
		entry.fragment = null;

		const page = entry.resolvedPage;
		if (!page) {
			// todo: check why this happens when using shared element transition!!!
			// commented out the Trace.error to prevent a crash (the app will still work interestingly)
			console.log(`${fragment}.onDestroy: entry has no resolvedPage`);
			// Trace.error(`${fragment}.onDestroy: entry has no resolvedPage`);

			return null;
		}
	}

	@profile
	public onPause(fragment: org.nativescript.widgets.FragmentBase, superFunc: Function): void {
		try {
			// Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
			// TODO: Consider removing it when update to androidx.fragment:1.2.0
			const hasRemovingParent = fragment.getRemovingParentFragment();

			if (hasRemovingParent) {
				this.backgroundBitmap = this.loadBitmapFromView(this.frame.nativeViewProtected);
			}
		} finally {
			superFunc.call(fragment);
		}
	}

	@profile
	public onResume(fragment: org.nativescript.widgets.FragmentBase, superFunc: Function): void {
		const frame = this.entry.resolvedPage.frame;
		// on some cases during the first navigation on nested frames the animation doesn't trigger
		// we depend on the animation (even None animation) to set the entry as the current entry
		// animation should start between start and resume, so if we have an executing navigation here it probably means the animation was skipped
		// so we manually set the entry
		// also, to be compatible with fragments 1.2.x we need this setTimeout as animations haven't run on onResume yet
		const weakRef = new WeakRef(this);
		setTimeout(() => {
			const owner = weakRef.get();
			if (!owner) {
				return;
			}
			if (frame._executingContext && !(<any>owner.entry).isAnimationRunning) {
				frame.setCurrent(owner.entry, frame._executingContext.navigationType);
			}
		}, 0);

		superFunc.call(fragment);
	}

	@profile
	public onStop(fragment: androidx.fragment.app.Fragment, superFunc: Function): void {
		superFunc.call(fragment);
	}

	@profile
	public toStringOverride(fragment: androidx.fragment.app.Fragment, superFunc: Function): string {
		const entry = this.entry;
		if (entry) {
			return `${entry.fragmentTag}<${entry.resolvedPage}>`;
		} else {
			return 'NO ENTRY, ' + superFunc.call(fragment);
		}
	}

	private loadBitmapFromView(view: android.view.View): android.graphics.Bitmap {
		// Don't try to create bitmaps with no dimensions as this causes a crash
		// This might happen when showing and closing dialogs fast.
		if (!(view && view.getWidth() > 0 && view.getHeight() > 0)) {
			return undefined;
		}

		// Another way to get view bitmap. Test performance vs setDrawingCacheEnabled
		// const width = view.getWidth();
		// const height = view.getHeight();
		// const bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
		// const canvas = new android.graphics.Canvas(bitmap);
		// view.layout(0, 0, width, height);
		// view.draw(canvas);

		// view.setDrawingCacheEnabled(true);
		// const drawCache = view.getDrawingCache();
		// const bitmap = android.graphics.Bitmap.createBitmap(drawCache);
		// view.setDrawingCacheEnabled(false);
		return org.nativescript.widgets.Utils.getBitmapFromView(view);
	}
}

function findPageForFragment(fragment: androidx.fragment.app.Fragment, frame: Frame) {
	const fragmentTag = fragment.getTag();
	if (Trace.isEnabled()) {
		Trace.write(`Finding page for ${fragmentTag}.`, Trace.categories.NativeLifecycle);
	}

	let entry: BackstackEntry;
	const current = frame._currentEntry;
	const executingContext = frame._executingContext;
	if (current && current.fragmentTag === fragmentTag) {
		entry = current;
	} else if (executingContext && executingContext.entry && executingContext.entry.fragmentTag === fragmentTag) {
		entry = executingContext.entry;
	}

	let page: Page;
	if (entry) {
		entry.recreated = true;
		page = entry.resolvedPage;
	}

	if (page) {
		const callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
		callbacks.frame = frame;
		callbacks.entry = entry;
		entry.fragment = fragment;
		_updateTransitions(entry);
	} else {
		throw new Error(`Could not find a page for ${fragmentTag}.`);
	}
}
