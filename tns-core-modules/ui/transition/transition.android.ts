import { Transition as definitionTransition } from "ui/transition";
import { NavigationTransition, BackstackEntry, topmost } from "ui/frame";
import { Page} from "ui/page";
import { getClass } from "utils/types";
import { device } from "platform";
import * as animationModule from "ui/animation";
import lazy from "utils/lazy";
import trace = require("trace");

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
let animation: typeof animationModule;
function ensureAnimationModule() {
    if (!animation) {
        animation = require("ui/animation");
    }
}

let _sdkVersion = lazy(() => parseInt(device.sdkVersion));
let _defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

interface CompleteOptions {
    isBack: boolean;
}

interface ExpandedFragment {
    enterPopExitTransition: definitionTransition;
    exitPopEnterTransition: definitionTransition;
    completePageAdditionWhenTransitionEnds: CompleteOptions;
    completePageRemovalWhenTransitionEnds: CompleteOptions;
    exitHack: boolean;
    isDestroyed: boolean;
}

let enterFakeResourceId = -10;
let exitFakeResourceId = -20;
let popEnterFakeResourceId = -30;
let popExitFakeResourceId = -40;

export module AndroidTransitionType {
    export let enter: string = "enter";
    export let exit: string = "exit";
    export let popEnter: string = "popEnter";
    export let popExit: string = "popExit";
}

export function _clearBackwardTransitions(fragment: any): void {
    let expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.enterPopExitTransition) {
        if (trace.enabled) {
            trace.write(`Cleared enterPopExitTransition ${expandedFragment.enterPopExitTransition} for ${fragment}`, trace.categories.Transition);
        }
        expandedFragment.enterPopExitTransition = undefined;
    }
    
    if (_sdkVersion() >= 21) {
        let enterTransition = (<any>fragment).getEnterTransition();
        if (enterTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Enter ${enterTransition.getClass().getSimpleName() } transition for ${fragment}`, trace.categories.Transition);
            }
            (<any>fragment).setEnterTransition(null);
        }
        let returnTransition = (<any>fragment).getReturnTransition();
        if (returnTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Pop Exit ${returnTransition.getClass().getSimpleName() } transition for ${fragment}`, trace.categories.Transition);
            }
            (<any>fragment).setReturnTransition(null);
        }
    }
}

export function _clearForwardTransitions(fragment: any): void {
    let expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.exitPopEnterTransition) {
        if (trace.enabled) {
            trace.write(`Cleared exitPopEnterTransition ${expandedFragment.exitPopEnterTransition} for ${fragment}`, trace.categories.Transition);
        }
        expandedFragment.exitPopEnterTransition = undefined;
    }

    if (_sdkVersion() >= 21) {
        let exitTransition = (<any>fragment).getExitTransition();
        if (exitTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Exit ${exitTransition.getClass().getSimpleName() } transition for ${fragment}`, trace.categories.Transition);
            }
            (<any>fragment).setExitTransition(null);//exit
        }
        let reenterTransition = (<any>fragment).getReenterTransition();
        if (reenterTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Pop Enter ${reenterTransition.getClass().getSimpleName() } transition for ${fragment}`, trace.categories.Transition);
            }
            (<any>fragment).setReenterTransition(null);//popEnter
        }
    }
}

export function _setAndroidFragmentTransitions(navigationTransition: NavigationTransition, currentFragment: any, newFragment: any, fragmentTransaction: any): void {
    trace.write(`Setting Android Fragment Transitions...`, trace.categories.Transition);
    let name;
    if (navigationTransition.name) {
        name = navigationTransition.name.toLowerCase();
    }
    
    let useLollipopTransition = name && (name.indexOf("slide") === 0 || name === "fade" || name === "explode") && _sdkVersion() >= 21;
    
    // There is a problem when we have cachePagesOnNavigate on API Level 23 only.
    // The exit transition of the current fragment ends immediately, the page UI is removed from the visual tree
    // and a white spot is left in its place making the transition ugly. 
    // So we will use the "old" pre-Lollipop transitions in this particular case.
    if (topmost().android.cachePagesOnNavigate && _sdkVersion() === 23){
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
        }
    }
    else {
        let transition: definitionTransition;
        if (name) {
            if (name.indexOf("slide") === 0) {
                let direction = name.substr("slide".length) || "left"; //Extract the direction from the string
                ensureSlideTransition();
                transition = new slideTransition.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
            }
            else if (name === "fade") {
                ensureFadeTransition();
                transition = new fadeTransition.FadeTransition(navigationTransition.duration, navigationTransition.curve);
            }
            else if (name.indexOf("flip") === 0) {
                let direction = name.substr("flip".length) || "right"; //Extract the direction from the string
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
}

function _setUpNativeTransition(navigationTransition: NavigationTransition, nativeTransition: any/*android.transition.Transition*/) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }

    if (navigationTransition.curve) {
        ensureAnimationModule();
        let interpolator = animation._resolveAnimationCurve(navigationTransition.curve);
        nativeTransition.setInterpolator(interpolator);
    }
    else {
        nativeTransition.setInterpolator(_defaultInterpolator());
    }
}

export function _onFragmentShown(fragment: any, isBack: boolean): void {
    if (trace.enabled){
        trace.write(`_onFragmentShown(${fragment}, isBack: ${isBack})`, trace.categories.Transition);
    }
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionType = isBack ? "Pop Enter" : "Enter";
    let relevantTransition = isBack ? expandedFragment.exitPopEnterTransition : expandedFragment.enterPopExitTransition;
    if (relevantTransition) {
        if (trace.enabled) {
            trace.write(`${fragment} has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page addition when transition ends.`, trace.categories.Transition);
        }
        expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        let nativeTransition = isBack ? (<any>fragment).getReenterTransition() : (<any>fragment).getEnterTransition();
        if (nativeTransition) {
            if (trace.enabled) {
                trace.write(`${fragment} has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName() } transition. Will complete page addition when transition ends.`, trace.categories.Transition);
            }
            expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
        }
    }

    if (!expandedFragment.completePageAdditionWhenTransitionEnds) {
        _completePageAddition(fragment, isBack);
    }
}

export function _onFragmentHidden(fragment: any, isBack: boolean, destroyed: boolean) {
    if (trace.enabled){
        trace.write(`_onFragmentHidden(${fragment}, isBack: ${isBack}, destroyed: ${destroyed})`, trace.categories.Transition);
    }
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionType = isBack ? "Pop Exit" : "Exit";
    let relevantTransition = isBack ? expandedFragment.enterPopExitTransition : expandedFragment.exitPopEnterTransition;
    if (relevantTransition) {
        if (trace.enabled) {
            trace.write(`${fragment} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page removal when transition ends.`, trace.categories.Transition);
        }
        expandedFragment.completePageRemovalWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        let nativeTransition = isBack ? (<any>fragment).getReturnTransition() : (<any>fragment).getExitTransition();
        if (nativeTransition) {
            if (trace.enabled) {
                trace.write(`${fragment} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName() } transition. Will complete page removal when transition ends.`, trace.categories.Transition);
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
    if (trace.enabled) {
        trace.write(`STARTING ADDITION of ${page}...`, trace.categories.Transition);
    }
    // The original code that was once in Frame onFragmentShown
    frame._currentEntry = entry;
    page.onNavigatedTo(isBack);
    frame._processNavigationQueue(page);
    entry.isNavigation = undefined;
    if (trace.enabled) {
        trace.write(`ADDITION of ${page} completed`, trace.categories.Transition);
    }
}

function _completePageRemoval(fragment: any, isBack: boolean) {
    let expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.completePageRemovalWhenTransitionEnds = undefined;
    let frame = fragment._callbacks.frame;
    let entry: BackstackEntry = fragment._callbacks.entry;
    let page: Page = entry.resolvedPage;
    if (trace.enabled) {
        trace.write(`STARTING REMOVAL of ${page}...`, trace.categories.Transition);
    }
    if (page.frame) {
        frame._removeView(page);
        // This could be undefined if activity is destroyed (e.g. without actual navigation).
        if (entry.isNavigation) {
            page.onNavigatedFrom(isBack);
        }
        if (trace.enabled) {
            trace.write(`REMOVAL of ${page} completed`, trace.categories.Transition);
        }
    }
    else {
        if (trace.enabled) {
            trace.write(`REMOVAL of ${page} has already been done`, trace.categories.Transition);
        }
    }

    if (expandedFragment.isDestroyed) {
        expandedFragment.isDestroyed = undefined;
        if (page._context) {
            page._onDetached(true);
            if (trace.enabled) {
                trace.write(`DETACHMENT of ${page} completed`, trace.categories.Transition);
            }
        }
        else {
            if (trace.enabled) {
                trace.write(`DETACHMENT of ${page} has already been done`, trace.categories.Transition);
            }
            _removePageNativeViewFromAndroidParent(page);
        }
    }

    entry.isNavigation = undefined;
}

export function _removePageNativeViewFromAndroidParent(page: Page): void {
    if (page._nativeView && page._nativeView.getParent) {
        let androidParent = page._nativeView.getParent();
        if (androidParent && androidParent.removeView) {
            if (trace.enabled) {
                trace.write(`REMOVED ${page}._nativeView from its Android parent`, trace.categories.Transition);
            }
            page._onDetached(true);
            androidParent.removeView(page._nativeView);
        }
    }
}

function _toShortString(nativeTransition: any): string {
    return `${nativeTransition.getClass().getSimpleName()}@${nativeTransition.hashCode().toString(16)}`;
}

function _addNativeTransitionListener(fragment: any, nativeTransition: any/*android.transition.Transition*/) {
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionListener = new (<any>android).transition.Transition.TransitionListener({
        onTransitionCancel: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`CANCEL ${_toShortString(nativeTransition)} transition for ${fragment}`, trace.categories.Transition);
            }
            if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                _completePageRemoval(fragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
            }
            if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                _completePageAddition(fragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
            }
        },
        onTransitionEnd: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`END ${_toShortString(nativeTransition)} transition for ${fragment}`, trace.categories.Transition);
            }
            if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                _completePageRemoval(fragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
            }
            if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                _completePageAddition(fragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
            }
        },
        onTransitionPause: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`PAUSE ${_toShortString(nativeTransition)} transition for ${fragment}`, trace.categories.Transition);
            }
        },
        onTransitionResume: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`RESUME ${_toShortString(nativeTransition)} transition for ${fragment}`, trace.categories.Transition);
            }
        },
        onTransitionStart: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`START ${_toShortString(nativeTransition)} transition for ${fragment}`, trace.categories.Transition);
            }
        }
    });
    nativeTransition.addListener(transitionListener);
}

export function _onFragmentCreateAnimator(fragment: any, nextAnim: number): android.animation.Animator {
    let expandedFragment = <ExpandedFragment>fragment;
    let transitionType;
    switch (nextAnim) {
        case enterFakeResourceId: transitionType = AndroidTransitionType.enter; break;
        case exitFakeResourceId: transitionType = AndroidTransitionType.exit; break;
        case popEnterFakeResourceId: transitionType = AndroidTransitionType.popEnter; break;
        case popExitFakeResourceId: transitionType = AndroidTransitionType.popExit; break;
    }

    // Clear history hack.
    if ((nextAnim === popExitFakeResourceId || !nextAnim) && expandedFragment.exitHack) {
        // fragment is the current fragment and was popped due to clear history.
        // We have to simulate moving forward with the fragment's exit transition.
        // nextAnim can be null if the transaction which brought us to the fragment 
        // was without a transition and setCustomAnimations was not called.
        trace.write(`HACK EXIT FOR ${fragment}`, trace.categories.Transition);
        transitionType = AndroidTransitionType.exit;
    }

    let transition;
    switch (transitionType) {
        case AndroidTransitionType.enter:
        case AndroidTransitionType.popExit:
            transition = expandedFragment.enterPopExitTransition;
            break;
        case AndroidTransitionType.exit:
        case AndroidTransitionType.popEnter:
            transition = expandedFragment.exitPopEnterTransition;
            break;
    }
    
    let animator: android.animation.Animator;
    if (transition) {
        animator = <android.animation.Animator>transition.createAndroidAnimator(transitionType);
        trace.write(`${transition}.createAndroidAnimator(${transitionType}): ${animator}`, trace.categories.Transition);
        let transitionListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`START ${transitionType} ${transition} for ${fragment}`, trace.categories.Transition);
                }
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`REPEAT ${transitionType} ${transition} for ${fragment}`, trace.categories.Transition);
                }
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`END ${transitionType} ${transition} for ${fragment}`, trace.categories.Transition);
                }
                if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                    _completePageRemoval(fragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
                }
                if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                    _completePageAddition(fragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
                }
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`CANCEL ${transitionType} ${transition} for ${fragment}`, trace.categories.Transition);
                }
                if (expandedFragment.completePageRemovalWhenTransitionEnds) {
                    _completePageRemoval(fragment, expandedFragment.completePageRemovalWhenTransitionEnds.isBack);
                }
                if (expandedFragment.completePageAdditionWhenTransitionEnds) {
                    _completePageAddition(fragment, expandedFragment.completePageAdditionWhenTransitionEnds.isBack);
                }
            }
        });
        animator.addListener(transitionListener);
    }

    if (transitionType && !animator) {
        // Happens when the transaction has setCustomAnimations, but we have cleared the transitions because of CLEARING_HISTORY
        animator = _createDummyZeroDurationAnimator();
    }

    return animator;
}

export function _prepareCurrentFragmentForClearHistory(fragment: any): void {
    trace.write(`Preparing ${fragment} transitions fro clear history...`, trace.categories.Transition);
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
    if (trace.enabled) {
        trace.write(`_createDummyZeroDurationAnimator()`, trace.categories.Transition);
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
    if (f && trace.enabled){
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
        trace.write(result, trace.categories.Transition);
    }
}

export class Transition implements definitionTransition {
    private _duration: number;
    private _interpolator: android.view.animation.Interpolator;
    private _id: number;
    private static transitionId = 0;

    constructor(duration: number, curve: any) {
        this._duration = duration;
        if (curve) {
            let animation: typeof animationModule = require("ui/animation");
            this._interpolator = animation._resolveAnimationCurve(curve);
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