import { Transition as TransitionDefinition } from "ui/transition";
import { NavigationTransition } from "ui/frame";
import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, notifyEvent as traceNotifyEvent, isCategorySet } from "trace";
import * as _slideTransitionModule from "./slide-transition";
import * as _fadeTransitionModule from "./fade-transition";

let slideTransitionModule: typeof _slideTransitionModule;
let fadeTransitionModule: typeof _fadeTransitionModule;

module UIViewControllerAnimatedTransitioningMethods {
    let methodSignature = NSMethodSignature.signatureWithObjCTypes("v@:c");
    let invocation = NSInvocation.invocationWithMethodSignature(methodSignature);
    invocation.selector = "completeTransition:";

    export function completeTransition(didComplete: boolean) {
        let didCompleteReference = new interop.Reference(interop.types.bool, didComplete);
        invocation.setArgumentAtIndex(didCompleteReference, 2);
        invocation.invokeWithTarget(this);
    }
}

class AnimatedTransitioning extends NSObject implements UIViewControllerAnimatedTransitioning {
    public static ObjCProtocols = [UIViewControllerAnimatedTransitioning];

    private _transition: TransitionDefinition;
    private _operation: UINavigationControllerOperation;
    private _fromVC: UIViewController;
    private _toVC: UIViewController;
    private _transitionType: string;

    public static init(transition: TransitionDefinition, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): AnimatedTransitioning {
        let impl = <AnimatedTransitioning>AnimatedTransitioning.new();
        impl._transition = transition;
        impl._operation = operation;
        impl._fromVC = fromVC;
        impl._toVC = toVC;
        return impl;
    }

    public animateTransition(transitionContext: any): void {
        let containerView = transitionContext.valueForKey("containerView");
        let completion = UIViewControllerAnimatedTransitioningMethods.completeTransition.bind(transitionContext);
        switch (this._operation) {
            case UINavigationControllerOperation.Push: this._transitionType = "push"; break;
            case UINavigationControllerOperation.Pop: this._transitionType = "pop"; break;
            case UINavigationControllerOperation.None: this._transitionType = "none"; break;
        }

        if (traceEnabled) {
            traceWrite(`START ${this._transition} ${this._transitionType}`, traceCategories.Transition);
        }
        this._transition.animateIOSTransition(containerView, this._fromVC.view, this._toVC.view, this._operation, completion);
    }

    public transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
        return this._transition.getDuration();
    }

    public animationEnded(transitionCompleted: boolean): void {
        if (transitionCompleted) {
            if (traceEnabled) {
                traceWrite(`END ${this._transition} ${this._transitionType}`, traceCategories.Transition);
            }
        }
        else {
            if (traceEnabled) {
                traceWrite(`CANCEL ${this._transition} ${this._transitionType}`, traceCategories.Transition);
            }
        }
    }
}

let transitionId = 0;
export class Transition implements TransitionDefinition {
    private _duration: number;
    private _curve: UIViewAnimationCurve;
    private _id: number;

    constructor(duration: number, curve: UIViewAnimationCurve = UIViewAnimationCurve.EaseInOut) {
        this._duration = duration ? (duration / 1000) : 0.35;
        this._curve = curve;
        this._id = transitionId++;
    }

    public getDuration(): number {
        return this._duration;
    }

    public getCurve(): UIViewAnimationCurve {
        return this._curve;
    }

    public animateIOSTransition(containerView: UIView, fromView: UIView, toView: UIView, operation: UINavigationControllerOperation, completion: (finished: boolean) => void): void {
        throw new Error("Abstract method call");
    }

    public createAndroidAnimator(transitionType: string): any {
        throw new Error("Abstract method call");
    }

    public toString(): string {
        return `${this}@${this._id}`;
    }
}

export function _createIOSAnimatedTransitioning(navigationTransition: NavigationTransition, nativeCurve: UIViewAnimationCurve, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
    let transition: TransitionDefinition;

    if (navigationTransition.name) {
        let name = navigationTransition.name.toLowerCase();
        if (name.indexOf("slide") === 0) {
            let direction = name.substr("slide".length) || "left"; //Extract the direction from the string
            if (!slideTransitionModule) {
                //HACK: Use an absolute import to work around a webpack issue that doesn't resolve relatively-imported "xxx.android/ios" modules
                slideTransitionModule = require("ui/transition/slide-transition");
            }

            transition = new slideTransitionModule.SlideTransition(direction, navigationTransition.duration, nativeCurve);
        }
        else if (name === "fade") {
            if (!fadeTransitionModule) {
                //HACK: Use an absolute import to work around a webpack issue that doesn't resolve relatively-imported "xxx.android/ios" modules
                fadeTransitionModule = require("ui/transition/fade-transition");
            }

            transition = new fadeTransitionModule.FadeTransition(navigationTransition.duration, nativeCurve);
        }
    }
    else {
        transition = navigationTransition.instance;
    }

    if (transition) {
        return AnimatedTransitioning.init(transition, operation, fromVC, toVC);
    }

    return null;
}