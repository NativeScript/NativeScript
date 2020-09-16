// Definitions.
import { NavigationType } from './frame-common';
import { NavigationTransition, BackstackEntry } from '.';

// Types.
import { Transition, AndroidTransitionType } from '../transition';
import { FlipTransition } from '../transition/flip-transition';
import { _resolveAnimationCurve } from '../animation';
import lazy from '../../utils/lazy';
import { Trace } from '../../trace';

interface TransitionListener {
	new (entry: ExpandedEntry, transition: androidx.transition.Transition): ExpandedTransitionListener;
}

const defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

const animFadeIn = 17432576; // android.R.anim.fade_in
const animFadeOut = 17432577; // android.R.anim.fade_out

export const waitingQueue = new Map<number, Set<ExpandedEntry>>();
export const completedEntries = new Map<number, ExpandedEntry>();

let TransitionListener: TransitionListener;
let AnimationListener: android.animation.Animator.AnimatorListener;

interface ExpandedTransitionListener extends androidx.transition.Transition.TransitionListener {
	entry: ExpandedEntry;
	transition: androidx.transition.Transition;
}

interface ExpandedAnimator extends android.animation.Animator {
	entry: ExpandedEntry;
	backEntry?: BackstackEntry;
	transitionType?: string;
}

export interface ExpandedEntry extends BackstackEntry {
	enterTransitionListener: ExpandedTransitionListener;
	exitTransitionListener: ExpandedTransitionListener;
	reenterTransitionListener: ExpandedTransitionListener;
	returnTransitionListener: ExpandedTransitionListener;

	enterAnimator: ExpandedAnimator;
	exitAnimator: ExpandedAnimator;
	popEnterAnimator: ExpandedAnimator;
	popExitAnimator: ExpandedAnimator;

	transition: Transition;
	transitionName: string;
	frameId: number;

	isNestedDefaultTransition: boolean;
}

export function _setAndroidFragmentTransitions(animated: boolean, navigationTransition: NavigationTransition, currentEntry: ExpandedEntry, newEntry: ExpandedEntry, frameId: number, fragmentTransaction: androidx.fragment.app.FragmentTransaction, isNestedDefaultTransition?: boolean): void {
	const currentFragment: androidx.fragment.app.Fragment = currentEntry ? currentEntry.fragment : null;
	const newFragment: androidx.fragment.app.Fragment = newEntry.fragment;
	const entries = waitingQueue.get(frameId);
	if (entries && entries.size > 0) {
		throw new Error('Calling navigation before previous navigation finish.');
	}

	allowTransitionOverlap(currentFragment);
	allowTransitionOverlap(newFragment);

	let name = '';
	let transition: Transition;

	if (navigationTransition) {
		transition = navigationTransition.instance;
		name = navigationTransition.name ? navigationTransition.name.toLowerCase() : '';
	}

	if (!animated) {
		name = 'none';
	} else if (transition) {
		name = 'custom';
	} else if (name.indexOf('slide') !== 0 && name !== 'fade' && name.indexOf('flip') !== 0 && name.indexOf('explode') !== 0) {
		// If we are given name that doesn't match any of ours - fallback to default.
		name = 'default';
	}

	let currentFragmentNeedsDifferentAnimation = false;
	if (currentEntry) {
		_updateTransitions(currentEntry);
		if (currentEntry.transitionName !== name || currentEntry.transition !== transition || isNestedDefaultTransition) {
			clearExitAndReenterTransitions(currentEntry, true);
			currentFragmentNeedsDifferentAnimation = true;
		}
	}

	if (name === 'none') {
		const noTransition = new NoTransition(0, null);

		// Setup empty/immediate animator when transitioning to nested frame for first time.
		// Also setup empty/immediate transition to be executed when navigating back to this page.
		// TODO: Consider removing empty/immediate animator when migrating to official androidx.fragment.app.Fragment:1.2.
		if (isNestedDefaultTransition) {
			fragmentTransaction.setCustomAnimations(animFadeIn, animFadeOut);
			setupAllAnimation(newEntry, noTransition);
			setupNewFragmentCustomTransition({ duration: 0, curve: null }, newEntry, noTransition);
		} else {
			setupNewFragmentCustomTransition({ duration: 0, curve: null }, newEntry, noTransition);
		}

		newEntry.isNestedDefaultTransition = isNestedDefaultTransition;

		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentCustomTransition({ duration: 0, curve: null }, currentEntry, noTransition);
		}
	} else if (name === 'custom') {
		setupNewFragmentCustomTransition(
			{
				duration: transition.getDuration(),
				curve: transition.getCurve(),
			},
			newEntry,
			transition
		);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentCustomTransition(
				{
					duration: transition.getDuration(),
					curve: transition.getCurve(),
				},
				currentEntry,
				transition
			);
		}
	} else if (name === 'default') {
		setupNewFragmentFadeTransition({ duration: 150, curve: null }, newEntry);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentFadeTransition({ duration: 150, curve: null }, currentEntry);
		}
	} else if (name.indexOf('slide') === 0) {
		setupNewFragmentSlideTransition(navigationTransition, newEntry, name);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentSlideTransition(navigationTransition, currentEntry, name);
		}
	} else if (name === 'fade') {
		setupNewFragmentFadeTransition(navigationTransition, newEntry);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentFadeTransition(navigationTransition, currentEntry);
		}
	} else if (name === 'explode') {
		setupNewFragmentExplodeTransition(navigationTransition, newEntry);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentExplodeTransition(navigationTransition, currentEntry);
		}
	} else if (name.indexOf('flip') === 0) {
		const direction = name.substr('flip'.length) || 'right'; //Extract the direction from the string
		const flipTransition = new FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);

		setupNewFragmentCustomTransition(navigationTransition, newEntry, flipTransition);
		if (currentFragmentNeedsDifferentAnimation) {
			setupCurrentFragmentCustomTransition(navigationTransition, currentEntry, flipTransition);
		}
	}

	newEntry.transitionName = name;

	if (currentEntry) {
		currentEntry.transitionName = name;
		if (name === 'custom') {
			currentEntry.transition = transition;
		}
	}

	printTransitions(currentEntry);
	printTransitions(newEntry);
}

function setupAllAnimation(entry: ExpandedEntry, transition: Transition): void {
	setupExitAndPopEnterAnimation(entry, transition);
	const listener = getAnimationListener();

	// setupAllAnimation is called only for new fragments so we don't
	// need to clearAnimationListener for enter & popExit animators.
	const enterAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.enter);
	enterAnimator.transitionType = AndroidTransitionType.enter;
	enterAnimator.entry = entry;
	enterAnimator.addListener(listener);
	entry.enterAnimator = enterAnimator;

	const popExitAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.popExit);
	popExitAnimator.transitionType = AndroidTransitionType.popExit;
	popExitAnimator.entry = entry;
	popExitAnimator.addListener(listener);
	entry.popExitAnimator = popExitAnimator;
}

function setupExitAndPopEnterAnimation(entry: ExpandedEntry, transition: Transition): void {
	const listener = getAnimationListener();

	// remove previous listener if we are changing the animator.
	clearAnimationListener(entry.exitAnimator, listener);
	clearAnimationListener(entry.popEnterAnimator, listener);

	const exitAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.exit);
	exitAnimator.transitionType = AndroidTransitionType.exit;
	exitAnimator.entry = entry;
	exitAnimator.addListener(listener);
	entry.exitAnimator = exitAnimator;

	const popEnterAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.popEnter);
	popEnterAnimator.transitionType = AndroidTransitionType.popEnter;
	popEnterAnimator.entry = entry;
	popEnterAnimator.addListener(listener);
	entry.popEnterAnimator = popEnterAnimator;
}

function getAnimationListener(): android.animation.Animator.AnimatorListener {
	if (!AnimationListener) {
		@NativeClass
		@Interfaces([android.animation.Animator.AnimatorListener])
		class AnimationListenerImpl extends java.lang.Object implements android.animation.Animator.AnimatorListener {
			constructor() {
				super();

				return global.__native(this);
			}

			onAnimationStart(animator: ExpandedAnimator): void {
				const entry = animator.entry;
				addToWaitingQueue(entry);
				if (Trace.isEnabled()) {
					Trace.write(`START ${animator.transitionType} for ${entry.fragmentTag}`, Trace.categories.Transition);
				}
			}

			onAnimationRepeat(animator: ExpandedAnimator): void {
				if (Trace.isEnabled()) {
					Trace.write(`REPEAT ${animator.transitionType} for ${animator.entry.fragmentTag}`, Trace.categories.Transition);
				}
			}

			onAnimationEnd(animator: ExpandedAnimator): void {
				if (Trace.isEnabled()) {
					Trace.write(`END ${animator.transitionType} for ${animator.entry.fragmentTag}`, Trace.categories.Transition);
				}
				transitionOrAnimationCompleted(animator.entry, animator.backEntry);
			}

			onAnimationCancel(animator: ExpandedAnimator): void {
				if (Trace.isEnabled()) {
					Trace.write(`CANCEL ${animator.transitionType} for ${animator.entry.fragmentTag}`, Trace.categories.Transition);
				}
			}
		}

		AnimationListener = new AnimationListenerImpl();
	}

	return AnimationListener;
}

function clearAnimationListener(animator: ExpandedAnimator, listener: android.animation.Animator.AnimatorListener): void {
	if (!animator) {
		return;
	}

	animator.removeListener(listener);

	if (animator.entry && Trace.isEnabled()) {
		const entry = animator.entry;
		Trace.write(`Clear ${animator.transitionType} - ${entry.transition} for ${entry.fragmentTag}`, Trace.categories.Transition);
	}

	animator.entry = null;
}

export function _getAnimatedEntries(frameId: number): Set<BackstackEntry> {
	return waitingQueue.get(frameId);
}

export function _updateTransitions(entry: ExpandedEntry): void {
	const fragment = entry.fragment;
	const enterTransitionListener = entry.enterTransitionListener;
	if (enterTransitionListener && fragment) {
		fragment.setEnterTransition(enterTransitionListener.transition);
	}

	const exitTransitionListener = entry.exitTransitionListener;
	if (exitTransitionListener && fragment) {
		fragment.setExitTransition(exitTransitionListener.transition);
	}

	const reenterTransitionListener = entry.reenterTransitionListener;
	if (reenterTransitionListener && fragment) {
		fragment.setReenterTransition(reenterTransitionListener.transition);
	}

	const returnTransitionListener = entry.returnTransitionListener;
	if (returnTransitionListener && fragment) {
		fragment.setReturnTransition(returnTransitionListener.transition);
	}
}

export function _reverseTransitions(previousEntry: ExpandedEntry, currentEntry: ExpandedEntry): boolean {
	const previousFragment = previousEntry.fragment;
	const currentFragment = currentEntry.fragment;
	let transitionUsed = false;

	const returnTransitionListener = currentEntry.returnTransitionListener;
	if (returnTransitionListener) {
		transitionUsed = true;
		currentFragment.setExitTransition(returnTransitionListener.transition);
	} else {
		currentFragment.setExitTransition(null);
	}

	const reenterTransitionListener = previousEntry.reenterTransitionListener;
	if (reenterTransitionListener) {
		transitionUsed = true;
		previousFragment.setEnterTransition(reenterTransitionListener.transition);
	} else {
		previousFragment.setEnterTransition(null);
	}

	return transitionUsed;
}

// Transition listener can't be static because
// android is cloning transitions and we can't expand them :(
function getTransitionListener(entry: ExpandedEntry, transition: androidx.transition.Transition): ExpandedTransitionListener {
	if (!TransitionListener) {
		@NativeClass
		@Interfaces([(<any>androidx).transition.Transition.TransitionListener])
		class TransitionListenerImpl extends java.lang.Object implements androidx.transition.Transition.TransitionListener {
			public backEntry?: BackstackEntry;
			constructor(public entry: ExpandedEntry, public transition: androidx.transition.Transition) {
				super();

				return global.__native(this);
			}

			public onTransitionStart(transition: androidx.transition.Transition): void {
				const entry = this.entry;
				addToWaitingQueue(entry);
				if (Trace.isEnabled()) {
					Trace.write(`START ${toShortString(transition)} transition for ${entry.fragmentTag}`, Trace.categories.Transition);
				}
			}

			onTransitionEnd(transition: androidx.transition.Transition): void {
				const entry = this.entry;
				if (Trace.isEnabled()) {
					Trace.write(`END ${toShortString(transition)} transition for ${entry.fragmentTag}`, Trace.categories.Transition);
				}
				transitionOrAnimationCompleted(entry, this.backEntry);
			}

			onTransitionResume(transition: androidx.transition.Transition): void {
				if (Trace.isEnabled()) {
					const fragment = this.entry.fragmentTag;
					Trace.write(`RESUME ${toShortString(transition)} transition for ${fragment}`, Trace.categories.Transition);
				}
			}

			onTransitionPause(transition: androidx.transition.Transition): void {
				if (Trace.isEnabled()) {
					Trace.write(`PAUSE ${toShortString(transition)} transition for ${this.entry.fragmentTag}`, Trace.categories.Transition);
				}
			}

			onTransitionCancel(transition: androidx.transition.Transition): void {
				if (Trace.isEnabled()) {
					Trace.write(`CANCEL ${toShortString(transition)} transition for ${this.entry.fragmentTag}`, Trace.categories.Transition);
				}
			}
		}

		TransitionListener = TransitionListenerImpl;
	}

	return new TransitionListener(entry, transition);
}

function addToWaitingQueue(entry: ExpandedEntry): void {
	const frameId = entry.frameId;
	let entries = waitingQueue.get(frameId);
	if (!entries) {
		entries = new Set<ExpandedEntry>();
		waitingQueue.set(frameId, entries);
	}

	entries.add(entry);
}

function clearExitAndReenterTransitions(entry: ExpandedEntry, removeListener: boolean): void {
	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	const exitListener = entry.exitTransitionListener;
	if (exitListener) {
		const exitTransition = fragment.getExitTransition();
		if (exitTransition) {
			if (removeListener) {
				exitTransition.removeListener(exitListener);
			}

			fragment.setExitTransition(null);
			if (Trace.isEnabled()) {
				Trace.write(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment}`, Trace.categories.Transition);
			}
		}

		if (removeListener) {
			entry.exitTransitionListener = null;
		}
	}

	const reenterListener = entry.reenterTransitionListener;
	if (reenterListener) {
		const reenterTransition = fragment.getReenterTransition();
		if (reenterTransition) {
			if (removeListener) {
				reenterTransition.removeListener(reenterListener);
			}

			fragment.setReenterTransition(null);
			if (Trace.isEnabled()) {
				Trace.write(`Cleared Reenter ${reenterTransition.getClass().getSimpleName()} transition for ${fragment}`, Trace.categories.Transition);
			}
		}

		if (removeListener) {
			entry.reenterTransitionListener = null;
		}
	}
}

export function _clearFragment(entry: ExpandedEntry): void {
	clearEntry(entry, false);
}

export function _clearEntry(entry: ExpandedEntry): void {
	clearEntry(entry, true);
}

function clearEntry(entry: ExpandedEntry, removeListener: boolean): void {
	clearExitAndReenterTransitions(entry, removeListener);

	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	const enterListener = entry.enterTransitionListener;
	if (enterListener) {
		const enterTransition = fragment.getEnterTransition();
		if (enterTransition) {
			if (removeListener) {
				enterTransition.removeListener(enterListener);
			}

			fragment.setEnterTransition(null);
			if (Trace.isEnabled()) {
				Trace.write(`Cleared Enter ${enterTransition.getClass().getSimpleName()} transition for ${fragment}`, Trace.categories.Transition);
			}
		}

		if (removeListener) {
			entry.enterTransitionListener = null;
		}
	}

	const returnListener = entry.returnTransitionListener;
	if (returnListener) {
		const returnTransition = fragment.getReturnTransition();
		if (returnTransition) {
			if (removeListener) {
				returnTransition.removeListener(returnListener);
			}

			fragment.setReturnTransition(null);
			if (Trace.isEnabled()) {
				Trace.write(`Cleared Return ${returnTransition.getClass().getSimpleName()} transition for ${fragment}`, Trace.categories.Transition);
			}
		}

		if (removeListener) {
			entry.returnTransitionListener = null;
		}
	}
}

function allowTransitionOverlap(fragment: androidx.fragment.app.Fragment): void {
	if (fragment) {
		fragment.setAllowEnterTransitionOverlap(true);
		fragment.setAllowReturnTransitionOverlap(true);
	}
}

function setEnterTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: androidx.transition.Transition): void {
	setUpNativeTransition(navigationTransition, transition);
	const listener = addNativeTransitionListener(entry, transition);

	// attach listener to JS object so that it will be alive as long as entry.
	entry.enterTransitionListener = listener;
	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	fragment.setEnterTransition(transition);
}

function setExitTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: androidx.transition.Transition): void {
	setUpNativeTransition(navigationTransition, transition);
	const listener = addNativeTransitionListener(entry, transition);

	// attach listener to JS object so that it will be alive as long as entry.
	entry.exitTransitionListener = listener;
	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	fragment.setExitTransition(transition);
}

function setReenterTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: androidx.transition.Transition): void {
	setUpNativeTransition(navigationTransition, transition);
	const listener = addNativeTransitionListener(entry, transition);

	// attach listener to JS object so that it will be alive as long as entry.
	entry.reenterTransitionListener = listener;
	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	fragment.setReenterTransition(transition);
}

function setReturnTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: androidx.transition.Transition): void {
	setUpNativeTransition(navigationTransition, transition);
	const listener = addNativeTransitionListener(entry, transition);

	// attach listener to JS object so that it will be alive as long as entry.
	entry.returnTransitionListener = listener;
	const fragment: androidx.fragment.app.Fragment = entry.fragment;
	fragment.setReturnTransition(transition);
}

function setupNewFragmentSlideTransition(navTransition: NavigationTransition, entry: ExpandedEntry, name: string): void {
	setupCurrentFragmentSlideTransition(navTransition, entry, name);
	const direction = name.substr('slide'.length) || 'left'; //Extract the direction from the string
	switch (direction) {
		case 'left':
			setEnterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.RIGHT));
			setReturnTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.RIGHT));
			break;

		case 'right':
			setEnterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.LEFT));
			setReturnTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.LEFT));
			break;

		case 'top':
			setEnterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.BOTTOM));
			setReturnTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.BOTTOM));
			break;

		case 'bottom':
			setEnterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.TOP));
			setReturnTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.TOP));
			break;
	}
}

function setupCurrentFragmentSlideTransition(navTransition: NavigationTransition, entry: ExpandedEntry, name: string): void {
	const direction = name.substr('slide'.length) || 'left'; //Extract the direction from the string
	switch (direction) {
		case 'left':
			setExitTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.LEFT));
			setReenterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.LEFT));
			break;

		case 'right':
			setExitTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.RIGHT));
			setReenterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.RIGHT));
			break;

		case 'top':
			setExitTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.TOP));
			setReenterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.TOP));
			break;

		case 'bottom':
			setExitTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.BOTTOM));
			setReenterTransition(navTransition, entry, new androidx.transition.Slide(android.view.Gravity.BOTTOM));
			break;
	}
}

function setupCurrentFragmentCustomTransition(navTransition: NavigationTransition, entry: ExpandedEntry, transition: Transition): void {
	const exitAnimator = transition.createAndroidAnimator(AndroidTransitionType.exit);
	const exitTransition = new org.nativescript.widgets.CustomTransition(exitAnimator, transition.constructor.name + AndroidTransitionType.exit.toString());

	setExitTransition(navTransition, entry, exitTransition);

	const reenterAnimator = transition.createAndroidAnimator(AndroidTransitionType.popEnter);
	const reenterTransition = new org.nativescript.widgets.CustomTransition(reenterAnimator, transition.constructor.name + AndroidTransitionType.popEnter.toString());

	setReenterTransition(navTransition, entry, reenterTransition);
}

function setupNewFragmentCustomTransition(navTransition: NavigationTransition, entry: ExpandedEntry, transition: Transition): void {
	setupCurrentFragmentCustomTransition(navTransition, entry, transition);

	const enterAnimator = transition.createAndroidAnimator(AndroidTransitionType.enter);
	const enterTransition = new org.nativescript.widgets.CustomTransition(enterAnimator, transition.constructor.name + AndroidTransitionType.enter.toString());
	setEnterTransition(navTransition, entry, enterTransition);

	const returnAnimator = transition.createAndroidAnimator(AndroidTransitionType.popExit);
	const returnTransition = new org.nativescript.widgets.CustomTransition(returnAnimator, transition.constructor.name + AndroidTransitionType.popExit.toString());
	setReturnTransition(navTransition, entry, returnTransition);
}

function setupNewFragmentFadeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
	setupCurrentFragmentFadeTransition(navTransition, entry);

	const fadeInEnter = new androidx.transition.Fade(androidx.transition.Fade.IN);
	setEnterTransition(navTransition, entry, fadeInEnter);

	const fadeOutReturn = new androidx.transition.Fade(androidx.transition.Fade.OUT);
	setReturnTransition(navTransition, entry, fadeOutReturn);
}

function setupCurrentFragmentFadeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
	const fadeOutExit = new androidx.transition.Fade(androidx.transition.Fade.OUT);
	setExitTransition(navTransition, entry, fadeOutExit);

	// NOTE: There is a bug in Fade transition so we need to set all 4
	// otherwise back navigation will complete immediately (won't run the reverse transition).
	const fadeInReenter = new androidx.transition.Fade(androidx.transition.Fade.IN);
	setReenterTransition(navTransition, entry, fadeInReenter);
}

function setupCurrentFragmentExplodeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
	setExitTransition(navTransition, entry, new androidx.transition.Explode());
	setReenterTransition(navTransition, entry, new androidx.transition.Explode());
}

function setupNewFragmentExplodeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
	setupCurrentFragmentExplodeTransition(navTransition, entry);

	setEnterTransition(navTransition, entry, new androidx.transition.Explode());
	setReturnTransition(navTransition, entry, new androidx.transition.Explode());
}

function setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: androidx.transition.Transition) {
	if (navigationTransition.duration) {
		nativeTransition.setDuration(navigationTransition.duration);
	}

	const interpolator = navigationTransition.curve ? _resolveAnimationCurve(navigationTransition.curve) : defaultInterpolator();
	nativeTransition.setInterpolator(interpolator);
}

export function addNativeTransitionListener(entry: ExpandedEntry, nativeTransition: androidx.transition.Transition): ExpandedTransitionListener {
	const listener = getTransitionListener(entry, nativeTransition);
	nativeTransition.addListener(listener);

	return listener;
}

function transitionOrAnimationCompleted(entry: ExpandedEntry, backEntry: BackstackEntry): void {
	const frameId = entry.frameId;
	const entries = waitingQueue.get(frameId);
	// https://github.com/NativeScript/NativeScript/issues/5759
	// https://github.com/NativeScript/NativeScript/issues/5780
	// transitionOrAnimationCompleted fires again (probably bug in android)
	// NOTE: we cannot reproduce this issue so this is a blind fix
	if (!entries) {
		return;
	}

	entries.delete(entry);
	if (entries.size === 0) {
		const frame = entry.resolvedPage.frame;

		// We have 0 or 1 entry per frameId in completedEntries
		// So there is no need to make it to Set like waitingQueue
		const previousCompletedAnimationEntry = completedEntries.get(frameId);
		completedEntries.delete(frameId);
		waitingQueue.delete(frameId);

		const navigationContext = frame._executingContext || {
			navigationType: NavigationType.back,
		};
		let current = frame.isCurrent(entry) ? previousCompletedAnimationEntry : entry;
		current = current || entry;
		// Will be null if Frame is shown modally...
		// transitionOrAnimationCompleted fires again (probably bug in android).
		if (current) {
			setTimeout(() => frame.setCurrent(backEntry || current, navigationContext.navigationType));
		}
	} else {
		completedEntries.set(frameId, entry);
	}
}

function toShortString(nativeTransition: androidx.transition.Transition): string {
	return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function printTransitions(entry: ExpandedEntry) {
	if (entry && Trace.isEnabled()) {
		let result = `${entry.fragmentTag} Transitions:`;
		if (entry.transitionName) {
			result += `transitionName=${entry.transitionName}, `;
		}

		const fragment = entry.fragment;
		result += `${fragment.getEnterTransition() ? ' enter=' + toShortString(fragment.getEnterTransition()) : ''}`;
		result += `${fragment.getExitTransition() ? ' exit=' + toShortString(fragment.getExitTransition()) : ''}`;
		result += `${fragment.getReenterTransition() ? ' popEnter=' + toShortString(fragment.getReenterTransition()) : ''}`;
		result += `${fragment.getReturnTransition() ? ' popExit=' + toShortString(fragment.getReturnTransition()) : ''}`;

		Trace.write(result, Trace.categories.Transition);
	}
}

function javaObjectArray(...params: java.lang.Object[]) {
	const nativeArray = Array.create(java.lang.Object, params.length);
	params.forEach((value, i) => (nativeArray[i] = value));

	return nativeArray;
}

function createDummyZeroDurationAnimator(duration: number): android.animation.AnimatorSet {
	const animatorSet = new android.animation.AnimatorSet();
	const objectAnimators = Array.create(android.animation.Animator, 1);

	const values = Array.create('float', 2);
	values[0] = 0.0;
	values[1] = 1.0;

	const animator = <android.animation.Animator>android.animation.ObjectAnimator.ofFloat(null, 'alpha', values);
	animator.setDuration(duration);
	objectAnimators[0] = animator;
	animatorSet.playTogether(objectAnimators);

	return animatorSet;
}

class NoTransition extends Transition {
	public createAndroidAnimator(transitionType: string): android.animation.AnimatorSet {
		return createDummyZeroDurationAnimator(this.getDuration());
	}
}
