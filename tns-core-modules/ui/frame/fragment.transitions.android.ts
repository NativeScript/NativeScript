// Definitions.
import { NavigationTransition, BackstackEntry, Frame } from "../frame";

// Types.
import { Transition, AndroidTransitionType } from "../transition/transition";
import { SlideTransition } from "../transition/slide-transition";
import { FadeTransition } from "../transition/fade-transition";
import { FlipTransition } from "../transition/flip-transition";
import { _resolveAnimationCurve } from "../animation";
import { device } from "../../platform";
import lazy from "../../utils/lazy";

import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories } from "../../trace";

// SAME as frame.android.ts!!! Not imported because we don't want cycle reference.
const CALLBACKS = "_callbacks";

const sdkVersion = lazy(() => parseInt(device.sdkVersion));
const intEvaluator = lazy(() => new android.animation.IntEvaluator());
const defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

const enterFakeResourceId = -10;
const exitFakeResourceId = -20;
const popEnterFakeResourceId = -30;
const popExitFakeResourceId = -40;

const waitingQueue = new Set<android.app.Fragment>();

interface TransitionListener {
    new(fragment: android.app.Fragment): ExpandedTransitionListener;
}

let TransitionListener: TransitionListener;
let AnimationListener: android.animation.Animator.AnimatorListener;
let loadAnimatorMethod: java.lang.reflect.Method;
let reflectionDone: boolean;
let defaultEnterAnimatorStatic: android.animation.Animator;
let defaultExitAnimatorStatic: android.animation.Animator;
let fragmentCompleted: android.app.Fragment;

interface ExpandedAnimator extends android.animation.Animator {
    transitionType?: string;
    fragment?: android.app.Fragment;
}

interface ExpandedTransitionListener extends android.transition.Transition.TransitionListener {
    fragment: android.app.Fragment;
    enterTransition: android.transition.Transition;
    exitTransition: android.transition.Transition;
    reenterTransition: android.transition.Transition;
    returnTransition: android.transition.Transition;
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

    transition: Transition;
    transitionName: string;
}

interface FragmentCallbacks {
    frame: Frame;
    entry: ExpandedEntry;
}

function getFragmentCallbacks(fragment: android.app.Fragment): FragmentCallbacks {
    return fragment[CALLBACKS] as FragmentCallbacks;
}

export function _updateAnimationFragment(newFragment: android.app.Fragment): void {
    const callbacks = getFragmentCallbacks(newFragment);
    const entry = callbacks.entry;
    // oldFragment should be a fragment that we hold reference to but it
    // is no longer used in the activity because activity was recreated.
    // We take the oldFragment from any of the animators or transitions.
    // It should be the same and we must have an oldFragment.
    const animator = entry.enterAnimator || entry.exitAnimator || entry.popEnterAnimator || entry.popExitAnimator;
    const transitionListener = entry.enterTransitionListener || entry.exitTransitionListener || entry.reenterTransitionListener || entry.returnTransitionListener;

    const oldFragmentOwner = animator || transitionListener;
    const oldFragment = oldFragmentOwner ? oldFragmentOwner.fragment : null;

    updateAnimatorTarget(entry.enterAnimator, newFragment);
    updateAnimatorTarget(entry.exitAnimator, newFragment);
    updateAnimatorTarget(entry.popEnterAnimator, newFragment);
    updateAnimatorTarget(entry.popExitAnimator, newFragment);

    clearAllTransitions(oldFragment);

    const enterTransitionListener = entry.enterTransitionListener;
    if (enterTransitionListener) {
        enterTransitionListener.fragment = newFragment;
        newFragment.setEnterTransition(enterTransitionListener.enterTransition);
    }

    const exitTransitionListener = entry.exitTransitionListener;
    if (exitTransitionListener) {
        exitTransitionListener.fragment = newFragment;
        newFragment.setExitTransition(exitTransitionListener.exitTransition);
    }

    const reenterTransitionListener = entry.reenterTransitionListener;
    if (reenterTransitionListener) {
        reenterTransitionListener.fragment = newFragment;
        newFragment.setReenterTransition(reenterTransitionListener.reenterTransition);
    }

    const returnTransitionListener = entry.returnTransitionListener;
    if (returnTransitionListener) {
        returnTransitionListener.fragment = newFragment;
        newFragment.setReturnTransition(returnTransitionListener.returnTransition);
    }
}

function updateAnimatorTarget(animator: ExpandedAnimator, fragment: android.app.Fragment): void {
    if (animator) {
        animator.fragment = fragment;
    }
}

export function _waitForAnimationEnd(newFragment, currentFragment): void {
    if (waitingQueue.size > 0) {
        throw new Error('Calling navigation before previous queue completes.');
    }

    if (newFragment) {
        waitingQueue.add(newFragment);
    }

    if (currentFragment) {
        waitingQueue.add(currentFragment);
    }

    if (waitingQueue.size === 0) {
        throw new Error('At least one fragment should be specified.');
    }
}

export function _setAndroidFragmentTransitions(
    animated: boolean,
    navigationTransition: NavigationTransition,
    currentFragment: android.app.Fragment,
    newFragment: android.app.Fragment,
    fragmentTransaction: android.app.FragmentTransaction,
    manager: android.app.FragmentManager): void {

    _waitForAnimationEnd(newFragment, currentFragment);

    if (sdkVersion() >= 21) {
        allowTransitionOverlap(currentFragment);
        allowTransitionOverlap(newFragment);
    }

    let name = '';
    let transition: Transition;

    if (navigationTransition) {
        transition = navigationTransition.instance;
        name = navigationTransition.name ? navigationTransition.name.toLowerCase() : '';
    }

    let useLollipopTransition = name && (name.indexOf('slide') === 0 || name === 'fade' || name === 'explode') && sdkVersion() >= 21;
    if (!animated) {
        name = 'none';
    } else if (transition) {
        name = 'custom';
        // specifiying transition should override default one even if name match the lollipop transition name.
        useLollipopTransition = false;
    } else if (!useLollipopTransition && name.indexOf('slide') !== 0 && name !== 'fade' && name.indexOf('flip') !== 0) {
        // If we are given name that doesn't match any of ours - fallback to default.
        name = 'default';
    }

    const callbacks = getFragmentCallbacks(newFragment);
    const newEntry = callbacks.entry;
    const currentEntry = currentFragment ? getFragmentCallbacks(currentFragment).entry : null;
    let currentFragmentNeedsDifferentAnimation = false;
    if (currentEntry &&
        (currentEntry.transitionName !== name || currentEntry.transition !== transition)) {
        clearTransitions(currentFragment, true);
        currentFragmentNeedsDifferentAnimation = true;
    }

    if (name === 'none') {
        transition = new NoTransition(0, null);
    } else if (name === 'default') {
        initDefaultAnimations(manager)
        transition = new DefaultTransition(0, null);
    } else if (useLollipopTransition) {
        // setEnterTransition: Enter
        // setExitTransition: Exit
        // setReenterTransition: Pop Enter, same as Exit if not specified
        // setReturnTransition: Pop Exit, same as Enter if not specified

        if (name.indexOf('slide') === 0) {
            setupNewFragmentSlideTransition(navigationTransition, newFragment, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentSlideTransition(navigationTransition, currentFragment, name);
            }
        } else if (name === 'fade') {
            setupNewFragmentFadeTransition(navigationTransition, newFragment);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentFadeTransition(navigationTransition, currentFragment);
            }
        } else if (name === 'explode') {
            setupNewFragmentExplodeTransition(navigationTransition, newFragment);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentExplodeTransition(navigationTransition, currentFragment);
            }
        }
    } else if (name.indexOf('slide') === 0) {
        const direction = name.substr('slide'.length) || 'left'; //Extract the direction from the string
        transition = new SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
    } else if (name === 'fade') {
        transition = new FadeTransition(navigationTransition.duration, navigationTransition.curve);
    } else if (name.indexOf('flip') === 0) {
        const direction = name.substr('flip'.length) || 'right'; //Extract the direction from the string
        transition = new FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }

    newEntry.transitionName = name;
    if (name === 'custom') {
        newEntry.transition = transition;
    }

    // Having transition means we have custom animation
    if (transition) {
        fragmentTransaction.setCustomAnimations(enterFakeResourceId, exitFakeResourceId, popEnterFakeResourceId, popExitFakeResourceId);
        setupAllAnimation(newFragment, transition);
        if (currentFragmentNeedsDifferentAnimation) {
            setupExitAndPopEnterAnimation(currentFragment, transition);
        }
    }

    if (currentEntry) {
        currentEntry.transitionName = name;
        if (name === 'custom') {
            currentEntry.transition = transition;
        }
    }

    printTransitions(currentFragment);
    printTransitions(newFragment);
}

export function _onFragmentCreateAnimator(fragment: android.app.Fragment, nextAnim: number): android.animation.Animator {
    const entry = getFragmentCallbacks(fragment).entry;
    switch (nextAnim) {
        case enterFakeResourceId:
            return entry.enterAnimator;
        case exitFakeResourceId:
            return entry.exitAnimator;
        case popEnterFakeResourceId:
            return entry.popEnterAnimator;
        case popExitFakeResourceId:
            return entry.popExitAnimator;
    }

    return null;
}

class NoTransition extends Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        return createDummyZeroDurationAnimator();
    }
}

class DefaultTransition extends Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        switch (transitionType) {
            case AndroidTransitionType.enter:
            case AndroidTransitionType.popEnter:
                return getDefaultAnimation(true);

            case AndroidTransitionType.popExit:
            case AndroidTransitionType.exit:
                return getDefaultAnimation(false);
        }
    }
}

// Transition listener can't be static because
// android is cloning transitions and we can't expand them :(
function getTransitionListener(fragment: android.app.Fragment): ExpandedTransitionListener {
    if (!TransitionListener) {
        @Interfaces([(<any>android).transition.Transition.TransitionListener])
        class TransitionListenerImpl extends java.lang.Object implements android.transition.Transition.TransitionListener {
            constructor(public fragment: android.app.Fragment) {
                super();
                return global.__native(this);
            }

            public onTransitionStart(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`START ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
                }
            }

            onTransitionEnd(transition: android.transition.Transition): void {
                const expandedFragment = this.fragment;
                if (traceEnabled()) {
                    traceWrite(`END ${toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
                }

                transitionOrAnimationCompleted(expandedFragment);
            }

            onTransitionResume(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`RESUME ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
                }
            }

            onTransitionPause(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`PAUSE ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
                }
            }

            onTransitionCancel(transition: android.transition.Transition): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
                }
            }

            enterTransition: android.transition.Transition;
            exitTransition: android.transition.Transition;
            reenterTransition: android.transition.Transition;
            returnTransition: android.transition.Transition;
        }

        TransitionListener = TransitionListenerImpl;
    }

    return new TransitionListener(fragment);
}

function getAnimationListener(): android.animation.Animator.IAnimatorListener {
    if (!AnimationListener) {
        @Interfaces([android.animation.Animator.AnimatorListener])
        class AnimationListnerImpl extends java.lang.Object implements android.animation.Animator.AnimatorListener {
            constructor() {
                super();
                return global.__native(this);
            }

            onAnimationStart(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`START ${animator.transitionType} for ${animator.fragment}`, traceCategories.Transition);
                }
            }

            onAnimationRepeat(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`REPEAT ${animator.transitionType} for ${animator.fragment}`, traceCategories.Transition);
                }
            }

            onAnimationEnd(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`END ${animator.transitionType} for ${animator.fragment}`, traceCategories.Transition);
                }

                transitionOrAnimationCompleted(animator.fragment);
            }

            onAnimationCancel(animator: ExpandedAnimator): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${animator.transitionType} for ${animator.fragment}`, traceCategories.Transition);
                }
            }
        }

        AnimationListener = new AnimationListnerImpl();
    }

    return AnimationListener;
}

function clearAnimationListener(animator: ExpandedAnimator, listener: android.animation.Animator.IAnimatorListener): void {
    if (!animator) {
        return;
    }

    animator.removeListener(listener);

    const fragment = animator.fragment;
    if (!fragment) {
        return;
    }

    animator.fragment = null;
    const entry = getFragmentCallbacks(fragment).entry;
    if (traceEnabled()) {
        traceWrite(`Clear ${animator.transitionType} - ${entry.transition} for ${fragment}`, traceCategories.Transition);
    }
}

function clearTransitions(fragment: android.app.Fragment, removeListener: boolean): void {
    if (sdkVersion() >= 21) {
        const entry = getFragmentCallbacks(fragment).entry;
        const exitListener = entry.exitTransitionListener;
        if (exitListener) {
            const exitTransition = fragment.getExitTransition();
            if (exitTransition) {
                if (removeListener) {
                    exitTransition.removeListener(exitListener);
                }

                fragment.setExitTransition(null);//exit
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

                fragment.setReenterTransition(null);//popEnter
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

function clearAllTransitions(fragment: android.app.Fragment): void {
    if (!fragment) {
        return;
    }

    clearTransitions(fragment, false);

    if (sdkVersion() >= 21) {
        const entry = getFragmentCallbacks(fragment).entry;
        const enterListener = entry.enterTransitionListener;
        if (enterListener) {
            const enterTransition = fragment.getEnterTransition();
            if (enterTransition) {
                fragment.setEnterTransition(null);//exit
                if (traceEnabled()) {
                    traceWrite(`Cleared Enter ${enterTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
                }
            }
        }

        const returnListener = entry.returnTransitionListener;
        if (returnListener) {
            const returnTransition = fragment.getReturnTransition();
            if (returnTransition) {
                fragment.setReturnTransition(null);//popEnter
                if (traceEnabled()) {
                    traceWrite(`Cleared Return ${returnTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
                }
            }
        }
    }
}

function allowTransitionOverlap(fragment: android.app.Fragment): void {
    if (fragment) {
        fragment.setAllowEnterTransitionOverlap(true);
        fragment.setAllowReturnTransitionOverlap(true);
    }
}

function setEnterTransition(navigationTransition: NavigationTransition, fragment: android.app.Fragment, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(fragment, transition);
    // attach listener to JS object so that it will be alive as long as entry.
    getFragmentCallbacks(fragment).entry.enterTransitionListener = listener;
    listener.enterTransition = transition;
    fragment.setEnterTransition(transition);
}

function setExitTransition(navigationTransition: NavigationTransition, fragment: android.app.Fragment, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(fragment, transition);
    // attach listener to JS object so that it will be alive as long as entry.
    getFragmentCallbacks(fragment).entry.exitTransitionListener = listener;
    listener.exitTransition = transition;
    fragment.setExitTransition(transition);
}

function setReenterTransition(navigationTransition: NavigationTransition, fragment: android.app.Fragment, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(fragment, transition);
    // attach listener to JS object so that it will be alive as long as entry.
    getFragmentCallbacks(fragment).entry.reenterTransitionListener = listener;
    listener.reenterTransition = transition;
    fragment.setReenterTransition(transition);
}

function setReturnTransition(navigationTransition: NavigationTransition, fragment: android.app.Fragment, transition: android.transition.Transition): void {
    setUpNativeTransition(navigationTransition, transition);
    const listener = addNativeTransitionListener(fragment, transition);
    // attach listener to JS object so that it will be alive as long as entry.
    getFragmentCallbacks(fragment).entry.returnTransitionListener = listener;
    listener.returnTransition = transition;
    fragment.setReturnTransition(transition);
}

function setupNewFragmentSlideTransition(navTransition: NavigationTransition, fragment: android.app.Fragment, name: string): void {
    const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
    switch (direction) {
        case "left":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;

        case "right":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            break;

        case "top":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;

        case "bottom":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setEnterTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            break;
    }
}

function setupCurrentFragmentSlideTransition(navTransition: NavigationTransition, fragment: android.app.Fragment, name: string): void {
    const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
    switch (direction) {
        case "left":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.LEFT));
            break;

        case "right":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;

        case "top":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.TOP));
            break;

        case "bottom":
            setExitTransition(navTransition, fragment, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
    }
}

function setupNewFragmentFadeTransition(navTransition: NavigationTransition, fragment: android.app.Fragment): void {
    setupCurrentFragmentFadeTransition(navTransition, fragment);

    const fadeInEnter = new android.transition.Fade(android.transition.Fade.IN);
    setEnterTransition(navTransition, fragment, fadeInEnter);

    const fadeOutReturn = new android.transition.Fade(android.transition.Fade.OUT);
    setReturnTransition(navTransition, fragment, fadeOutReturn);
}

function setupCurrentFragmentFadeTransition(navTransition: NavigationTransition, fragment: android.app.Fragment): void {
    const fadeOutExit = new android.transition.Fade(android.transition.Fade.OUT);
    setExitTransition(navTransition, fragment, fadeOutExit);

    // NOTE: There is a bug in Fade transition so we need to set all 4
    // otherwise back navigation will complete immediately (won't run the reverse transition).
    const fadeInReenter = new android.transition.Fade(android.transition.Fade.IN);
    setReenterTransition(navTransition, fragment, fadeInReenter);
}

function setupCurrentFragmentExplodeTransition(navTransition: NavigationTransition, fragment: android.app.Fragment): void {
    setExitTransition(navTransition, fragment, new android.transition.Explode());
}

function setupNewFragmentExplodeTransition(navTransition: NavigationTransition, fragment: android.app.Fragment): void {
    setExitTransition(navTransition, fragment, new android.transition.Explode());
    setEnterTransition(navTransition, fragment, new android.transition.Explode());
}

function setupExitAndPopEnterAnimation(fragment: android.app.Fragment, transition: Transition): void {
    const entry = getFragmentCallbacks(fragment).entry;
    const listener = getAnimationListener();

    const exitAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.exit);
    exitAnimator.transitionType = AndroidTransitionType.exit;
    exitAnimator.fragment = fragment;
    exitAnimator.addListener(listener);
    // remove previous listener if we are changing the animator.
    clearAnimationListener(entry.exitAnimator, listener);
    entry.exitAnimator = exitAnimator;

    const popEnterAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.popEnter);
    popEnterAnimator.transitionType = AndroidTransitionType.popEnter;
    popEnterAnimator.fragment = fragment;
    popEnterAnimator.addListener(listener);
    // remove previous listener if we are changing the animator.
    clearAnimationListener(entry.popEnterAnimator, listener);
    entry.popEnterAnimator = popEnterAnimator;
}

function setupAllAnimation(fragment: android.app.Fragment, transition: Transition): void {
    setupExitAndPopEnterAnimation(fragment, transition);

    const entry = getFragmentCallbacks(fragment).entry;
    const listener = getAnimationListener();

    // setupAllAnimation is called only for new fragments so we don't 
    // need to clearAnimationListener for enter & popExit animators.
    const enterAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.enter);
    enterAnimator.transitionType = AndroidTransitionType.enter;
    enterAnimator.fragment = fragment;
    enterAnimator.addListener(listener);
    entry.enterAnimator = enterAnimator;

    const popExitAnimator = <ExpandedAnimator>transition.createAndroidAnimator(AndroidTransitionType.popExit);
    popExitAnimator.transitionType = AndroidTransitionType.popExit;
    popExitAnimator.fragment = fragment;
    popExitAnimator.addListener(listener);
    entry.popExitAnimator = popExitAnimator;
}

function setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: android.transition.Transition) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }

    const interpolator = navigationTransition.curve ? _resolveAnimationCurve(navigationTransition.curve) : defaultInterpolator();
    nativeTransition.setInterpolator(interpolator);
}

function transitionsCompleted(fragment: android.app.Fragment): boolean {
    waitingQueue.delete(fragment);
    return waitingQueue.size === 0;
}

function transitionOrAnimationCompleted(fragment: android.app.Fragment): void {
    if (transitionsCompleted(fragment)) {
        const callbacks = getFragmentCallbacks(fragment);
        const entry = callbacks.entry;
        const frame = callbacks.frame;
        const setAsCurrent = frame.isCurrent(entry) ? fragmentCompleted : fragment;

        fragmentCompleted = null;
        setTimeout(() => frame.setCurrent(getFragmentCallbacks(setAsCurrent).entry));
    } else {
        fragmentCompleted = fragment;
    }
}

function toShortString(nativeTransition: android.transition.Transition): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function addNativeTransitionListener(fragment: android.app.Fragment, nativeTransition: android.transition.Transition): ExpandedTransitionListener {
    const listener = getTransitionListener(fragment);
    nativeTransition.addListener(listener);
    return listener;
}

function javaObjectArray(...params: java.lang.Object[]) {
    const nativeArray = Array.create(java.lang.Object, params.length);
    params.forEach((value, i) => nativeArray[i] = value);
    return nativeArray;
}

function javaClassArray(...params: java.lang.Class<any>[]) {
    const nativeArray = Array.create(java.lang.Class, params.length);
    params.forEach((value, i) => nativeArray[i] = value);
    return nativeArray;
}

function initDefaultAnimations(manager: android.app.FragmentManager): void {
    if (reflectionDone) {
        return;
    }

    reflectionDone = true;

    loadAnimatorMethod = manager.getClass().getDeclaredMethod("loadAnimator", javaClassArray(android.app.Fragment.class, java.lang.Integer.TYPE, java.lang.Boolean.TYPE, java.lang.Integer.TYPE));
    if (loadAnimatorMethod != null) {
        loadAnimatorMethod.setAccessible(true);

        const fragment_open = java.lang.Integer.valueOf(android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        const zero = java.lang.Integer.valueOf(0);
        const fragment = new android.app.Fragment();

        // Get default enter transition.
        defaultEnterAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.TRUE, zero));

        // Get default exit transition.
        defaultExitAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.FALSE, zero));
    }
}

function getDefaultAnimation(enter: boolean): ExpandedAnimator {
    const defaultAnimator = enter ? defaultEnterAnimatorStatic : defaultExitAnimatorStatic;
    return defaultAnimator ? defaultAnimator.clone() : null;
}

function createDummyZeroDurationAnimator(): ExpandedAnimator {
    const animator = android.animation.ValueAnimator.ofObject(intEvaluator(), javaObjectArray(java.lang.Integer.valueOf(0), java.lang.Integer.valueOf(1)));
    animator.setDuration(0);
    return animator;
}

function printTransitions(fragment: android.app.Fragment) {
    if (fragment && traceEnabled()) {
        const entry = getFragmentCallbacks(fragment).entry;
        let result = `${fragment} Transitions:`;
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
            result += `${fragment.getEnterTransition() ? " enter=" + toShortString(fragment.getEnterTransition()) : ""}`;
            result += `${fragment.getExitTransition() ? " exit=" + toShortString(fragment.getExitTransition()) : ""}`;
            result += `${fragment.getReenterTransition() ? " popEnter=" + toShortString(fragment.getReenterTransition()) : ""}`;
            result += `${fragment.getReturnTransition() ? " popExit=" + toShortString(fragment.getReturnTransition()) : ""}`;
        }
        traceWrite(result, traceCategories.Transition);
    }
}