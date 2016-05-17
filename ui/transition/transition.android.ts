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

interface CompleteOptions {
    isBack: boolean;
}

interface ExpandedFragment {
    enterPopExitTransition: definition.Transition;
    exitPopEnterTransition: definition.Transition;
    completePageAdditionWhenTransitionEnds: CompleteOptions;
    completePageRemovalWhenTransitionEnds: CompleteOptions;
    isDestroyed: boolean;
}

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

export function _clearBackwardTransitions(fragment: any): void {
    var expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.enterPopExitTransition) {
        if (trace.enabled) {
            trace.write(`Cleared enterPopExitTransition ${expandedFragment.enterPopExitTransition} for ${fragment.getTag()}`, trace.categories.Transition);
        }
        expandedFragment.enterPopExitTransition = undefined;
    }
    
    if (_sdkVersion() >= 21) {
        var enterTransition = (<any>fragment).getEnterTransition();
        if (enterTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Enter ${enterTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            }
            (<any>fragment).setEnterTransition(null);
        }
        var returnTransition = (<any>fragment).getReturnTransition();
        if (returnTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Pop Exit ${returnTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            }
            (<any>fragment).setReturnTransition(null);
        }
    }
}

export function _clearForwardTransitions(fragment: any): void {
    var expandedFragment = <ExpandedFragment>fragment;
    if (expandedFragment.exitPopEnterTransition) {
        if (trace.enabled) {
            trace.write(`Cleared exitPopEnterTransition ${expandedFragment.exitPopEnterTransition} for ${fragment.getTag()}`, trace.categories.Transition);
        }
        expandedFragment.exitPopEnterTransition = undefined;
    }

    if (_sdkVersion() >= 21) {
        var exitTransition = (<any>fragment).getExitTransition();
        if (exitTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Exit ${exitTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            }
            (<any>fragment).setExitTransition(null);//exit
        }
        var reenterTransition = (<any>fragment).getReenterTransition();
        if (reenterTransition) {
            if (trace.enabled) {
                trace.write(`Cleared Pop Enter ${reenterTransition.getClass().getSimpleName()} transition for ${fragment.getTag()}`, trace.categories.Transition);
            }
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
        var newexpandedFragment = <ExpandedFragment>newFragment;
        newexpandedFragment.enterPopExitTransition = transition;
        if (currentFragment) {
            var currentexpandedFragment = <ExpandedFragment>currentFragment;
            currentexpandedFragment.exitPopEnterTransition = transition;
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

export function _onFragmentShown(fragment: any, isBack: boolean): void {
    var expandedFragment = <ExpandedFragment>fragment;
    var transitionType = isBack ? "Pop Enter" : "Enter";
    var relevantTransition = isBack ? expandedFragment.exitPopEnterTransition : expandedFragment.enterPopExitTransition;
    if (relevantTransition) {
        if (trace.enabled) {
            trace.write(`${fragment.getTag() } has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page addition when transition ends.`, trace.categories.Transition);
        }
        expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        var nativeTransition = isBack ? (<any>fragment).getReenterTransition() : (<any>fragment).getEnterTransition();
        if (nativeTransition) {
            if (trace.enabled) {
                trace.write(`${fragment.getTag() } has been shown when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page addition when transition ends.`, trace.categories.Transition);
            }
            expandedFragment.completePageAdditionWhenTransitionEnds = { isBack: isBack };
        }
    }

    if (!expandedFragment.completePageAdditionWhenTransitionEnds) {
        _completePageAddition(fragment, isBack);
    }
}

export function _onFragmentHidden(fragment: any, isBack: boolean, destroyed: boolean) {
    var expandedFragment = <ExpandedFragment>fragment;
    var transitionType = isBack ? "Pop Exit" : "Exit";
    var relevantTransition = isBack ? expandedFragment.enterPopExitTransition : expandedFragment.exitPopEnterTransition;
    if (relevantTransition) {
        if (trace.enabled) {
            trace.write(`${fragment.getTag()} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${relevantTransition}. Will complete page removal when transition ends.`, trace.categories.Transition);
        }
        expandedFragment.completePageRemovalWhenTransitionEnds = { isBack: isBack };
    }
    else if (_sdkVersion() >= 21) {
        var nativeTransition = isBack ? (<any>fragment).getReturnTransition() : (<any>fragment).getExitTransition();
        if (nativeTransition) {
            if (trace.enabled) {
                trace.write(`${fragment.getTag()} has been hidden when going ${isBack ? "back" : "forward"}, but there is ${transitionType} ${nativeTransition.getClass().getSimpleName()} transition. Will complete page removal when transition ends.`, trace.categories.Transition);
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
    var expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.completePageAdditionWhenTransitionEnds = undefined;
    var frame = fragment.frame;
    var entry: frameModule.BackstackEntry = fragment.entry;
    var page: pageModule.Page = entry.resolvedPage;
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
    var expandedFragment = <ExpandedFragment>fragment;
    expandedFragment.completePageRemovalWhenTransitionEnds = undefined;
    var frame = fragment.frame;
    var entry: frameModule.BackstackEntry = fragment.entry;
    var page: pageModule.Page = entry.resolvedPage;
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
        }
    }

    entry.isNavigation = undefined;
}

function _addNativeTransitionListener(fragment: any, nativeTransition: any/*android.transition.Transition*/) {
    var expandedFragment = <ExpandedFragment>fragment;
    var transitionListener = new (<any>android).transition.Transition.TransitionListener({
        onTransitionCancel: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`CANCEL ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
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
                trace.write(`END ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
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
                trace.write(`PAUSE ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
            }
        },
        onTransitionResume: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`RESUME ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
            }
        },
        onTransitionStart: function (transition: any): void {
            if (trace.enabled) {
                trace.write(`START ${nativeTransition} transition for ${fragment}`, trace.categories.Transition);
            }
        }
    });
    nativeTransition.addListener(transitionListener);
}

export function _onFragmentCreateAnimator(fragment: any, nextAnim: number): android.animation.Animator {
    var expandedFragment = <ExpandedFragment>fragment;
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
            transition = expandedFragment.enterPopExitTransition;
            break;
        case AndroidTransitionType.exit:
        case AndroidTransitionType.popEnter:
            transition = expandedFragment.exitPopEnterTransition;
            break;
    }

    var animator: android.animation.Animator;
    if (transition) {
        animator = <android.animation.Animator>transition.createAndroidAnimator(transitionType);
        var transitionListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`START ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
                }
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`REPEAT ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
                }
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                if (trace.enabled) {
                    trace.write(`END ${transitionType} ${transition}`, trace.categories.Transition);
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
                    trace.write(`CANCEL ${transitionType} ${transition} for ${fragment.getTag()}`, trace.categories.Transition);
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
