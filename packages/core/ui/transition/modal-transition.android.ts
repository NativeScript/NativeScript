import { BackstackEntry } from '../frame';
import { Transition } from '.';
import { SharedTransition } from './shared-transition';

export class ModalTransition extends Transition {
	createAndroidAnimator(transitionType: string) {
		console.log('HELLO ModalTransition', transitionType);
	}

	test(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: BackstackEntry, newEntry: BackstackEntry) {
		console.log('HELLO ModalTransition', fragmentTransaction);

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
