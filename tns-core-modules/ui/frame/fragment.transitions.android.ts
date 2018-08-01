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

interface ExpandedAnimation extends android.view.animation.Animation {
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

    enterAnimation: ExpandedAnimation;
    exitAnimation: ExpandedAnimation;
    popEnterAnimation: ExpandedAnimation;
    popExitAnimation: ExpandedAnimation;

    defaultEnterAnimation: ExpandedAnimation;
    defaultExitAnimation: ExpandedAnimation;

    transition: Transition;
    transitionName: string;
    frameId: number
}

const sdkVersion = lazy(() => parseInt(device.sdkVersion));
const defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());
const isAndroidP = lazy(() => sdkVersion() > 27);

export const waitingQueue = new Map<number, Set<ExpandedEntry>>();
export const completedEntries = new Map<number, ExpandedEntry>();

let TransitionListener: TransitionListener;
let AnimationListener: android.view.animation.Animation.AnimationListener;
let loadAnimationMethod: java.lang.reflect.Method;
let reflectionDone: boolean;
let defaultEnterAnimationStatic: android.view.animation.Animation;
let defaultExitAnimationStatic: android.view.animation.Animation;

export function _setAndroidFragmentTransitions(
    animated: boolean,
    navigationTransition: NavigationTransition,
    currentEntry: ExpandedEntry,
    newEntry: ExpandedEntry,
    fragmentTransaction: android.support.v4.app.FragmentTransaction,
    manager: android.support.v4.app.FragmentManager,
    frameId: number): void {

    const currentFragment: android.support.v4.app.Fragment = currentEntry ? currentEntry.fragment : null;
    const newFragment: android.support.v4.app.Fragment = newEntry.fragment;
    const entries = waitingQueue.get(frameId);
    if (entries && entries.size > 0) {
        throw new Error("Calling navigation before previous navigation finish.");
    }

    if (!isAndroidP()) {
        initDefaultAnimations(manager);
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

    let useLollipopTransition = name && (name.indexOf("slide") === 0 || name === "fade" || name === "explode") && sdkVersion() >= 21;
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
        if (currentEntry.transitionName !== name
            || currentEntry.transition !== transition) {
            clearExitAndReenterTransitions(currentEntry, true);
            currentFragmentNeedsDifferentAnimation = true;
        }
    }

    if (name === "none") {
        transition = new NoTransition(0, null);
    } else if (name === "default") {
        if (isAndroidP()) {
            transition = new FadeTransition(150, null);
        } else {
            transition = new DefaultTransition(0, null);
        }
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
        fragmentTransaction.setCustomAnimations(AnimationType.enterFakeResourceId, AnimationType.exitFakeResourceId, AnimationType.popEnterFakeResourceId, AnimationType.popExitFakeResourceId);
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

    if (isAndroidP()) {
        setupDefaultAnimations(newEntry, new FadeTransition(150, null));
    } else {
        setupDefaultAnimations(newEntry, new DefaultTransition(0, null));
    }

    printTransitions(currentEntry);
    printTransitions(newEntry);
}

export function _onFragmentCreateAnimation(entry: ExpandedEntry, fragment: android.support.v4.app.Fragment, nextAnim: number, enter: boolean): android.view.animation.Animation {
    let animation: android.view.animation.Animation;
    switch (nextAnim) {
        case AnimationType.enterFakeResourceId:
            animation = entry.enterAnimation;
            break;

        case AnimationType.exitFakeResourceId:
            animation = entry.exitAnimation;
            break;

        case AnimationType.popEnterFakeResourceId:
            animation = entry.popEnterAnimation;
            break;

        case AnimationType.popExitFakeResourceId:
            animation = entry.popExitAnimation;
            break;
    }

    if (!animation && sdkVersion() >= 21) {
        const view = fragment.getView();
        const jsParent = entry.resolvedPage.parent;
        const parent = view.getParent() || (jsParent && jsParent.nativeViewProtected);
        const animatedEntries = _getAnimatedEntries(entry.frameId);
        if (!animatedEntries || !animatedEntries.has(entry)) {
            if (parent && !(<any>parent).isLaidOut()) {
                animation = enter ? entry.defaultEnterAnimation : entry.defaultExitAnimation;
            }
        }
    }

    return animation;
}

export function _getAnimatedEntries(frameId: number): Set<BackstackEntry> {
    return waitingQueue.get(frameId);
}

export function _updateTransitions(entry: ExpandedEntry): void {
    const fragment = entry.fragment;
    const enterTransitionListener = entry.enterTransitionListener;
    if (enterTransitionListener) {
        fragment.setEnterTransition(enterTransitionListener.transition);
    }

    const exitTransitionListener = entry.exitTransitionListener;
    if (exitTransitionListener) {
        fragment.setExitTransition(exitTransitionListener.transition);
    }

    const reenterTransitionListener = entry.reenterTransitionListener;
    if (reenterTransitionListener) {
        fragment.setReenterTransition(reenterTransitionListener.transition);
    }

    const returnTransitionListener = entry.returnTransitionListener;
    if (returnTransitionListener) {
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

function getAnimationListener(): android.view.animation.Animation.AnimationListener {
    if (!AnimationListener) {
        @Interfaces([android.view.animation.Animation.AnimationListener])
        class AnimationListenerImpl extends java.lang.Object implements android.view.animation.Animation.AnimationListener {
            constructor() {
                super();
                return global.__native(this);
            }

            onAnimationStart(animation: ExpandedAnimation): void {
                const entry = animation.entry;
                addToWaitingQueue(entry);
                if (traceEnabled()) {
                    traceWrite(`START ${animation.transitionType} for ${entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onAnimationRepeat(animation: ExpandedAnimation): void {
                if (traceEnabled()) {
                    traceWrite(`REPEAT ${animation.transitionType} for ${animation.entry.fragmentTag}`, traceCategories.Transition);
                }
            }

            onAnimationEnd(animation: ExpandedAnimation): void {
                if (traceEnabled()) {
                    traceWrite(`END ${animation.transitionType} for ${animation.entry.fragmentTag}`, traceCategories.Transition);
                }

                transitionOrAnimationCompleted(animation.entry);
            }

            onAnimationCancel(animation: ExpandedAnimation): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${animation.transitionType} for ${animation.entry.fragmentTag}`, traceCategories.Transition);
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

function clearAnimationListener(animation: ExpandedAnimation): void {
    if (!animation) {
        return;
    }

    if (traceEnabled()) {
        const entry = animation.entry;
        traceWrite(`Clear ${animation.transitionType} - ${entry.transition} for ${entry.fragmentTag}`, traceCategories.Transition);
    }

    animation.setAnimationListener(null);
    animation.entry = null;
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
        clearAnimationListener(entry.enterAnimation);
        clearAnimationListener(entry.exitAnimation);
        clearAnimationListener(entry.popEnterAnimation);
        clearAnimationListener(entry.popExitAnimation);
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

    // remove previous listener if we are changing the animation.
    clearAnimationListener(entry.exitAnimation);
    clearAnimationListener(entry.popEnterAnimation);

    const exitAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.exit);
    exitAnimation.transitionType = AndroidTransitionType.exit;
    exitAnimation.entry = entry;
    exitAnimation.setAnimationListener(listener);
    entry.exitAnimation = exitAnimation;

    const popEnterAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.popEnter);
    popEnterAnimation.transitionType = AndroidTransitionType.popEnter;
    popEnterAnimation.entry = entry;
    popEnterAnimation.setAnimationListener(listener);
    entry.popEnterAnimation = popEnterAnimation;
}

function setupAllAnimation(entry: ExpandedEntry, transition: Transition): void {
    setupExitAndPopEnterAnimation(entry, transition);
    const listener = getAnimationListener();

    // setupAllAnimation is called only for new fragments so we don't 
    // need to clearAnimationListener for enter & popExit animators.
    const enterAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.enter);
    enterAnimation.transitionType = AndroidTransitionType.enter;
    enterAnimation.entry = entry;
    enterAnimation.setAnimationListener(listener);
    entry.enterAnimation = enterAnimation;

    const popExitAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.popExit);
    popExitAnimation.transitionType = AndroidTransitionType.popExit;
    popExitAnimation.entry = entry;
    popExitAnimation.setAnimationListener(listener);
    entry.popExitAnimation = popExitAnimation;
}

function setupDefaultAnimations(entry: ExpandedEntry, transition: Transition): void {
    const listener = getAnimationListener();

    const enterAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.enter);
    enterAnimation.transitionType = AndroidTransitionType.enter;
    enterAnimation.entry = entry;
    enterAnimation.setAnimationListener(listener);
    entry.defaultEnterAnimation = enterAnimation;

    const exitAnimation = <ExpandedAnimation>transition.createAndroidAnimation(AndroidTransitionType.exit);
    exitAnimation.transitionType = AndroidTransitionType.exit;
    exitAnimation.entry = entry;
    exitAnimation.setAnimationListener(listener);
    entry.defaultExitAnimation = exitAnimation;
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
            const isBack = frame._isBack;
            setTimeout(() => frame.setCurrent(current, isBack));
        }
    } else {
        completedEntries.set(frameId, entry);
    }
}

function toShortString(nativeTransition: android.transition.Transition): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
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

function initDefaultAnimations(manager: android.support.v4.app.FragmentManager): void {
    if (reflectionDone) {
        return;
    }

    reflectionDone = true;

    loadAnimationMethod = manager.getClass().getDeclaredMethod("loadAnimation", javaClassArray(android.support.v4.app.Fragment.class, java.lang.Integer.TYPE, java.lang.Boolean.TYPE, java.lang.Integer.TYPE));
    if (loadAnimationMethod != null) {
        loadAnimationMethod.setAccessible(true);

        const fragment_open = java.lang.Integer.valueOf(android.support.v4.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        const zero = java.lang.Integer.valueOf(0);
        const fragment = new android.support.v4.app.Fragment();

        // Get default enter transition.
        defaultEnterAnimationStatic = loadAnimationMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.TRUE, zero));

        // Get default exit transition.
        defaultExitAnimationStatic = loadAnimationMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.FALSE, zero));
    }
}

function getDefaultAnimation(enter: boolean): android.view.animation.Animation {
    const defaultAnimation = enter ? defaultEnterAnimationStatic : defaultExitAnimationStatic;
    return defaultAnimation ? defaultAnimation.clone() : null;
}

function createDummyZeroDurationAnimation(): android.view.animation.Animation {
    // NOTE: returning the dummy AlphaAnimation directly does not work for some reason;
    // animationEnd is fired first, then some animationStart (but for a different animation?)
    const animationSet = new android.view.animation.AnimationSet(false);
    animationSet.addAnimation(new android.view.animation.AlphaAnimation(1, 1));

    return animationSet;
}

function printTransitions(entry: ExpandedEntry) {
    if (entry && traceEnabled()) {
        let result = `${entry.fragmentTag} Transitions:`;
        if (entry.transitionName) {
            result += `transitionName=${entry.transitionName}, `;
        }

        if (entry.transition) {
            result += `enterAnimator=${entry.enterAnimation}, `;
            result += `exitAnimator=${entry.exitAnimation}, `;
            result += `popEnterAnimator=${entry.popEnterAnimation}, `;
            result += `popExitAnimator=${entry.popExitAnimation}, `;
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

class NoTransition extends Transition {
    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        return createDummyZeroDurationAnimation();
    }
}

class DefaultTransition extends Transition {
    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
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
