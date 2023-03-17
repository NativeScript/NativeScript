import { ViewBase } from '../core/view-base';
import { BackstackEntry } from '../frame';
import { FadeTransition } from './fade-transition';
import { SharedTransition } from './shared-transition';

@NativeClass
class CustomInterpolator extends android.view.animation.AnticipateOvershootInterpolator {
	getInterpolation(input: number) {
		// HACK: we speed up the interpolation by 10% to fix the issue with the transition not being finished
		// and the views shifting from their intended final position...
		// this is really just a hack and should be fixed properly once we
		// can figure out the root cause of the issue.
		const res = super.getInterpolation(input) * 1.1;

		if (res > 1) {
			return float(1);
		}

		return float(res);
	}
}

function setTransitionName(view: ViewBase) {
	if (!view.sharedTransitionTag) {
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

		const { presented, presenting } = SharedTransition.getSharedElements(fromPage, toPage);

		toPage.once('loaded', () => {
			presented.forEach(setTransitionName);
			newFragment.startPostponedEnterTransition();
		});

		presenting.forEach((v) => {
			setTransitionName(v);
			fragmentTransaction.addSharedElement(v.nativeView, v.sharedTransitionTag);
		});

		fragmentTransaction.setReorderingAllowed(true);

		const transitionSet = new androidx.transition.TransitionSet();
		transitionSet.setDuration(this.getDuration());
		transitionSet.addTransition(new androidx.transition.ChangeBounds());
		transitionSet.addTransition(new androidx.transition.ChangeTransform());
		transitionSet.setInterpolator(new CustomInterpolator());

		// postpone enter until we call "loaded" on the new page
		newFragment.postponeEnterTransition();
		newFragment.setSharedElementEnterTransition(transitionSet);
		newFragment.setSharedElementReturnTransition(transitionSet);
	}
}
