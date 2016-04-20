import definition = require("ui/transition");
import platform = require("platform");
import frameModule = require("ui/frame");
import pageModule = require("ui/page");
import * as animationModule from "ui/animation";
import types = require("utils/types");
import trace = require("trace");
import lazy from "utils/lazy";

var _sdkVersion = lazy(() => parseInt(platform.device.sdkVersion));
var _defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

var ENTER_POPEXIT_TRANSITION = "ENTER_POPEXIT_TRANSITION";
var EXIT_POPENTER_TRANSITION = "EXIT_POPENTER_TRANSITION";
var COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS = "COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS";
var COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS = "COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS";
var enterFakeResourceId = -10;
var exitFakeResourceId = -20;
var popEnterFakeResourceId = -30;
var popExitFakeResourceId = -40;

export module AndroidTransitionType {
    export var enter: string = "enter";
    export var exit: string = "exit";
    export var popEnter: string = "popEnter";
    export var popExit: string = "popExit";
}

export function _clearForwardTransitions(fragment: any): void {
    if (fragment[EXIT_POPENTER_TRANSITION]) {
        trace.write(`Cleared EXIT_POPENTER_TRANSITION ${fragment[EXIT_POPENTER_TRANSITION]} for ${fragment.getTag()}`, trace.categories.Transition);
        fragment[EXIT_POPENTER_TRANSITION] = undefined;
    }

    if (_sdkVersion() >= 21) {
        var exitTransition = (<any>fragment).getExitTransition();
        if (exitTransition) {
            trace.write(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            (<any>fragment).setExitTransition(null);//exit
        }
        var reenterTransition = (<any>fragment).getReenterTransition();
        if (reenterTransition) {
            trace.write(`Cleared Pop Enter ${reenterTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            (<any>fragment).setReenterTransition(null);//popEnter
        }
    }
}

export function _setAndroidFragmentTransitions(navigationTransition: frameModule.NavigationTransition, currentFragment: any, newFragment: any, fragmentTransaction: any): void {
    var name;
    if (navigationTransition.name) {
        name = navigationTransition.name.toLowerCase();
    }
    
    var useLollipopTransition = name && (name.indexOf("slide") === 0 || name === "fade" || name === "explode") && _sdkVersion() >= 21;
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
            var direction = name.substr("slide".length) || "left"; //Extract the direction from the string
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
        return;
    }

    var transition: definition.Transition;
    if (name) {
        if (name.indexOf("slide") === 0) {
            //HACK: Use an absolute import to work around a webpack issue that doesn't resolve relatively-imported "xxx.android/ios" modules
            var slideTransitionModule = require("ui/transition/slide-transition");
            var direction = name.substr("slide".length) || "left"; //Extract the direction from the string
            transition = new slideTransitionModule.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
        }
        else if (name === "fade") {
            //HACK: Use an absolute import to work around a webpack issue that doesn't resolve relatively-imported "xxx.android/ios" modules
            var fadeTransitionModule = require("ui/transition/fade-transition");
            transition = new fadeTransitionModule.FadeTransition(navigationTransition.duration, navigationTransition.curve);
        }
        else if (name.indexOf("flip") === 0) {
            //HACK: Use an absolute import to work around a webpack issue that doesn't resolve relatively-imported "xxx.android/ios" modules
            var flipTransitionModule = require("ui/transition/flip-transition");
            var direction = name.substr("flip".length) || "right"; //Extract the direction from the string
            transition = new flipTransitionModule.FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
        }
    }
    else {
        transition = navigationTransition.instance; // User-defined instance of Transition
    }

    if (transition) {
        newFragment[ENTER_POPEXIT_TRANSITION] = transition;
        if (currentFragment) {
            currentFragment[EXIT_POPENTER_TRANSITION] = transition;
        }
        fragmentTransaction.setCustomAnimations(enterFakeResourceId, exitFakeResourceId, popEnterFakeResourceId, popExitFakeResourceId);
    }
}

function _setUpNativeTransition(navigationTransition: frameModule.NavigationTransition, nativeTransition: any/*android.transition.Transition*/) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }

    if (navigationTransition.curve) {
        var animation: typeof animationModule = require("ui/animation");
        var interpolator = animation._resolveAnimationCurve(navigationTransition.curve);
        nativeTransition.setInterpolator(interpolator);
    }
    else {
        nativeTransition.setInterpolator(_defaultInterpolator());
    }
}

export function _onFragmentShown(fragment: android.app.Fragment, isBack: boolean): void {
    var transitionType = isBack ? "Pop Enter" : "Enter";
    var relevantTransition = isBack ? EXIT_POPENTER_TRANSITION : ENTER_POPEXIT_TRANSITION;
    if (fragment[relevantTransition]) {
        trace.write(`${fragment.getTag()} has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${fragment[relevantTransition]}. Will complete page addition when transition ends.`, trace.categories.Transition);
        fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS] = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        var nativeTransition = isBack ? (<any>fragment).getReenterTransition() : (<any>fragment).getEnterTransition();
        if (nativeTransition) {
            trace.write(`${fragment.getTag() } has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page addition when transition ends.`, trace.categories.Transition);
            fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS] = { isBack: isBack };
        }
    }

    if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS] === undefined) {
        _completePageAddition(fragment, isBack, true);
    }
}

export function _onFragmentHidden(fragment: android.app.Fragment, isBack: boolean) {
    var transitionType = isBack ? "Pop Exit" : "Exit";
    var relevantTransition = isBack ? ENTER_POPEXIT_TRANSITION : EXIT_POPENTER_TRANSITION;
    if (fragment[relevantTransition]) {
        trace.write(`${fragment.getTag()} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${fragment[relevantTransition]}. Will complete page removal when transition ends.`, trace.categories.Transition);
        fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS] = true;
    }
    else if (_sdkVersion() >= 21) {
        var nativeTransition = isBack ? (<any>fragment).getReturnTransition() : (<any>fragment).getExitTransition();
        if (nativeTransition) {
            trace.write(`${fragment.getTag()} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page removal when transition ends.`, trace.categories.Transition);
            fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS] = true;
        }
    }

    if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS] === undefined) {
        // This might be a second call if the fragment is hidden and then destroyed.
        _completePageRemoval(fragment, true, isBack);
    }
}

function _completePageAddition(fragment: android.app.Fragment, isBack: boolean, force?: boolean) {
    if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS] || force) {
        fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS] = undefined;
        var frame = (<any>fragment).frame;
        var entry: frameModule.BackstackEntry = (<any>fragment).entry;
        var page: pageModule.Page = entry.resolvedPage;
        // The original code that was once in Frame onFragmentShown
        frame._currentEntry = entry;
        page.onNavigatedTo(isBack);
        frame._processNavigationQueue(page);
        trace.write(`ADDITION of ${page} completed`, trace.categories.Transition);
    }
}

function _completePageRemoval(fragment: android.app.Fragment, force: boolean = false, isBack: boolean = false) {
    if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS] || force) {
        fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS] = undefined;
        var frame = (<any>fragment).frame;
        var entry: frameModule.BackstackEntry = (<any>fragment).entry;
        var page: pageModule.Page = entry.resolvedPage;
        if (page.frame) {
            frame._removeView(page);
            page.onNavigatedFrom(isBack);
        }
        
        trace.write(`REMOVAL of ${page} completed`, trace.categories.Transition);
    }
}

function _addNativeTransitionListener(fragment: android.app.Fragment, nativeTransition: any/*android.transition.Transition*/) {
    var transitionListener = new (<any>android).transition.Transition.TransitionListener({
        onTransitionCancel: function (transition: any): void {
            trace.write(`CANCEL ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
            if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS]) {
                _completePageRemoval(fragment);
            }
            if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS]) {
                _completePageAddition(fragment, fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS].isBack);
            }
        },
        onTransitionEnd: function (transition: any): void {
            trace.write(`END ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
            if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS]) {
                _completePageRemoval(fragment);
            }
            if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS]) {
                _completePageAddition(fragment, fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS].isBack);
            }
        },
        onTransitionPause: function (transition: any): void {
            trace.write(`PAUSE ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
        },
        onTransitionResume: function (transition: any): void {
            trace.write(`RESUME ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
        },
        onTransitionStart: function (transition: any): void {
            trace.write(`START ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
        }
    });
    nativeTransition.addListener(transitionListener);
}

export function _onFragmentCreateAnimator(fragment: android.app.Fragment, nextAnim: number): android.animation.Animator {
    var transitionType;
    switch (nextAnim) {
        case enterFakeResourceId: transitionType = AndroidTransitionType.enter; break;
        case exitFakeResourceId: transitionType = AndroidTransitionType.exit; break;
        case popEnterFakeResourceId: transitionType = AndroidTransitionType.popEnter; break;
        case popExitFakeResourceId: transitionType = AndroidTransitionType.popExit; break;
    }

    var transition;
    switch (transitionType) {
        case AndroidTransitionType.enter:
        case AndroidTransitionType.popExit:
            transition = <Transition>fragment[ENTER_POPEXIT_TRANSITION];
            break;
        case AndroidTransitionType.exit:
        case AndroidTransitionType.popEnter:
            transition = <Transition>fragment[EXIT_POPENTER_TRANSITION];
            break;
    }

    var animator: android.animation.Animator;
    if (transition) {
        animator = <android.animation.Animator>transition.createAndroidAnimator(transitionType);
        var transitionListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                trace.write(`START ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                trace.write(`REPEAT ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                trace.write(`END ${transitionType} ${transition}`, trace.categories.Transition);
                if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS]) {
                    _completePageRemoval(fragment);
                }
                if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS]) {
                    _completePageAddition(fragment, fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS].isBack);
                }
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                trace.write(`CANCEL ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
                if (fragment[COMPLETE_PAGE_REMOVAL_WHEN_TRANSITION_ENDS]) {
                    _completePageRemoval(fragment);
                }
                if (fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS]) {
                    _completePageAddition(fragment, fragment[COMPLETE_PAGE_ADDITION_WHEN_TRANSITION_ENDS].isBack);
                }
            }
        });
        animator.addListener(transitionListener);
    }

    return animator;
}

var transitionId = 0;
export class Transition implements definition.Transition {
    private _duration: number;
    private _interpolator: android.view.animation.Interpolator;
    private _id: number;

    constructor(duration: number, curve: any) {
        this._duration = duration;
        if (curve) {
            var animation: typeof animationModule = require("ui/animation");
            this._interpolator = animation._resolveAnimationCurve(curve);
        }
        else {
            this._interpolator = _defaultInterpolator();
        }
        this._id = transitionId++;
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
        return `${types.getClass(this)}@${this._id}`;
    }
}
