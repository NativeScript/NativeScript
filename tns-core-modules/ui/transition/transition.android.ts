// Definitions.
import { Transition as TransitionDefinition } from ".";
import { Page } from "../page";
import { NavigationTransition, BackstackEntry } from "../frame";

// Types.
import { getClass } from "../../utils/types";
import { device } from "../../platform";
import { _resolveAnimationCurve } from "../animation";
import lazy from "../../utils/lazy";

import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories } from "../../trace";

let slideTransition: any;
function ensureSlideTransition() {
    if (!slideTransition) {
        slideTransition = require("ui/transition/slide-transition");
    }
}
let fadeTransition: any;
function ensureFadeTransition() {
    if (!fadeTransition) {
        fadeTransition = require("ui/transition/fade-transition");
    }
}
let flipTransition: any;
function ensureFlipTransition() {
    if (!flipTransition) {
        flipTransition = require("ui/transition/flip-transition");
    }
}

let _sdkVersion = lazy(() => parseInt(device.sdkVersion));
let _defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

interface CompleteOptions {
    isBack: boolean;
}

interface ExpandedFragment {
    enterPopExitTransition: TransitionDefinition;
    enterPopExitTransitionListener: { remove(); }
    exitPopEnterTransition: TransitionDefinition;
    exitPopEnterTransitionListener: { remove(); }
    completePageAdditionWhenTransitionEnds: CompleteOptions;
    completePageRemovalWhenTransitionEnds: CompleteOptions;
    exitHack: boolean;
    isDestroyed: boolean;
}

const enterFakeResourceId = -10;
const exitFakeResourceId = -20;
const popEnterFakeResourceId = -30;
const popExitFakeResourceId = -40;

export module AndroidTransitionType {
    export const enter: string = "enter";
    export const exit: string = "exit";
    export const popEnter: string = "popEnter";
    export const popExit: string = "popExit";
}

export function _clearBackwardTransitions(fragment: any): void {
    let expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.enterPopExitTransition) {
        if (traceEnabled()) {
            traceWrite(`Cleared enterPopExitTransition ${expandedFragment.enterPopExitTransition} for ${fragment}`, traceCategories.Transition);
        }
        if (expandedFragment.enterPopExitTransitionListener) {
            expandedFragment.enterPopExitTransitionListener.remove();
        }
        expandedFragment.enterPopExitTransition = undefined;
    }

    if (_sdkVersion() >= 21) {
        let enterTransition = (<any>fragment).getEnterTransition();
        if (enterTransition) {
            if (traceEnabled()) {
                traceWrite(`Cleared Enter ${enterTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
            }
            if (enterTransition.transitionListener) {
                enterTransition.transitionListener.remove();
            }
            (<any>fragment).setEnterTransition(null);
        }
        let returnTransition = (<any>fragment).getReturnTransition();
        if (returnTransition) {
            if (traceEnabled()) {
                traceWrite(`Cleared Pop Exit ${returnTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
            }
            if (returnTransition.transitionListener) {
                returnTransition.transitionListener.remove();
            }
            (<any>fragment).setReturnTransition(null);
        }
    }
}

export function _clearForwardTransitions(fragment: any): void {
    let expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.exitPopEnterTransition) {
        if (traceEnabled()) {
            traceWrite(`Cleared exitPopEnterTransition ${expandedFragment.exitPopEnterTransition} for ${fragment}`, traceCategories.Transition);
        }
        if (expandedFragment.exitPopEnterTransitionListener) {
            expandedFragment.exitPopEnterTransitionListener.remove();
        }
        expandedFragment.exitPopEnterTransition = undefined;
    }

    if (_sdkVersion() >= 21) {
        let exitTransition = (<any>fragment).getExitTransition();
        if (exitTransition) {
            if (traceEnabled()) {
                traceWrite(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment}`, traceCategories.Transition);
            }
            if (exitTransition.transitionListener) {
                exitTransition.transitionListener.remove();
            }
            (<any>fragment).setExitTransition(null);//exit
        }
        let reenterTransition = (<any>fragment).getReenterTransition();
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

export function _setAndroidFragmentTransitions(cachePagesOnNavigate: boolean, navigationTransition: NavigationTransition, currentFragment: any, newFragment: any, fragmentTransaction: android.app.FragmentTransaction): boolean {
    traceWrite(`Setting Android Fragment Transitions...`, traceCategories.Transition);
    let name;
    if (navigationTransition.name) {
        name = navigationTransition.name.toLowerCase();
    }

    let useLollipopTransition = name && (name.indexOf("slide") === 0 || name === "fade" || name === "explode") && _sdkVersion() >= 21;

    // There is a problem when we have cachePagesOnNavigate on API Level 23 only.
    // The exit transition of the current fragment ends immediately, the page UI is removed from the visual tree
    // and a white spot is left in its place making the transition ugly. 
    // So we will use the "old" pre-Lollipop transitions in this particular case.
    if (cachePagesOnNavigate && _sdkVersion() === 23) {
        useLollipopTransition = false;
    }

    if (useLollipopTransition) {
        // setEnterTransition: Enter
        // setExitTransition: Exit
        // setReenterTransition: Pop Enter, same as Exit if not specified
        // setReturnTransition: Pop Exit, same as Enter if not specified

        newFragment.setAllowEnterTransitionOverlap(true);
        newFragment.setAllowReturnTransitionOverlap(true);
        if (currentFragment) {
            currentFragment.setAllowEnterTransitionOverlap(true);
            currentFragment.setAllowReturnTransitionOverlap(true);
        }

        if (name.indexOf("slide") === 0) {
            let direction = name.substr("slide".length) || "left"; //Extract the direction from the string
            switch (direction) {
                case "left":
                    let rightEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.RIGHT);
                    _setUpNativeTransition(navigationTransition, rightEdge);
                    _addNativeTransitionListener(newFragment, rightEdge);
                    newFragment.setEnterTransition(rightEdge);
                    if (currentFragment) {
                        let leftEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.LEFT);
                        _setUpNativeTransition(navigationTransition, leftEdge);
                        _addNativeTransitionListener(currentFragment, leftEdge);
                        currentFragment.setExitTransition(leftEdge);
                    }
                    break;
                case "right":
                    let leftEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.LEFT);
                    _setUpNativeTransition(navigationTransition, leftEdge);
                    _addNativeTransitionListener(newFragment, leftEdge);
                    newFragment.setEnterTransition(leftEdge);
                    if (currentFragment) {
                        let rightEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.RIGHT);
                        _setUpNativeTransition(navigationTransition, rightEdge);
                        _addNativeTransitionListener(currentFragment, rightEdge);
                        currentFragment.setExitTransition(rightEdge);
                    }
                    break;
                case "top":
                    let bottomEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.BOTTOM);
                    _setUpNativeTransition(navigationTransition, bottomEdge);
                    _addNativeTransitionListener(newFragment, bottomEdge);
                    newFragment.setEnterTransition(bottomEdge);
                    if (currentFragment) {
                        let topEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.TOP);
                        _setUpNativeTransition(navigationTransition, topEdge);
                        _addNativeTransitionListener(currentFragment, topEdge);
                        currentFragment.setExitTransition(topEdge);
                    }
                    break;
                case "bottom":
                    let topEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.TOP);
                    _setUpNativeTransition(navigationTransition, topEdge);
                    _addNativeTransitionListener(newFragment, topEdge);
                    newFragment.setEnterTransition(topEdge);
                    if (currentFragment) {
                        let bottomEdge = new (<any>android).transition.Slide((<any>android).view.Gravity.BOTTOM);
                        _setUpNativeTransition(navigationTransition, bottomEdge);
                        _addNativeTransitionListener(currentFragment, bottomEdge);
                        currentFragment.setExitTransition(bottomEdge);
                    }
                    break;
            }

            return true;
        }
        else if (name === "fade") {
            let fadeEnter = new (<any>android).transition.Fade((<any>android).transition.Fade.IN);
            _setUpNativeTransition(navigationTransition, fadeEnter);
            _addNativeTransitionListener(newFragment, fadeEnter);
            newFragment.setEnterTransition(fadeEnter);
            let fadeReturn = new (<any>android).transition.Fade((<any>android).transition.Fade.OUT);
            _setUpNativeTransition(navigationTransition, fadeReturn);
            _addNativeTransitionListener(newFragment, fadeReturn);
            newFragment.setReturnTransition(fadeReturn);
            if (currentFragment) {
                let fadeExit = new (<any>android).transition.Fade((<any>android).transition.Fade.OUT);
                _setUpNativeTransition(navigationTransition, fadeExit);
                _addNativeTransitionListener(currentFragment, fadeExit);
                currentFragment.setExitTransition(fadeExit);
                let fadeReenter = new (<any>android).transition.Fade((<any>android).transition.Fade.IN);
                _setUpNativeTransition(navigationTransition, fadeReenter);
                _addNativeTransitionListener(currentFragment, fadeReenter);
                currentFragment.setReenterTransition(fadeReenter);
            }

            return true;
        }
        else if (name === "explode") {
            let explodeEnter = new (<any>android).transition.Explode();
            _setUpNativeTransition(navigationTransition, explodeEnter);
            _addNativeTransitionListener(newFragment, explodeEnter);
            newFragment.setEnterTransition(explodeEnter);
            if (currentFragment) {
                let explodeExit = new (<any>android).transition.Explode();
                _setUpNativeTransition(navigationTransition, explodeExit);
                _addNativeTransitionListener(currentFragment, explodeExit);
                currentFragment.setExitTransition(explodeExit);
            }

            return true;
        }
    }
    else {
        let transition: TransitionDefinition;
        if (name) {
            if (name.indexOf("slide") === 0) {
                const direction = name.substr("slide".length) || "left"; //Extract the direction from the string
                ensureSlideTransition();
                transition = new slideTransition.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
            }
            else if (name === "fade") {
                ensureFadeTransition();
                transition = new fadeTransition.FadeTransition(navigationTransition.duration, navigationTransition.curve);
            }
            else if (name.indexOf("flip") === 0) {
                const direction = name.substr("flip".length) || "right"; //Extract the direction from the string
                ensureFlipTransition();
                transition = new flipTransition.FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
            }
        }
        else {
            transition = navigationTransition.instance; // User-defined instance of Transition
        }

        if (transition) {
            let newExpandedFragment = <ExpandedFragment>newFragment;
            newExpandedFragment.enterPopExitTransition = transition;
            if (currentFragment) {
                let currentExpandedFragment = <ExpandedFragment>currentFragment;
                currentExpandedFragment.exitPopEnterTransition = transition;
            }
            fragmentTransaction.setCustomAnimations(enterFakeResourceId, exitFakeResourceId, popEnterFakeResourceId, popExitFakeResourceId);
        }
    }

    _printTransitions(currentFragment);
    _printTransitions(newFragment);
    return false;
}

function _setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: any/*android.transition.Transition*/) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }

    if (navigationTransition.curve) {
        let interpolator = _resolveAnimationCurve(navigationTransition.curve);
        nativeTransition.setInterpolator(interpolator);
    }
    else {
        nativeTransition.setInterpolator(_defaultInterpolator());
    }
}

export function _onFragmentShown(fragment: any, isBack: boolean): void {
    if (traceEnabled()) {
        traceWrite(`_onFragmentShown(${fragment}, isBack: ${isBack})`, traceCategories.Transition);
    }
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionType = isBack ? "Pop Enter" : "Enter";
    let relevantTransition = isBack ? expandedFragment.exitPopEnterTransition : expandedFragment.enterPopExitTransition;
    if (relevantTransition) {
        if (traceEnabled()) {
            traceWrite(`${fragment} has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page addition when transition ends.`, traceCategories.Transition);
        }
        expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        let nativeTransition = isBack ? (<any>fragment).getReenterTransition() : (<any>fragment).getEnterTransition();
        if (nativeTransition) {
            if (traceEnabled()) {
                traceWrite(`${fragment} has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page addition when transition ends.`, traceCategories.Transition);
            }
            expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
        }
    }

    if (!expandedFragment.completePageAdditionWhenTransitionEnds) {
        _completePageAddition(fragment, isBack);
    }
}

export function _onFragmentHidden(fragment: any, isBack: boolean, destroyed: boolean) {
    if (traceEnabled()) {
        traceWrite(`_onFragmentHidden(${fragment}, isBack: ${isBack}, destroyed: ${destroyed})`, traceCategories.Transition);
    }
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionType = isBack ? "Pop Exit" : "Exit";
    let relevantTransition = isBack ? expandedFragment.enterPopExitTransition : expandedFragment.exitPopEnterTransition;
    if (relevantTransition) {
        if (traceEnabled()) {
            traceWrite(`${fragment} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page removal when transition ends.`, traceCategories.Transition);
        }
        expandedFragment.completePageRemovalWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        let nativeTransition = isBack ? (<any>fragment).getReturnTransition() : (<any>fragment).getExitTransition();
        if (nativeTransition) {
            if (traceEnabled()) {
                traceWrite(`${fragment} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page removal when transition ends.`, traceCategories.Transition);
            }
            expandedFragment.completePageRemovalWhenTransitionEnds = { isBack: isBack };
        }
    }

    expandedFragment.isDestroyed = destroyed;

    if (expandedFragment.completePageRemovalWhenTransitionEnds === undefined) {
        // This might be a second call if the fragment is hidden and then destroyed.
        _completePageRemoval(fragment, isBack);
    }
}

function _completePageAddition(fragment: any, isBack: boolean) {
    let expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.completePageAdditionWhenTransitionEnds = undefined;
    let frame = fragment._callbacks.frame;
    let entry: BackstackEntry = fragment._callbacks.entry;
    let page: Page = entry.resolvedPage;
    if (traceEnabled()) {
        traceWrite(`STARTING ADDITION of ${page}...`, traceCategories.Transition);
    }
    // The original code that was once in Frame onFragmentShown
    frame._currentEntry = entry;
    page.onNavigatedTo(isBack);
    entry.isNavigation = undefined;
    if (traceEnabled()) {
        traceWrite(`ADDITION of ${page} completed`, traceCategories.Transition);
    }

    frame._processNavigationQueue(page);
}

function _completePageRemoval(fragment: any, isBack: boolean) {
    let expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.completePageRemovalWhenTransitionEnds = undefined;
    let frame = fragment._callbacks.frame;
    let entry: BackstackEntry = fragment._callbacks.entry;
    let page: Page = entry.resolvedPage;
    if (page.frame) {
        // On back navigation or clearing page in backstack we remove the page from frame.
        if (isBack || expandedFragment.isDestroyed) {
            console.log(`______ REMOVE ${page}`);
            if (traceEnabled()) {
                traceWrite(`REMOVE ${page}...`, traceCategories.Transition);
            }
            frame._removeView(page);
        } else if (page.isLoaded) {
            console.log(`______ UNLOAD ${page}`);
            if (traceEnabled()) {
                traceWrite(`UNLOAD ${page}...`, traceCategories.Transition);
            }
            // Forward navigation does not remove page from frame so we raise unloaded manually.
            page.onUnloaded();
        }

        // This could be undefined if activity is destroyed (e.g. without actual navigation).
        if (entry.isNavigation) {
            page.onNavigatedFrom(isBack);
        }
    } else {
        if (traceEnabled()) {
            traceWrite(`REMOVAL of ${page} has already been done`, traceCategories.Transition);
        }
    }

    if (expandedFragment.isDestroyed) {
        expandedFragment.isDestroyed = undefined;
        if (page._context) {
            console.log(`______ TEARDOWN ${page}`);
            page._tearDownUI(true);
            if (traceEnabled()) {
                traceWrite(`DETACHMENT of ${page} completed`, traceCategories.Transition);
            }
        } else {
            if (traceEnabled()) {
                traceWrite(`DETACHMENT of ${page} has already been done`, traceCategories.Transition);
            }
            _removePageNativeViewFromAndroidParent(page);
        }
    }

    entry.isNavigation = undefined;
    frame._processNavigationQueue(page);
}

export function _removePageNativeViewFromAndroidParent(page: Page): void {
    if (page.nativeViewProtected && page.nativeViewProtected.getParent) {
        let androidParent = page.nativeViewProtected.getParent();
        if (androidParent && androidParent.removeView) {
            if (traceEnabled()) {
                traceWrite(`REMOVED ${page}.nativeView from its Android parent`, traceCategories.Transition);
            }

            if (page._context) {
                page._tearDownUI(true);
            }
            androidParent.removeView(page.nativeViewProtected);
        }
    }
}

function _toShortString(nativeTransition: any): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function _addNativeTransitionListener(fragment: any, nativeTransition: any/*android.transition.Transition*/) {

    let transitionListener = new (<any>android).transition.Transition.TransitionListener({
        onTransitionCancel: function (transition: any): void {
            let expandedFragment = this.fragment;
            if (!expandedFragment) {
                return;
            }
            if (traceEnabled()) {
                traceWrite(`CANCEL ${_toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }
            if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                _completePageRemoval(expandedFragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
            }
            if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                _completePageAddition(expandedFragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
            }
            this.checkedRemove();
        },
        onTransitionEnd: function (transition: any): void {
            let expandedFragment = this.fragment;
            if (!expandedFragment) {
                return;
            }
            if (traceEnabled()) {
                traceWrite(`END ${_toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }
            if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                _completePageRemoval(expandedFragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
            }
            if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                _completePageAddition(expandedFragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
            }
            this.checkedRemove();
        },
        onTransitionPause: function (transition: any): void {
            let expandedFragment = this.fragment;
            if (traceEnabled()) {
                traceWrite(`PAUSE ${_toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }
        },
        onTransitionResume: function (transition: any): void {
            let expandedFragment = this.fragment;
            if (traceEnabled()) {
                traceWrite(`RESUME ${_toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }
        },
        onTransitionStart: function (transition: any): void {
            let expandedFragment = this.fragment;
            if (traceEnabled()) {
                traceWrite(`START ${_toShortString(transition)} transition for ${expandedFragment}`, traceCategories.Transition);
            }
        }
    });
    transitionListener.fragment = fragment;
    transitionListener.count = 2;
    transitionListener.transition = nativeTransition;
    transitionListener.listener = transitionListener;
    transitionListener.checkedRemove = function () {
        if (--this.count) {
            return;
        }
        this.remove();
    };
    transitionListener.remove = function () {
        if (!this.listener) {
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

export function _onFragmentCreateAnimator(fragment: ExpandedFragment, nextAnim: number): android.animation.Animator {
    let transitionType: string;
    switch (nextAnim) {
        case enterFakeResourceId: transitionType = AndroidTransitionType.enter; break;
        case exitFakeResourceId: transitionType = AndroidTransitionType.exit; break;
        case popEnterFakeResourceId: transitionType = AndroidTransitionType.popEnter; break;
        case popExitFakeResourceId: transitionType = AndroidTransitionType.popExit; break;
    }

    // Clear history hack.
    if ((nextAnim === popExitFakeResourceId || !nextAnim) && fragment.exitHack) {
        // fragment is the current fragment and was popped due to clear history.
        // We have to simulate moving forward with the fragment's exit transition.
        // nextAnim can be null if the transaction which brought us to the fragment 
        // was without a transition and setCustomAnimations was not called.
        traceWrite(`HACK EXIT FOR ${fragment}`, traceCategories.Transition);
        transitionType = AndroidTransitionType.exit;
    }

    let transition;
    switch (transitionType) {
        case AndroidTransitionType.enter:
        case AndroidTransitionType.popExit:
            transition = fragment.enterPopExitTransition;
            break;
        case AndroidTransitionType.exit:
        case AndroidTransitionType.popEnter:
            transition = fragment.exitPopEnterTransition;
            break;
    }

    let animator: android.animation.Animator;
    if (transition) {
        animator = <android.animation.Animator>transition.createAndroidAnimator(transitionType);
        traceWrite(`${transition}.createAndroidAnimator(${transitionType}): ${animator}`, traceCategories.Transition);

        let transitionListener: any = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite(`START ${transitionType} ${this.transition} for ${this.fragment}`, traceCategories.Transition);
                }
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite(`REPEAT ${transitionType} ${this.transition} for ${this.fragment}`, traceCategories.Transition);
                }
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite(`END ${transitionType} ${this.transition} for ${this.fragment}`, traceCategories.Transition);
                }

                if (this.fragment.completePageRemovalWhenTransitionEnds) {
                    _completePageRemoval(this.fragment, this.fragment.completePageRemovalWhenTransitionEnds.isBack);
                }

                if (this.fragment.completePageAdditionWhenTransitionEnds) {
                    _completePageAddition(this.fragment, this.fragment.completePageAdditionWhenTransitionEnds.isBack);
                }

                this.checkedRemove();
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite(`CANCEL ${transitionType} ${this.transition} for ${this.fragment}`, traceCategories.Transition);
                }

                if (this.fragment.completePageRemovalWhenTransitionEnds) {
                    _completePageRemoval(this.fragment, this.fragment.completePageRemovalWhenTransitionEnds.isBack);
                }

                if (this.fragment.completePageAdditionWhenTransitionEnds) {
                    _completePageAddition(this.fragment, this.fragment.completePageAdditionWhenTransitionEnds.isBack);
                }

                this.checkedRemove();
            }
        });

        transitionListener.fragment = fragment;
        transitionListener.transitionType = transitionType;
        transitionListener.count = 2;
        transitionListener.listener = transitionListener;
        transitionListener.animator = animator;
        transitionListener.checkedRemove = function () {
            if (--this.count) {
                return;
            }
            this.remove();
        };
        transitionListener.remove = function () {
            if (!this.listener) {
                return;
            }
            this.animator.removeListener(this.listener);
            switch (this.transitionType) {
                case AndroidTransitionType.enter:
                case AndroidTransitionType.popExit:
                    this.fragment.enterPopExitTransitionListener = null;
                    break;
                case AndroidTransitionType.exit:
                case AndroidTransitionType.popEnter:
                    this.fragment.exitPopEnterTransitionListener = null;
                    break;
            }
            this.transitionType = null;
            this.fragment = null;
            this.listener = null;
            this.animator.transitionListener = null;
            this.animator = null;
            this.transitionType = null;
        };

        (<any>animator).transitionListener = transitionListener;
        animator.addListener(transitionListener);

        switch (transitionType) {
            case AndroidTransitionType.enter:
            case AndroidTransitionType.popExit:
                fragment.enterPopExitTransitionListener = transitionListener;
                break;
            case AndroidTransitionType.exit:
            case AndroidTransitionType.popEnter:
                fragment.exitPopEnterTransitionListener = transitionListener;
                break;
        }
    }

    if (transitionType && !animator) {
        // Happens when the transaction has setCustomAnimations, but we have cleared the transitions because of CLEARING_HISTORY
        animator = _createDummyZeroDurationAnimator();
    }

    return animator;
}

export function _prepareCurrentFragmentForClearHistory(fragment: any): void {
    traceWrite(`Preparing ${fragment} transitions fro clear history...`, traceCategories.Transition);
    let expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.exitHack = true;
    if (_sdkVersion() >= 21) {
        let exitTransition = fragment.getExitTransition();
        fragment.setReturnTransition(exitTransition);
    }
    _printTransitions(fragment);
}

let intEvaluator: android.animation.IntEvaluator;
function ensureIntEvaluator() {
    if (!intEvaluator) {
        intEvaluator = new android.animation.IntEvaluator();
    }
}

function _createDummyZeroDurationAnimator(): android.animation.Animator {
    if (traceEnabled()) {
        traceWrite(`_createDummyZeroDurationAnimator()`, traceCategories.Transition);
    }
    ensureIntEvaluator();
    let nativeArray = (<any>Array).create(java.lang.Object, 2);
    nativeArray[0] = java.lang.Integer.valueOf(0);
    nativeArray[1] = java.lang.Integer.valueOf(1);
    let animator = android.animation.ValueAnimator.ofObject(intEvaluator, nativeArray);
    animator.setDuration(0);
    return animator;
}

function _printTransitions(f: any) {
    if (f && traceEnabled) {
        let ef = <ExpandedFragment>f;
        let result = `${ef} Transitions:`;
        result += `${ef.enterPopExitTransition ? " enterPopExit=" + ef.enterPopExitTransition : ""}`;
        result += `${ef.exitPopEnterTransition ? " exitPopEnter=" + ef.exitPopEnterTransition : ""}`;
        if (_sdkVersion() >= 21) {
            result += `${f.getEnterTransition() ? " enter=" + _toShortString(f.getEnterTransition()) : ""}`;
            result += `${f.getExitTransition() ? " exit=" + _toShortString(f.getExitTransition()) : ""}`;
            result += `${f.getReenterTransition() ? " popEnter=" + _toShortString(f.getReenterTransition()) : ""}`;
            result += `${f.getReturnTransition() ? " popExit=" + _toShortString(f.getReturnTransition()) : ""}`;
        }
        traceWrite(result, traceCategories.Transition);
    }
}

export class Transition implements TransitionDefinition {
    private _duration: number;
    private _interpolator: android.view.animation.Interpolator;
    private _id: number;
    private static transitionId = 0;

    constructor(duration: number, curve: any) {
        this._duration = duration;
        if (curve) {
            this._interpolator = _resolveAnimationCurve(curve);
        }
        else {
            this._interpolator = _defaultInterpolator();
        }
        this._id = Transition.transitionId++;
    }

    public getDuration(): number {
        return this._duration;
    }

    public getCurve(): android.view.animation.Interpolator {
        return this._interpolator;
    }

    public animateIOSTransition(containerView: any, fromView: any, toView: any, operation: any, completion: (finished: boolean) => void): void {
        throw new Error("Abstract method call");
    }

    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        throw new Error("Abstract method call");
    }

    public toString(): string {
        return `${getClass(this)}@${this._id}`;
    }
}