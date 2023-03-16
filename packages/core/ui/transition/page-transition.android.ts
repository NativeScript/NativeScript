import { BackstackEntry } from '../frame';
import { SharedTransition } from './shared-transition';
// import { SlideTransition } from './slide-transition';
import { FadeTransition } from './fade-transition';

export class PageTransition extends FadeTransition {
	//SlideTransition

	constructor() {
		super(500);
		// when extending slide:
		// super('left', 500);
	}

	// when extending slide:
	// createAndroidAnimator(transitionType: string) {
	// 	// console.log('HELLO PageTransition', transitionType);
	// 	if (
	// 		[
	// 			Transition.AndroidTransitionType.enter,
	// 			Transition.AndroidTransitionType.popEnter,
	// 			Transition.AndroidTransitionType.popExit,
	// 			// When extending SlideTransition, disable exit
	//			// This causes back navigation shared elements position to be off
	// 			// Transition.AndroidTransitionType.exit,
	// 		].includes(transitionType)
	// 	) {
	// 		return super.createAndroidAnimator(transitionType);
	// 	}
	// }

	androidFragmentTransactionCallback(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: BackstackEntry, newEntry: BackstackEntry) {
		const fromPage = currentEntry.resolvedPage;
		const toPage = newEntry.resolvedPage;

		const currentFragment: androidx.fragment.app.Fragment = currentEntry ? currentEntry.fragment : null;
		const newFragment: androidx.fragment.app.Fragment = newEntry.fragment;

		const { sharedElements, presented, presenting } = SharedTransition.getSharedElements(fromPage, toPage);
		// fragmentTransaction.addSharedElement();

		toPage.on('loaded', () => {
			presented.forEach((v) => {
				console.log({
					presentedSharedElements: true,
					nativeView: !!v.nativeView,
					sharedTransitionTag: v.sharedTransitionTag,
				});
				androidx.core.view.ViewCompat.setTransitionName(v.nativeView, v.sharedTransitionTag);
			});

			// setTimeout(() => {
			newFragment.startPostponedEnterTransition();
			// }, 2000)
		});

		presenting.forEach((v) => {
			console.log({
				presentingSharedElements: true,
				nativeView: !!v.nativeView,
				sharedTransitionTag: v.sharedTransitionTag,
			});
			androidx.core.view.ViewCompat.setTransitionName(v.nativeView, v.sharedTransitionTag);
		});
		presenting.forEach((v) => {
			fragmentTransaction.addSharedElement(v.nativeView, v.sharedTransitionTag);
		});

		fragmentTransaction.setReorderingAllowed(true);

		const transitionSet = new androidx.transition.TransitionSet();
		transitionSet.setDuration(500);
		transitionSet.addTransition(new androidx.transition.ChangeBounds());
		transitionSet.addTransition(new androidx.transition.ChangeTransform());
		// transitionSet.addTransition(new androidx.transition.ChangeClipBounds());

		// postpone enter until we call "loaded" on the new page
		newFragment.postponeEnterTransition();

		newFragment.setSharedElementEnterTransition(transitionSet);
		newFragment.setSharedElementReturnTransition(transitionSet);

		// newFragment.setSharedElementReturnTransition(new androidx.transition.ChangeBounds());
		// currentFragment.setSharedElementEnterTransition(new androidx.transition.ChangeBounds());
		// currentFragment.setSharedElementReturnTransition(new androidx.transition.ChangeBounds());
	}
}
