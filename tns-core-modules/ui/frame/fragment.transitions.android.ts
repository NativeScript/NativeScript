// Definitions.
import { NavigationTransition, BackstackEntry, Frame } from "../frame";

// Types.
import { Transition, AndroidTransitionType } from "../transition/transition";
import { SlideTransition }  from "../transition/slide-transition";
import { FadeTransition } from "../transition/fade-transition";
import { FlipTransition } from "../transition/flip-transition";
import { _resolveAnimationCurve } from "../animation";
import { device } from "../../platform";
import lazy from "../../utils/lazy";

import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories } from "../../trace";

const sdkVersion = lazy(() => parseInt(device.sdkVersion));
const intEvaluator = lazy(() => new android.animation.IntEvaluator());
const defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

const enterFakeResourceId = -10;
const exitFakeResourceId = -20;
const popEnterFakeResourceId = -30;
const popExitFakeResourceId = -40;

const waitingQueue = new Set<android.app.Fragment>();

let AnimationListener: android.animation.Animator.AnimatorListener;
let loadAnimatorMethod: java.lang.reflect.Method;
let reflectionDone: boolean;
let defaultEnterAnimatorStatic: android.animation.Animator;
let defaultExitAnimatorStatic: android.animation.Animator;
let fragmentCompleted: any;

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
    currentFragment: ExpandedFragment,
    newFragment: ExpandedFragment,
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

    let currentFragmentNeedsDifferentAnimation = false;
    if (currentFragment &&
        (currentFragment.transitionName !== name || currentFragment.transition !== transition)) {
        clearTransitions(currentFragment);
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
            setupSlideTransition(navigationTransition, newFragment, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupSlideTransition(navigationTransition, currentFragment, name, true);
            }
        } else if (name === 'fade') {
            setupFadeTransition(navigationTransition, newFragment, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupFadeTransition(navigationTransition, currentFragment, name, true);
            }
        } else if (name === 'explode') {
            setupExplodeTransition(navigationTransition, newFragment);
            if (currentFragmentNeedsDifferentAnimation) {
                setupExplodeTransition(navigationTransition, currentFragment, true);
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

    newFragment.transitionName = name;
    if (name === 'custom') {
        newFragment.transition = transition;
    }

    // Having transition means we have custom animation
    if (transition) {
        fragmentTransaction.setCustomAnimations(enterFakeResourceId, exitFakeResourceId, popEnterFakeResourceId, popExitFakeResourceId);
        setupAnimation(newFragment, transition);
        if (currentFragmentNeedsDifferentAnimation) {
            setupAnimation(currentFragment, transition, true);
        }
    }

    if (currentFragment) {
        currentFragment.transitionName = name;
        if (name === 'custom') {
            currentFragment.transition = transition;
        }
    }

    printTransitions(currentFragment);
    printTransitions(newFragment);
}

export function _onFragmentCreateAnimator(fragment: ExpandedFragment, nextAnim: number): android.animation.Animator {
    switch (nextAnim) {
        case enterFakeResourceId:
            return fragment.enterAnimator;
        case exitFakeResourceId:
            return fragment.exitAnimator;
        case popEnterFakeResourceId:
            return fragment.popEnterAnimator;
        case popExitFakeResourceId:
            return fragment.popExitAnimator;
    }

    return null;
}

interface ExpandedAnimator extends android.animation.Animator {
    transitionType?: string;
    fragment?: ExpandedFragment;
}

interface ExpandedFragment extends android.app.Fragment {
    enterAnimator: android.animation.Animator;
    exitAnimator: android.animation.Animator;
    popEnterAnimator: android.animation.Animator;
    popExitAnimator: android.animation.Animator;

    transition: Transition;
    transitionName: string;
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

function clearAnimationListener(animator: ExpandedAnimator): void {
    const fragment = animator ? animator.fragment : null;
    if (!fragment) {
        return;
    }

    if (traceEnabled()) {
        traceWrite(`Clear ${animator.transitionType} - ${fragment.transition} for ${fragment}`, traceCategories.Transition);
    }

    animator.fragment = null;
    fragment.transition = undefined;
}

function clearTransitions(fragment: ExpandedFragment): void {
    if (sdkVersion() >= 21) {
        const exitTransition = (<any>fragment).getExitTransition();
        if (exitTransition) {
            if (traceEnabled()) {
                traceWrite(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
            }
            if (exitTransition.transitionListener) {
                exitTransition.transitionListener.remove();
            }
            (<any>fragment).setExitTransition(null);//exit
        }

        const reenterTransition = (<any>fragment).getReenterTransition();
        if (reenterTransition) {
            if (traceEnabled()) {
                traceWrite(`Cleared Pop Enter ${reenterTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
            }
            if (reenterTransition.transitionListener) {
                reenterTransition.transitionListener.remove();
            }
            (<any>fragment).setReenterTransition(null);//popEnter
        }
    }
}

function allowTransitionOverlap(fragment: any): void {
    if (fragment) {
        fragment.setAllowEnterTransitionOverlap(true);
        fragment.setAllowReturnTransitionOverlap(true);
    }
}

function setEnterTransition(navigationTransition: NavigationTransition, fragment: any, transition: any): void {
    setUpNativeTransition(navigationTransition, transition);
    addNativeTransitionListener(fragment, transition);
    fragment.setEnterTransition(transition);
}

function setExitTransition(navigationTransition: NavigationTransition, fragment: any, transition: any): void {
    setUpNativeTransition(navigationTransition, transition);
    addNativeTransitionListener(fragment, transition);
    fragment.setExitTransition(transition);
}

function setReenterTransition(navigationTransition: NavigationTransition, fragment: any, transition: any): void {
    setUpNativeTransition(navigationTransition, transition);
    addNativeTransitionListener(fragment, transition);
    fragment.setReenterTransition(transition);
}

function setReturnTransition(navigationTransition: NavigationTransition, fragment: any, transition: any): void {
    setUpNativeTransition(navigationTransition, transition);
    addNativeTransitionListener(fragment, transition);
    fragment.setReturnTransition(transition);
}

function setupSlideTransition(navigationTransition: NavigationTransition, fragment: ExpandedFragment, name: string, isCurrent: boolean = false): void {
    const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
    switch (direction) {
        case "left":
            setExitTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.LEFT));
            if (!isCurrent) {
                setEnterTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.RIGHT));
            }
            break;

        case "right":
            setExitTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.RIGHT));
            if (!isCurrent) {
                setEnterTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.LEFT));
            }
            break;

        case "top":
            setExitTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.TOP));
            if (!isCurrent) {
                setEnterTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.BOTTOM));
            }
            break;

        case "bottom":
            setExitTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.BOTTOM));
            if (!isCurrent) {
                setEnterTransition(navigationTransition, fragment, new (<any>android).transition.Slide(android.view.Gravity.TOP));
            }
            break;
    }
}

function setupFadeTransition(navigationTransition: NavigationTransition, fragment: any, name: string, isCurrent: boolean = false): void {
    const fadeIn = (<any>android).transition.Fade.IN;
    const fadeOut = (<any>android).transition.Fade.OUT;

    const fadeOutExit = new (<any>android).transition.Fade(fadeOut);
    setExitTransition(navigationTransition, fragment, fadeOutExit);

    // NOTE: There is a bug in Fade transition so we need to set all 4
    // otherwise back navigation will complete immediately (won't run the reverse transition).
    const fadeInReenter = new (<any>android).transition.Fade(fadeIn);
    setReenterTransition(navigationTransition, fragment, fadeInReenter);

    if (!isCurrent) {
        const fadeInEnter = new (<any>android).transition.Fade(fadeIn);
        setEnterTransition(navigationTransition, fragment, fadeInEnter);

        const fadeOutReturn = new (<any>android).transition.Fade(fadeOut);
        setReturnTransition(navigationTransition, fragment, fadeOutReturn);
    }
}

function setupExplodeTransition(navigationTransition: NavigationTransition, newFragment: any, isCurrent: boolean = false): void {
    setExitTransition(navigationTransition, newFragment, new (<any>android).transition.Explode());
    if (!isCurrent) {
        setEnterTransition(navigationTransition, newFragment, new (<any>android).transition.Explode());
    }
}

function setupAnimation(fragment: ExpandedFragment, transition: Transition, isCurrent: boolean = false): void {
    const listener = getAnimationListener();

    const exitAnimator = transition.createAndroidAnimator(AndroidTransitionType.exit);
    exitAnimator.transitionType = AndroidTransitionType.exit;
    fragment.exitAnimator = exitAnimator;
    exitAnimator.fragment = fragment;
    exitAnimator.addListener(listener);

    const popEnterAnimator = transition.createAndroidAnimator(AndroidTransitionType.popEnter);
    popEnterAnimator.transitionType = AndroidTransitionType.popEnter;
    fragment.popEnterAnimator = popEnterAnimator;
    popEnterAnimator.fragment = fragment;
    popEnterAnimator.addListener(listener);

    if (!isCurrent) {
        const enterAnimator = transition.createAndroidAnimator(AndroidTransitionType.enter);
        enterAnimator.transitionType = AndroidTransitionType.enter;
        fragment.enterAnimator = enterAnimator;
        enterAnimator.fragment = fragment;
        enterAnimator.addListener(listener);

        const popExitAnimator = transition.createAndroidAnimator(AndroidTransitionType.popExit);
        popExitAnimator.transitionType = AndroidTransitionType.popExit;
        fragment.popExitAnimator = popExitAnimator;
        popExitAnimator.fragment = fragment;
        popExitAnimator.addListener(listener);
    }
}

function setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: any/*android.transition.Transition*/) {
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

function transitionOrAnimationCompleted(fragment: ExpandedFragment): void {
    if (transitionsCompleted(fragment)) {
        const entry: BackstackEntry = (<any>fragment)._callbacks.entry;
        const frame: Frame = (<any>fragment)._callbacks.frame;
        const isCurrent = frame.isCurrent(entry);
        const setAsCurrent = isCurrent ? fragmentCompleted : fragment;

        fragmentCompleted = null;
        setTimeout(() => frame.setCurrent(setAsCurrent._callbacks.entry));
    } else {
        fragmentCompleted = fragment;
    }
}

function toShortString(nativeTransition: any): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function addNativeTransitionListener(fragment: any, nativeTransition: any/*android.transition.Transition*/) {

    const transitionListener = new (<any>android).transition.Transition.TransitionListener({
        onTransitionCancel: function (transition: any): void {
            if (traceEnabled()) {
                traceWrite(`CANCEL ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
            }
        },
        onTransitionEnd: function (transition: any): void {
            const expandedFragment = this.fragment;
            if (traceEnabled()) {
                traceWrite(`END ${toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }

            if (expandedFragment) {
                transitionOrAnimationCompleted(expandedFragment);
            }
        },
        onTransitionPause: function (transition: any): void {
            if (traceEnabled()) {
                traceWrite(`PAUSE ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
            }
        },
        onTransitionResume: function (transition: any): void {
            if (traceEnabled()) {
                traceWrite(`RESUME ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
            }
        },
        onTransitionStart: function (transition: any): void {
            if (traceEnabled()) {
                traceWrite(`START ${toShortString(transition)} transition for ${this.fragment}`, traceCategories.Transition);
            }
        }
    });
    transitionListener.fragment = fragment;
    transitionListener.transition = nativeTransition;
    transitionListener.listener = transitionListener;
    transitionListener.remove = function () {
        if (!this.listener || !this.transition) {
            return;
        }
        this.transition.removeListener(this.listener);
        this.fragment = null;
        this.listener = null;
        this.transition.transitionListener = null;
        this.transition = null;
    };

    nativeTransition.addListener(transitionListener);
    nativeTransition.transitionListener = transitionListener;
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

function printTransitions(f: any) {
    if (f && traceEnabled()) {
        let ef = <ExpandedFragment>f;
        let result = `${ef} Transitions:`;
        result += `${ef.transition ? " exitPopEnter=" + ef.transition : ""}`;
        if (sdkVersion() >= 21) {
            result += `${f.getEnterTransition() ? " enter=" + toShortString(f.getEnterTransition()) : ""}`;
            result += `${f.getExitTransition() ? " exit=" + toShortString(f.getExitTransition()) : ""}`;
            result += `${f.getReenterTransition() ? " popEnter=" + toShortString(f.getReenterTransition()) : ""}`;
            result += `${f.getReturnTransition() ? " popExit=" + toShortString(f.getReturnTransition()) : ""}`;
        }
        traceWrite(result, traceCategories.Transition);
    }
}