import definition = require("ui/transition");
import frame = require("ui/frame");
import types = require("utils/types");
import trace = require("trace");
import * as _slideTransitionModule from "./slide-transition";
import * as _fadeTransitionModule from "./fade-transition";

var slideTransitionModule: typeof _slideTransitionModule;
var fadeTransitionModule: typeof _fadeTransitionModule;

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

    private _transition: definition.Transition;
    private _operation: UINavigationControllerOperation;
    private _fromVC: UIViewController;
    private _toVC: UIViewController;
    private _transitionType: string;

    public static init(transition: definition.Transition, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): AnimatedTransitioning {
        var impl = <AnimatedTransitioning>AnimatedTransitioning.new();
        impl._transition = transition;
        impl._operation = operation;
        impl._fromVC = fromVC;
        impl._toVC = toVC;
        return impl;
    }

    public animateTransition(transitionContext: any): void {
        let containerView = transitionContext.valueForKey("containerView");
        var completion = UIViewControllerAnimatedTransitioningMethods.completeTransition.bind(transitionContext);
        switch (this._operation) {
            case UINavigationControllerOperation.UINavigationControllerOperationPush: this._transitionType = "push"; break;
            case UINavigationControllerOperation.UINavigationControllerOperationPop: this._transitionType = "pop"; break;
            case UINavigationControllerOperation.UINavigationControllerOperationNone: this._transitionType = "none"; break;
        }

        trace.write(`START ${this._transition} ${this._transitionType}`, trace.categories.Transition);
        this._transition.animateIOSTransition(containerView, this._fromVC.view, this._toVC.view, this._operation, completion);
    }

    public transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
        return this._transition.getDuration();
    }

    public animationEnded(transitionCompleted: boolean): void {
        if (transitionCompleted) {
            trace.write(`END ${this._transition} ${this._transitionType}`, trace.categories.Transition);
        }
        else {
            trace.write(`CANCEL ${this._transition} ${this._transitionType}`, trace.categories.Transition);
        }
    }
}

var transitionId = 0;
export class Transition implements definition.Transition {
    private _duration: number;
    private _curve: UIViewAnimationCurve;
    private _id: number;

    constructor(duration: number, curve: UIViewAnimationCurve = UIViewAnimationCurve.UIViewAnimationCurveEaseInOut) {
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
        return `${types.getClass(this)}@${this._id}`;
    }
}

export function _createIOSAnimatedTransitioning(navigationTransition: frame.NavigationTransition, nativeCurve: UIViewAnimationCurve, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
    let transition: definition.Transition;

    if (navigationTransition.name) {
        let name = navigationTransition.name.toLowerCase();
        if (name.indexOf("slide") === 0) {
            let direction = name.substr("slide".length) || "left"; //Extract the direction from the string
            if (!slideTransitionModule) {
                slideTransitionModule = require("./slide-transition");
            }

            transition = new slideTransitionModule.SlideTransition(direction, navigationTransition.duration, nativeCurve);
        }
        else if (name === "fade") {
            if (!fadeTransitionModule) {
                fadeTransitionModule = require("./fade-transition");
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