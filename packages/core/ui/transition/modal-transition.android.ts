import { BackstackEntry } from '../frame';
import { View } from '../core/view';
import { Transition } from '.';
import { querySelectorAll } from '../core/view-base';

export class ModalTransition extends Transition {
	createAndroidAnimator(transitionType: string) {
		console.log('HELLO', transitionType);
	}

	test(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: BackstackEntry, newEntry: BackstackEntry) {
		console.log('HELLO', fragmentTransaction);

		const fromPage = currentEntry.resolvedPage;
		const toPage = newEntry.resolvedPage;

		const currentFragment: androidx.fragment.app.Fragment = currentEntry ? currentEntry.fragment : null;
		const newFragment: androidx.fragment.app.Fragment = newEntry.fragment;

		// 1. Presented view: gather all sharedTransitionTag views
		const presentedSharedElements = <Array<View>>querySelectorAll(toPage, 'sharedTransitionTag');
		// console.log('presented sharedTransitionTag total:', presentedSharedElements.length);

		// 2. Presenting view: gather all sharedTransitionTag views
		const presentingSharedElements = <Array<View>>querySelectorAll(fromPage, 'sharedTransitionTag');
		// console.log('presenting sharedTransitionTag total:', presentingSharedElements.length);

		// 3. only handle sharedTransitionTag on presenting which match presented
		const presentedTags = presentedSharedElements.map((v) => v.sharedTransitionTag);
		const presentingViewsToHandle = presentingSharedElements.filter((v) => presentedTags.includes(v.sharedTransitionTag));
		// fragmentTransaction.addSharedElement();

		toPage.on('loaded', () => {
			presentedSharedElements.forEach((v) => {
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

		presentingSharedElements.forEach((v) => {
			console.log({
				presentingSharedElements: true,
				nativeView: !!v.nativeView,
				sharedTransitionTag: v.sharedTransitionTag,
			});
			androidx.core.view.ViewCompat.setTransitionName(v.nativeView, v.sharedTransitionTag);
		});
		presentingSharedElements.forEach((v) => {
			fragmentTransaction.addSharedElement(v.nativeView, v.sharedTransitionTag);
		});

		fragmentTransaction.setReorderingAllowed(true);

		const transitionSet = new androidx.transition.TransitionSet();
		transitionSet.setDuration(2000);
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
