import type { View } from '../core/view';
import { ViewBase } from '../core/view-base';
import { BackstackEntry } from '../frame';
import { isNumber } from '../../utils/types';
import { Transition } from '.';
import { getRectFromProps, SharedTransition, SharedTransitionAnimationType, SharedTransitionEventData } from './shared-transition';
import { ImageSource } from '../../image-source';
import { ContentView } from '../content-view';
import { GridLayout } from '../layouts/grid-layout';
import { Screen } from '../../platform';
import { ExpandedEntry } from '../frame/fragment.transitions.android';
import { android as AndroidUtils } from '../../utils/native-helper';
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

export class PageTransition extends Transition {
	constructor(
		duration?: number,
		curve?: any,
		private pageLoadedTimeout: number = 0,
	) {
		// disable custom curves until we can fix the issue with the animation not completing
		if (curve) {
			console.warn('PageTransition does not support custom curves at the moment. The passed in curve will be ignored.');
		}
		if (typeof duration !== 'number') {
			duration = 500;
		}
		super(duration);
	}

	createAndroidAnimator(transitionType: string) {
		const state = SharedTransition.getState(this.id);
		const pageStart = state.pageStart;
		const startFrame = getRectFromProps(pageStart, {
			x: 0,
			y: 0,
			width: Screen.mainScreen.widthPixels,
			height: Screen.mainScreen.heightPixels,
		});
		const pageEnd = state.pageEnd;
		const endFrame = getRectFromProps(pageEnd);
		const pageReturn = state.pageReturn;
		const returnFrame = getRectFromProps(pageReturn);

		let customDuration = -1;
		if (state.activeType === SharedTransitionAnimationType.present && isNumber(pageEnd?.duration)) {
			customDuration = pageEnd.duration;
		} else if (isNumber(state.pageReturn?.duration)) {
			customDuration = state.pageReturn.duration;
		}

		const animationSet = new android.animation.AnimatorSet();
		animationSet.setDuration(customDuration > -1 ? customDuration : this.getDuration());

		const alphaValues = Array.create('float', 2);
		const translationXValues = Array.create('float', 2);
		const translationYValues = Array.create('float', 2);
		switch (transitionType) {
			case Transition.AndroidTransitionType.enter:
				// incoming page (to)
				alphaValues[0] = isNumber(pageStart?.opacity) ? pageStart?.opacity : 0;
				alphaValues[1] = isNumber(pageEnd?.opacity) ? pageEnd?.opacity : 1;
				translationYValues[0] = startFrame.y;
				translationYValues[1] = endFrame.y;
				translationXValues[0] = startFrame.x;
				translationXValues[1] = endFrame.x;
				break;
			case Transition.AndroidTransitionType.exit:
				// current page (from)
				alphaValues[0] = 1;
				alphaValues[1] = 0;
				translationYValues[0] = 0;
				translationYValues[1] = 0;
				break;
			case Transition.AndroidTransitionType.popEnter:
				// current page (returning to)
				alphaValues[0] = 0;
				alphaValues[1] = 1;
				break;
			case Transition.AndroidTransitionType.popExit:
				// removing page (to)
				alphaValues[0] = isNumber(pageEnd?.opacity) ? pageEnd?.opacity : 1;
				alphaValues[1] = isNumber(pageStart?.opacity) ? pageStart?.opacity : 0;
				translationYValues[0] = endFrame.y;
				translationYValues[1] = startFrame.y;
				translationXValues[0] = endFrame.x;
				translationXValues[1] = startFrame.x;
				break;
		}
		const properties = {
			alpha: alphaValues,
			translationX: translationXValues,
			translationY: translationYValues,
		};

		const animations = new java.util.HashSet<any>();
		for (const prop in properties) {
			// console.log(prop, ' ', properties[prop][1]);
			const animator = android.animation.ObjectAnimator.ofFloat(null, prop, properties[prop]);
			if (customDuration) {
				// duration always overrides default spring
				animator.setInterpolator(new CustomLinearInterpolator());
			} else {
				animator.setInterpolator(new CustomSpringInterpolator());
			}
			animations.add(animator);
		}

		animationSet.playTogether(animations);

		return animationSet;
	}

	androidFragmentTransactionCallback(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: ExpandedEntry, newEntry: BackstackEntry) {
		const fromPage = currentEntry.resolvedPage;
		const toPage = newEntry.resolvedPage;
		const newFragment: androidx.fragment.app.Fragment = newEntry.fragment;
		const state = SharedTransition.getState(this.id);
		if (!state) {
			// when navigating transition is set on the currentEntry but never cleaned up
			// which means that on a next navigation forward (without transition) and back
			// we will go here with an empty state!
			currentEntry.transition = null;
			return;
		}

		const pageEnd = state.pageEnd;

		//we can't look for presented right now as the toPage might not be loaded
		// and thus some views like ListView/Pager... might not have loaded their "children"
		// presented will be handled in loaded event of toPage
		const { presenting } = SharedTransition.getSharedElements(fromPage, toPage);

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
		const onPageLoaded = () => {
			// add a timeout so that Views like ListView / CollectionView can have their children instantiated
			setTimeout(() => {
				const { presented } = SharedTransition.getSharedElements(fromPage, toPage);
				// const sharedElementTags = sharedElements.map((v) => v.sharedTransitionTag);
				presented.forEach(setTransitionName);
				newFragment.startPostponedEnterTransition();
			}, this.pageLoadedTimeout);
		};

		fragmentTransaction.setReorderingAllowed(true);

		let customDuration = -1;
		if (state.activeType === SharedTransitionAnimationType.present && isNumber(pageEnd?.duration)) {
			customDuration = pageEnd.duration;
		} else if (isNumber(state.pageReturn?.duration)) {
			customDuration = state.pageReturn.duration;
		}

		const transitionSet = new androidx.transition.TransitionSet();
		transitionSet.setDuration(customDuration > -1 ? customDuration : this.getDuration());
		transitionSet.addTransition(new androidx.transition.ChangeBounds());
		transitionSet.addTransition(new androidx.transition.ChangeTransform());
		transitionSet.setOrdering(androidx.transition.TransitionSet.ORDERING_TOGETHER);

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

		// Guard against duplicate shared element names being added to the same transaction
		const addedSharedElementNames = new Set();
		presenting.forEach((v) => {
			const name = v?.sharedTransitionTag;
			const nativeView = v?.nativeView;
			if (!name || !nativeView || addedSharedElementNames.has(name)) {
				// prevent duplicates or invalid items
				return;
			}
			setTransitionName(v);
			try {
				fragmentTransaction.addSharedElement(nativeView, name);
				addedSharedElementNames.add(name);
			} catch (err) {
				// ignore duplicates or issues adding shared element to avoid crashing
			}
		});
		if (toPage.isLoaded) {
			onPageLoaded();
		} else {
			toPage.once('loaded', onPageLoaded);
		}
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
	hiddenHost._setupAsRootView(AndroidUtils.getApplicationContext());
	hiddenHost.callLoaded();

	AndroidUtils.getCurrentActivity().addContentView(hiddenHost.android, new android.view.ViewGroup.LayoutParams(0, 0));

	return {
		hiddenHost,
		hostView,
	};
}
