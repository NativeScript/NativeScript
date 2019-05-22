/// <reference path="transition-definitions.android.d.ts"/>

// Definitions.
import { NavigationTransition, BackstackEntry } from "../frame";
import { AnimationType } from "./fragment.transitions";

// Types.
import { Transition, AndroidTransitionType } from "../transition/transition";
import { SlideTransition } from "../transition/slide-transition";
import { FadeTransition } from "../transition/fade-transition";
import { FlipTransition } from "../transition/flip-transition";
import { _resolveAnimationCurve } from "../animation";
import { device } from "../../platform";
import lazy from "../../utils/lazy";

import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories } from "../../trace";

interface TransitionListener {
    new(entry: ExpandedEntry, transition: android.transition.Transition): ExpandedTransitionListener;
}

interface ExpandedAnimator extends android.animation.Animator {
    entry: ExpandedEntry;
    transitionType?: string;
}

interface ExpandedTransitionListener extends android.transition.Transition.TransitionListener {
    entry: ExpandedEntry;
    transition: android.transition.Transition;
}

interface ExpandedEntry extends BackstackEntry {
    enterTransitionListener: ExpandedTransitionListener;
    exitTransitionListener: ExpandedTransitionListener;
    reenterTransitionListener: ExpandedTransitionListener;
    returnTransitionListener: ExpandedTransitionListener;

    enterAnimator: ExpandedAnimator;
    exitAnimator: ExpandedAnimator;
    popEnterAnimator: ExpandedAnimator;
    popExitAnimator: ExpandedAnimator;

    defaultEnterAnimator: ExpandedAnimator;
    defaultExitAnimator: ExpandedAnimator;

    transition: Transition;
    transitionName: string;
    frameId: number
    useLollipopTransition: boolean;
}

const sdkVersion = lazy(() => parseInt(device.sdkVersion));
const intEvaluator = lazy(() => new android.animation.IntEvaluator());
const defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

export const waitingQueue = new Map<number, Set<ExpandedEntry>>();
export const completedEntries = new Map<number, ExpandedEntry>();

let TransitionListener: TransitionListener;
let AnimationListener: android.animation.Animator.AnimatorListener;

export function _setAndroidFragmentTransitions(
    animated: boolean,
    navigationTransition: NavigationTransition,
    currentEntry: ExpandedEntry,
    newEntry: ExpandedEntry,
    fragmentTransaction: android.support.v4.app.FragmentTransaction,
    frameId: number): void {

    const currentFragment: android.support.v4.app.Fragment = currentEntry ? currentEntry.fragment : null;
    const newFragment: android.support.v4.app.Fragment = newEntry.fragment;
    const entries = waitingQueue.get(frameId);
    if (entries && entries.size > 0) {
        throw new Error("Calling navigation before previous navigation finish.");
    }

    if (sdkVersion() >= 21) {
        allowTransitionOverlap(currentFragment);
        allowTransitionOverlap(newFragment);
    }

    let name = "";
    let transition: Transition;

    if (navigationTransition) {
        transition = navigationTransition.instance;
        name = navigationTransition.name ? navigationTransition.name.toLowerCase() : "";
    }

    let useLollipopTransition = !!(name && (name.indexOf("slide") === 0 || name === "fade" || name === "explode") && sdkVersion() >= 21);
    // [nested frames / fragments] force disable lollipop transitions in case nested fragments
    // are detected as applying dummy animator to the nested fragment with the same duration as
    // the exit animator of the removing parent fragment as a workaround for
    // https://code.google.com/p/android/issues/detail?id=55228 works only if custom animations are
    // used
    // NOTE: this effectively means you cannot use Explode transition in nested frames scenarios as
    // we have implementations only for slide, fade, and flip
    if (currentFragment &&
        currentFragment.getChildFragmentManager() &&
        currentFragment.getChildFragmentManager().getFragments().toArray().length > 0) {
        useLollipopTransition = false;
    }

    newEntry.useLollipopTransition = useLollipopTransition;

    if (!animated) {
        name = "none";
    } else if (transition) {
        name = "custom";
        // specifiying transition should override default one even if name match the lollipop transition name.
        useLollipopTransition = false;
    } else if (!useLollipopTransition && name.indexOf("slide") !== 0 && name !== "fade" && name.indexOf("flip") !== 0) {
        // If we are given name that doesn't match any of ours - fallback to default.
        name = "default";
    }

    let currentFragmentNeedsDifferentAnimation = false;
    if (currentEntry) {
        _updateTransitions(currentEntry);
        if (currentEntry.transitionName !== name ||
            currentEntry.transition !== transition ||
            !!currentEntry.useLollipopTransition !== useLollipopTransition ||
            !useLollipopTransition) {
            clearExitAndReenterTransitions(currentEntry, true);
            currentFragmentNeedsDifferentAnimation = true;
        }
    }

    if (name === "none") {
        transition = new NoTransition(0, null);
    } else if (name === "default") {
        transition = new FadeTransition(150, null);
    } else if (useLollipopTransition) {
        // setEnterTransition: Enter
        // setExitTransition: Exit
        // setReenterTransition: Pop Enter, same as Exit if not specified
        // setReturnTransition: Pop Exit, same as Enter if not specified

        if (name.indexOf("slide") === 0) {
            setupNewFragmentSlideTransition(navigationTransition, newEntry, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentSlideTransition(navigationTransition, currentEntry, name);
            }
        } else if (name === "fade") {
            setupNewFragmentFadeTransition(navigationTransition, newEntry);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentFadeTransition(navigationTransition, currentEntry);
            }
        } else if (name === "explode") {
            setupNewFragmentExplodeTransition(navigationTransition, newEntry);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentExplodeTransition(navigationTransition, currentEntry);
            }
        }
    } else if (name.indexOf("slide") === 0) {
        const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
        transition = new SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
    } else if (name === "fade") {
        transition = new FadeTransition(navigationTransition.duration, navigationTransition.curve);
    } else if (name.indexOf("flip") === 0) {
        const direction = name.substr("flip".length) || "right"; //Extract the direction from the string
        transition = new FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }

    newEntry.transitionName = name;
    if (name === "custom") {
        newEntry.transition = transition;
    }

    // Having transition means we have custom animation
    if (transition) {
        if (fragmentTransaction) {
            // we do not use Android backstack so setting popEnter / popExit is meaningless (3rd and 4th optional args)
            fragmentTransaction.setCustomAnimations(AnimationType.enterFakeResourceId, AnimationType.exitFakeResourceId);
        }
        
        setupAllAnimation(newEntry, transition);
        if (currentFragmentNeedsDifferentAnimation) {
            setupExitAndPopEnterAnimation(currentEntry, transition);
        }
    }

    if (currentEntry) {
        currentEntry.transitionName = name;
        if (name === "custom") {
            currentEntry.transition = transition;
        }
    }

    setupDefaultAnimations(newEntry, new FadeTransition(150, null));

    printTransitions(currentEntry);
    printTransitions(newEntry);
}

export function _onFragmentCreateAnimator(entry: ExpandedEntry, fragment: android.support.v4.app.Fragment, nextAnim: number, enter: boolean): android.animation.Animator {
    let animator: android.animation.Animator;
    switch (nextAnim) {
        case AnimationType.enterFakeResourceId:
            animator = entry.enterAnimator || entry.defaultEnterAnimator /* HACK */;
            break;

        case AnimationType.exitFakeResourceId:
            animator = entry.exitAnimator || entry.defaultExitAnimator /* HACK */;
            break;

        case AnimationType.popEnterFakeResourceId:
            animator = entry.popEnterAnimator;
            break;

        case AnimationType.popExitFakeResourceId:
            animator = entry.popExitAnimator;
            break;
    }

    if (!animator && sdkVersion() >= 21) {
        const view = fragment.getView();
        const jsParent = entry.resolvedPage.parent;
        const parent = view.getParent() || (jsParent && jsParent.nativeViewProtected);
        const animatedEntries = _getAnimatedEntries(entry.frameId);
        if (!animatedEntries || !animatedEntries.has(entry)) {
            if (parent && !(<any>parent).isLaidOut()) {
                animator = enter ? entry.defaultEnterAnimator : entry.defaultExitAnimator;
            }
        }
    }

    return animator;
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
    if (sdkVersion() >= 21) {
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
    }

    return transitionUsed;
}

// Transition listener can't be static because
// android is cloning transitions and we can't expand them :(
function getTransitionListener(entry: ExpandedEntry, transition: android.transition.Transition): ExpandedTransitionListener {
    if (!TransitionListener) {
        @Interfaces([(<any>android).transition.Transition.TransitionListener])
        class TransitionListenerImpl extends java.lang.Object implements android.transition.Transition.TransitionListener {
            constructor(public entry: ExpandedEntry, public transition: android.transition.Transition) {
                super();
                return global.__native(this);
            }

            public onTransitionStart(transition: android.transition.Transition): void {
                const entry = this.entry;
                addToWaitingQueue(entry);
                if (traceEnabled()) {
                    traceWrite(`START ${toShortString(transition)} transition for ${entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onTransitionEnd(transition: android.transition.Transition): void {
                const entry = this.entry;
                if (traceEnabled()) {
                    traceWrite(`END ${toShortString(transition)} transition for ${entry.fragmentTag}`, traceCategories.Transition);
                }

                transitionOrAnimationCompleted(entry);
            }

            onTransitionResume(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    const fragment = this.entry.fragmentTag;
                    traceWrite(`RESUME ${toShortString(transition)} transition for ${fragment}`, traceCategories.Transition);
                }
            }

            onTransitionPause(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`PAUSE ${toShortString(transition)} transition for ${this.entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onTransitionCancel(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${toShortString(transition)} transition for ${this.entry.fragmentTag}`, traceCategories.Transition);
                }
            }
        }

        TransitionListener = TransitionListenerImpl;
    }

    return new TransitionListener(entry, transition);
}

function getAnimationListener(): android.animation.Animator.AnimatorListener {
    if (!AnimationListener) {
        @Interfaces([android.animation.Animator.AnimatorListener])
        class AnimationListenerImpl extends java.lang.Object implements android.animation.Animator.AnimatorListener {
            constructor() {
                super();
                return global.__native(this);
            }

            onAnimationStart(animator: ExpandedAnimator): void {
                const entry = animator.entry;
                addToWaitingQueue(entry);
                if (traceEnabled()) {
                    traceWrite(`START ${animator.transitionType} for ${entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onAnimationRepeat(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`REPEAT ${animator.transitionType} for ${animator.entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onAnimationEnd(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`END ${animator.transitionType} for ${animator.entry.fragmentTag}`, traceCategories.Transition);
                }

                transitionOrAnimationCompleted(animator.entry);
            }

            onAnimationCancel(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${animator.transitionType} for ${animator.entry.fragmentTag}`, traceCategories.Transition);
                }
            }
        }

        AnimationListener = new AnimationListenerImpl();
    }

    return AnimationListener;
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

function clearAnimationListener(animator: ExpandedAnimator, listener: android.animation.Animator.AnimatorListener): void {
    if (!animator) {
        return;
    }

    animator.removeListener(listener);

    if (animator.entry && traceEnabled()) {
        const entry = animator.entry;
        traceWrite(`Clear ${animator.transitionType} - ${entry.transition} for ${entry.fragmentTag}`, traceCategories.Transition);
    }

    animator.entry = null;
}

function clearExitAndReenterTransitions(entry: ExpandedEntry, removeListener: boolean): void {
    if (sdkVersion() >= 21) {
        const fragment: android.support.v4.app.Fragment = entry.fragment;
        const exitListener = entry.exitTransitionListener;
        if (exitListener) {
            const exitTransition = fragment.getExitTransition();
            if (exitTransition) {
                if (removeListener) {
                    exitTransition.removeListener(exitListener);
                }

                fragment.setExitTransition(null);
                if (traceEnabled()) {
                    traceWrite(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
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
                if (traceEnabled()) {
                    traceWrite(`Cleared Reenter ${reenterTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
                }
            }

            if (removeListener) {
                entry.reenterTransitionListener = null;
            }
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

    if (sdkVersion() >= 21) {
        const fragment: android.support.v4.app.Fragment = entry.fragment;
        const enterListener = entry.enterTransitionListener;
        if (enterListener) {
            const enterTransition = fragment.getEnterTransition();
            if (enterTransition) {
                if (removeListener) {
                    enterTransition.removeListener(enterListener);
                }

                fragment.setEnterTransition(null);
                if (traceEnabled()) {
                    traceWrite(`Cleared Enter ${enterTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
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
                if (traceEnabled()) {
                    traceWrite(`Cleared Return ${returnTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
                }
            }

            if (removeListener) {
                entry.returnTransitionListener = null;
            }
        }
    }

    if (removeListener) {
        const listener = getAnimationListener();
        clearAnimationListener(entry.enterAnimator, listener);
        clearAnimationListener(entry.exitAnimator, listener);
        clearAnimationListener(entry.popEnterAnimator, listener);
        clearAnimationListener(entry.popExitAnimator, listener);
        clearAnimationListener(entry.defaultEnterAnimator, listener);
        clearAnimationListener(entry.defaultExitAnimator, listener);
    }
}

function allowTransitionOverlap(fragment: android.support.v4.app.Fragment): void {
    if (fragment) {
        fragment.setAllowEnterTransitionOverlap(true);
        fragment.setAllowReturnTransitionOverlap(true);
    }
}

function setEnterTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(entry, transition);

    // attach listener to JS object so that it will be alive as long as entry.
    entry.enterTransitionListener = listener;
    const fragment: android.support.v4.app.Fragment = entry.fragment;
    fragment.setEnterTransition(transition);
}

function setExitTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(entry, transition);

    // attach listener to JS object so that it will be alive as long as entry.
    entry.exitTransitionListener = listener;
    const fragment: android.support.v4.app.Fragment = entry.fragment;
    fragment.setExitTransition(transition);
}

function setReenterTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(entry, transition);

    // attach listener to JS object so that it will be alive as long as entry.
    entry.reenterTransitionListener = listener;
    const fragment: android.support.v4.app.Fragment = entry.fragment;
    fragment.setReenterTransition(transition);
}

function setReturnTransition(navigationTransition: NavigationTransition, entry: ExpandedEntry, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(entry, transition);

    // attach listener to JS object so that it will be alive as long as entry.
    entry.returnTransitionListener = listener;
    const fragment: android.support.v4.app.Fragment = entry.fragment;
    fragment.setReturnTransition(transition);
}

function setupNewFragmentSlideTransition(navTransition: NavigationTransition, entry: ExpandedEntry, name: string): void {
    setupCurrentFragmentSlideTransition(navTransition, entry, name);
    const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
    switch (direction) {
        case "left":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;

        case "right":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            break;

        case "top":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;

        case "bottom":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            break;
    }
}

function setupCurrentFragmentSlideTransition(navTransition: NavigationTransition, entry: ExpandedEntry, name: string): void {
    const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
    switch (direction) {
        case "left":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            break;

        case "right":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;

        case "top":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            break;

        case "bottom":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
    }
}

function setupNewFragmentFadeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
    setupCurrentFragmentFadeTransition(navTransition, entry);

    const fadeInEnter = new android.transition.Fade(android.transition.Fade.IN);
    setEnterTransition(navTransition, entry, fadeInEnter);

    const fadeOutReturn = new android.transition.Fade(android.transition.Fade.OUT);
    setReturnTransition(navTransition, entry, fadeOutReturn);
}

function setupCurrentFragmentFadeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
    const fadeOutExit = new android.transition.Fade(android.transition.Fade.OUT);
    setExitTransition(navTransition, entry, fadeOutExit);

    // NOTE: There is a bug in Fade transition so we need to set all 4
    // otherwise back navigation will complete immediately (won't run the reverse transition).
    const fadeInReenter = new android.transition.Fade(android.transition.Fade.IN);
    setReenterTransition(navTransition, entry, fadeInReenter);
}

function setupCurrentFragmentExplodeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
    setExitTransition(navTransition, entry, new android.transition.Explode());
    setReenterTransition(navTransition, entry, new android.transition.Explode());
}

function setupNewFragmentExplodeTransition(navTransition: NavigationTransition, entry: ExpandedEntry): void {
    setupCurrentFragmentExplodeTransition(navTransition, entry);

    setEnterTransition(navTransition, entry, new android.transition.Explode());
    setReturnTransition(navTransition, entry, new android.transition.Explode());
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

function setupDefaultAnimations(entry: ExpandedEntry, transition: Transition): void {
    const listener = getAnimationListener();

    const enterAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.enter);
    enterAnimator.transitionType = AndroidTransitionType.enter;
    enterAnimator.entry = entry;
    enterAnimator.addListener(listener);
    entry.defaultEnterAnimator = enterAnimator;

    const exitAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.exit);
    exitAnimator.transitionType = AndroidTransitionType.exit;
    exitAnimator.entry = entry;
    exitAnimator.addListener(listener);
    entry.defaultExitAnimator = exitAnimator;
}

function setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: android.transition.Transition) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }

    const interpolator = navigationTransition.curve ? _resolveAnimationCurve(navigationTransition.curve) : defaultInterpolator();
    nativeTransition.setInterpolator(interpolator);
}

function addNativeTransitionListener(entry: ExpandedEntry, nativeTransition: android.transition.Transition): ExpandedTransitionListener {
    const listener = getTransitionListener(entry, nativeTransition);
    nativeTransition.addListener(listener);
    return listener;
}

function transitionOrAnimationCompleted(entry: ExpandedEntry): void {
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

        let current = frame.isCurrent(entry) ? previousCompletedAnimationEntry : entry;
        current = current || entry;
        // Will be null if Frame is shown modally...
        // transitionOrAnimationCompleted fires again (probably bug in android).
        if (current) {
            const navType = frame.navigationType;
            setTimeout(() => frame.setCurrent(current, navType));
        }
    } else {
        completedEntries.set(frameId, entry);
    }
}

function toShortString(nativeTransition: android.transition.Transition): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function printTransitions(entry: ExpandedEntry) {
    if (entry && traceEnabled()) {
        let result = `${entry.fragmentTag} Transitions:`;
        if (entry.transitionName) {
            result += `transitionName=${entry.transitionName}, `;
        }

        if (entry.transition) {
            result += `enterAnimator=${entry.enterAnimator}, `;
            result += `exitAnimator=${entry.exitAnimator}, `;
            result += `popEnterAnimator=${entry.popEnterAnimator}, `;
            result += `popExitAnimator=${entry.popExitAnimator}, `;
        }
        if (sdkVersion() >= 21) {
            const fragment = entry.fragment;
            result += `${fragment.getEnterTransition() ? " enter=" + toShortString(fragment.getEnterTransition()) : ""}`;
            result += `${fragment.getExitTransition() ? " exit=" + toShortString(fragment.getExitTransition()) : ""}`;
            result += `${fragment.getReenterTransition() ? " popEnter=" + toShortString(fragment.getReenterTransition()) : ""}`;
            result += `${fragment.getReturnTransition() ? " popExit=" + toShortString(fragment.getReturnTransition()) : ""}`;
        }
        traceWrite(result, traceCategories.Transition);
    }
}

function javaObjectArray(...params: java.lang.Object[]) {
    const nativeArray = Array.create(java.lang.Object, params.length);
    params.forEach((value, i) => nativeArray[i] = value);
    return nativeArray;
}

function createDummyZeroDurationAnimator(): android.animation.Animator {
    const animator = android.animation.ValueAnimator.ofObject(intEvaluator(), javaObjectArray(java.lang.Integer.valueOf(0), java.lang.Integer.valueOf(1)));
    animator.setDuration(0);
    return animator;
}

class NoTransition extends Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        return createDummyZeroDurationAnimator();
    }
}
