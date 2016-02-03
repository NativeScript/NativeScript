import definition = require("ui/transition");
import frame = require("ui/frame");
import * as animationModule from "ui/animation";
import types = require("utils/types");
import trace = require("trace");

class AnimatedTransitioning extends NSObject implements UIViewControllerAnimatedTransitioning {
    public static ObjCProtocols = [UIViewControllerAnimatedTransitioning];

    private _transition: Transition;
    private _operation: UINavigationControllerOperation;
    private _fromVC: UIViewController;
    private _toVC: UIViewController;
    private _transitionType: string;

    public static init(transition: Transition, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): AnimatedTransitioning {
        var impl = <AnimatedTransitioning>AnimatedTransitioning.new();
        impl._transition = transition;
        impl._operation = operation;
        impl._fromVC = fromVC;
        impl._toVC = toVC;
        return impl;
}

    public animateTransition(transitionContext: any): void {
        let containerView = transitionContext.performSelector("containerView");
        var completion = (finished: boolean) => {
            transitionContext.performSelectorWithObject("completeTransition:", finished);
        }
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

    constructor(duration: number, curve: any) {
        this._duration = duration ? (duration / 1000) : 0.35;
        if (curve) {
            var animation: typeof animationModule = require("ui/animation");
            this._curve = animation._resolveAnimationCurve(curve);
        }
        else {
            this._curve = UIViewAnimationCurve.UIViewAnimationCurveEaseInOut;
        }
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

export function _createIOSAnimatedTransitioning(navigationTransition: frame.NavigationTransition, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
    var transition: Transition;

    if (types.isString(navigationTransition.transition)) {
        var name = navigationTransition.transition.toLowerCase();
        if (name.indexOf("slide") === 0) {
            var slideTransitionModule = require("./slide-transition");
            var direction = name.substr("slide".length) || "left"; //Extract the direction from the string
            transition = new slideTransitionModule.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
        }
        else if (name === "fade") {
            var fadeTransitionModule = require("./fade-transition");
            transition = new fadeTransitionModule.FadeTransition(navigationTransition.duration, navigationTransition.curve);
        }
    }
    else {
        transition = navigationTransition.transition;
    }

    if (transition) {
        return AnimatedTransitioning.init(transition, operation, fromVC, toVC);
    }

    return null;
}
