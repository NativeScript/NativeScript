import type { View } from '../core/view';
import { ViewBase } from '../core/view-base';
import { BackstackEntry } from '../frame';
import { isNumber } from '../../utils/types';
import { FadeTransition } from './fade-transition';
import { SharedTransition, SharedTransitionAnimationType } from './shared-transition';
import { ImageSource } from '../../image-source';
import { ContentView } from '../content-view';
import { GridLayout } from '../layouts/grid-layout';
import { ad } from '../../utils';
// import { Image } from '../image';

@NativeClass
class SnapshotViewGroup extends android.view.ViewGroup {
	constructor(context: android.content.Context) {
		super(context);
		return global.__native(this);
	}
	public onMeasure(): void {
		this.setMeasuredDimension(0, 0);
	}
	public onLayout(): void {
		//
	}
}
class ContentViewSnapshot extends ContentView {
	createNativeView() {
		return new SnapshotViewGroup(this._context);
	}
}

@NativeClass
class CustomSpringInterpolator extends android.view.animation.AnticipateOvershootInterpolator {
	getInterpolation(input: number) {
		// Note: we speed up the interpolation by 10% to fix the issue with the transition not being finished
		// and the views shifting from their intended final position...
		// this is really just a workaround and should be fixed properly once we
		// can figure out the root cause of the issue.
		const res = super.getInterpolation(input) * 1.1;

		if (res > 1) {
			return float(1);
		}

		return float(res);
	}
}

@NativeClass
class CustomLinearInterpolator extends android.view.animation.LinearInterpolator {
	getInterpolation(input: number) {
		// Note: we speed up the interpolation by 10% to fix the issue with the transition not being finished
		// and the views shifting from their intended final position...
		// this is really just a workaround and should be fixed properly once we
		// can figure out the root cause of the issue.
		const res = super.getInterpolation(input) * 1.1;

		if (res > 1) {
			return float(1);
		}

		return float(res);
	}
}

function setTransitionName(view: ViewBase) {
	if (!view?.sharedTransitionTag) {
		return;
	}
	try {
		androidx.core.view.ViewCompat.setTransitionName(view.nativeView, view.sharedTransitionTag);
	} catch (err) {
		// ignore
	}
}

export class PageTransition extends FadeTransition {
	constructor(duration?: number, curve?: any) {
		// disable custom curves until we can fix the issue with the animation not completing
		if (curve) {
			console.warn('PageTransition does not support custom curves at the moment. The passed in curve will be ignored.');
		}
		super(duration);
	}

	androidFragmentTransactionCallback(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: BackstackEntry, newEntry: BackstackEntry) {
		const fromPage = currentEntry.resolvedPage;
		const toPage = newEntry.resolvedPage;
		const newFragment: androidx.fragment.app.Fragment = newEntry.fragment;
		const state = SharedTransition.getState(this.id);
		const pageEnd = state.pageEnd;

		const { sharedElements, presented, presenting } = SharedTransition.getSharedElements(fromPage, toPage);
		const sharedElementTags = sharedElements.map((v) => v.sharedTransitionTag);
		if (SharedTransition.DEBUG) {
			console.log(`  Page: ${state.activeType === SharedTransitionAnimationType.present ? 'Present' : 'Dismiss'}`);
			console.log(`1. Found sharedTransitionTags to animate:`, sharedElementTags);
		}

		// Note: we can enhance android more over time with element targeting across different screens
		// const pageStart = state.pageStart;
		// const pageEndIndependentTags = Object.keys(pageEnd?.sharedTransitionTags || {});
		// console.log('pageEndIndependentTags:', pageEndIndependentTags);
		// for (const tag of pageEndIndependentTags) {
		// 	// only consider start when there's a matching end
		// 	const pageStartIndependentProps = pageStart?.sharedTransitionTags[tag];
		// 	if (pageStartIndependentProps) {
		// 		console.log('pageStartIndependentProps:', tag, pageStartIndependentProps);
		// 	}
		// 	const pageEndIndependentProps = pageEnd?.sharedTransitionTags[tag];
		// 	let independentView = presenting.find((v) => v.sharedTransitionTag === tag);
		// 	let isPresented = false;
		// 	if (!independentView) {
		// 		independentView = presented.find((v) => v.sharedTransitionTag === tag);
		// 		if (!independentView) {
		// 			break;
		// 		}
		// 		isPresented = true;
		// 	}
		// 	if (independentView) {
		// 		console.log('independentView:', independentView);
		// 		const imageSource = renderToImageSource(independentView);
		// 		const image = new Image();
		// 		image.src = imageSource;
		// 		const { hostView } = loadViewInBackground(image);
		// 		(<any>fromPage).addChild(hostView);
		// 		independentView.opacity = 0;
		// 	}
		// }

		toPage.once('loaded', () => {
			presented.filter((v) => sharedElementTags.includes(v.sharedTransitionTag)).forEach(setTransitionName);
			newFragment.startPostponedEnterTransition();
		});

		sharedElements.forEach((v) => {
			setTransitionName(v);
			fragmentTransaction.addSharedElement(v.nativeView, v.sharedTransitionTag);
		});

		fragmentTransaction.setReorderingAllowed(true);

		let customDuration = -1;
		if (state.activeType === SharedTransitionAnimationType.present && isNumber(pageEnd?.duration)) {
			customDuration = pageEnd.duration;
		} else if (isNumber(state.pageReturn?.duration)) {
			customDuration = state.pageReturn.duration;
		}

		const transitionSet = new androidx.transition.TransitionSet();
		transitionSet.setDuration(customDuration || this.getDuration());
		transitionSet.addTransition(new androidx.transition.ChangeBounds());
		transitionSet.addTransition(new androidx.transition.ChangeTransform());

		if (customDuration) {
			// duration always overrides default spring
			transitionSet.setInterpolator(new CustomLinearInterpolator());
		} else {
			transitionSet.setInterpolator(new CustomSpringInterpolator());
		}

		// postpone enter until we call "loaded" on the new page
		newFragment.postponeEnterTransition();
		newFragment.setSharedElementEnterTransition(transitionSet);
		newFragment.setSharedElementReturnTransition(transitionSet);
	}
}

function renderToImageSource(hostView: View): ImageSource {
	const bitmap = android.graphics.Bitmap.createBitmap(hostView.android.getWidth(), hostView.android.getHeight(), android.graphics.Bitmap.Config.ARGB_8888);
	const canvas = new android.graphics.Canvas(bitmap);
	// ensure we start with a blank transparent canvas
	canvas.drawARGB(0, 0, 0, 0);
	hostView.android.draw(canvas);
	return new ImageSource(bitmap);
}

function loadViewInBackground(view: View) {
	const hiddenHost = new ContentViewSnapshot();
	const hostView = new GridLayout(); // use a host view to ensure margins are respected
	hiddenHost.content = hostView;
	hiddenHost.visibility = 'collapse';
	hostView.addChild(view);
	hiddenHost._setupAsRootView(ad.getApplicationContext());
	hiddenHost.callLoaded();

	ad.getCurrentActivity().addContentView(hiddenHost.android, new android.view.ViewGroup.LayoutParams(0, 0));

	return {
		hiddenHost,
		hostView,
	};
}
