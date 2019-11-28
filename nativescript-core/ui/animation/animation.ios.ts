// Types
import { 
    AnimationDefinitionInternal, AnimationPromise, IOSView,
    PropertyAnimation, PropertyAnimationInfo
} from "./animation-common";
import { View } from "../core/view";

// Requires
import { 
    AnimationBase, Properties, CubicBezierAnimationCurve, 
    traceWrite, traceEnabled, traceCategories, traceType 
} from "./animation-common";
import {
    opacityProperty, backgroundColorProperty, rotateProperty,
    translateXProperty, translateYProperty, scaleXProperty, scaleYProperty,
    heightProperty, widthProperty, PercentLength
} from "../styling/style-properties";

import { screen } from "../../platform";

export * from "./animation-common";

let _transform = "_transform";
let _skip = "_skip";

let FLT_MAX = 340282346638528859811704183484516925440.000000;

class AnimationInfo {
    public propertyNameToAnimate: string;
    public fromValue: any;
    public toValue: any;
    public duration: number;
    public repeatCount: number;
    public delay: number;
}

class AnimationDelegateImpl extends NSObject implements CAAnimationDelegate {

    public nextAnimation: Function;

    // The CAAnimationDelegate protocol has been introduced in the iOS 10 SDK
    static ObjCProtocols = (<any>global).CAAnimationDelegate ? [(<any>global).CAAnimationDelegate] : [];

    private _finishedCallback: Function;
    private _propertyAnimation: PropertyAnimationInfo;
    private _valueSource: "animation" | "keyframe";

    public static initWithFinishedCallback(finishedCallback: Function, propertyAnimation: PropertyAnimationInfo, valueSource: "animation" | "keyframe"): AnimationDelegateImpl {
        let delegate = <AnimationDelegateImpl>AnimationDelegateImpl.new();
        delegate._finishedCallback = finishedCallback;
        delegate._propertyAnimation = propertyAnimation;
        delegate._valueSource = valueSource;

        return delegate;
    }

    animationDidStart(anim: CAAnimation): void {
        let value = this._propertyAnimation.value;
        let setLocal = this._valueSource === "animation";
        let targetStyle = this._propertyAnimation.target.style;

        (<IOSView>this._propertyAnimation.target)._suspendPresentationLayerUpdates();

        switch (this._propertyAnimation.property) {
            case Properties.backgroundColor:
                targetStyle[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = value;
                break;
            case Properties.opacity:
                targetStyle[setLocal ? opacityProperty.name : opacityProperty.keyframe] = value;
                break;
            case Properties.rotate:
                targetStyle[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value;
                break;
            case Properties.translate:
                targetStyle[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.x;
                targetStyle[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.y;
                break;
            case Properties.height:
                targetStyle[setLocal ? heightProperty.name : heightProperty.keyframe] = value;
                break;
            case Properties.width:
                targetStyle[setLocal ? widthProperty.name : widthProperty.keyframe] = value;
                break;
            case Properties.scale:
                targetStyle[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.x === 0 ? 0.001 : value.x;
                targetStyle[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.y === 0 ? 0.001 : value.y;
                break;
            case _transform:
                if (value[Properties.translate] !== undefined) {
                    targetStyle[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value[Properties.translate].x;
                    targetStyle[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value[Properties.translate].y;
                }
                if (value[Properties.scale] !== undefined) {
                    let x = value[Properties.scale].x;
                    let y = value[Properties.scale].y;
                    targetStyle[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = x === 0 ? 0.001 : x;
                    targetStyle[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = y === 0 ? 0.001 : y;
                }
                break;
        }

        (<IOSView>this._propertyAnimation.target)._resumePresentationLayerUpdates();
    }

    public animationDidStopFinished(anim: CAAnimation, finished: boolean): void {
        if (this._finishedCallback) {
            this._finishedCallback(!finished);
        }
        if (finished && this.nextAnimation) {
            this.nextAnimation();
        }
    }
}

export function _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | CAMediaTimingFunction): CAMediaTimingFunction | string {
    switch (curve) {
        case "easeIn":
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseIn);
        case "easeOut":
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseOut);
        case "easeInOut":
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut);
        case "linear":
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
        case "spring":
            return curve;
        case "ease":
            return CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1.0);
        default:
            if (curve instanceof CAMediaTimingFunction) {
                return curve;
            }
            else if (curve instanceof CubicBezierAnimationCurve) {
                let animationCurve = <CubicBezierAnimationCurve>curve;

                return CAMediaTimingFunction.functionWithControlPoints(animationCurve.x1, animationCurve.y1, animationCurve.x2, animationCurve.y2);
            }
            else {
                throw new Error(`Invalid animation curve: ${curve}`);
            }
    }
}

export class Animation extends AnimationBase {
    private _iOSAnimationFunction: Function;
    private _finishedAnimations: number;
    private _cancelledAnimations: number;
    private _mergedPropertyAnimations: Array<PropertyAnimationInfo>;
    private _valueSource: "animation" | "keyframe";

    constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

        this._valueSource = "animation";
        if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
            this._valueSource = animationDefinitions[0].valueSource;
        }

        if (!playSequentially) {
            if (traceEnabled()) {
                traceWrite("Non-merged Property Animations: " + this._propertyAnimations.length, traceCategories.Animation);
            }
            this._mergedPropertyAnimations = Animation._mergeAffineTransformAnimations(this._propertyAnimations);
            if (traceEnabled()) {
                traceWrite("Merged Property Animations: " + this._mergedPropertyAnimations.length, traceCategories.Animation);
            }
        }
        else {
            this._mergedPropertyAnimations = this._propertyAnimations;
        }

        let that = this;
        let animationFinishedCallback = (cancelled: boolean) => {
            if (that._playSequentially) {
                // This function will be called by the last animation when done or by another animation if the user cancels them halfway through.
                if (cancelled) {
                    that._rejectAnimationFinishedPromise();
                }
                else {
                    that._resolveAnimationFinishedPromise();
                }
            }
            else {
                // This callback will be called by each INDIVIDUAL animation when it finishes or is cancelled.
                if (cancelled) {
                    that._cancelledAnimations++;
                }
                else {
                    that._finishedAnimations++;
                }

                if (that._cancelledAnimations > 0 && (that._cancelledAnimations + that._finishedAnimations) === that._mergedPropertyAnimations.length) {
                    if (traceEnabled()) {
                        traceWrite(that._cancelledAnimations + " animations cancelled.", traceCategories.Animation);
                    }
                    that._rejectAnimationFinishedPromise();
                }
                else if (that._finishedAnimations === that._mergedPropertyAnimations.length) {
                    if (traceEnabled()) {
                        traceWrite(that._finishedAnimations + " animations finished.", traceCategories.Animation);
                    }
                    that._resolveAnimationFinishedPromise();
                }
            }
        };

        this._iOSAnimationFunction = Animation._createiOSAnimationFunction(this._mergedPropertyAnimations, 0, this._playSequentially, this._valueSource, animationFinishedCallback);
    }

    public play(): AnimationPromise {
        if (this.isPlaying) {
            return this._rejectAlreadyPlaying();
        }

        let animationFinishedPromise = super.play();
        this._finishedAnimations = 0;
        this._cancelledAnimations = 0;
        this._iOSAnimationFunction();

        return animationFinishedPromise;
    }

    public cancel(): void {
        if (!this.isPlaying) {
            traceWrite("Animation is not currently playing.", traceCategories.Animation, traceType.warn);

            return;
        }

        let i = 0;
        let length = this._mergedPropertyAnimations.length;
        for (; i < length; i++) {
            let propertyAnimation = this._mergedPropertyAnimations[i];
            propertyAnimation.target.nativeViewProtected.layer.removeAllAnimations();
            if (propertyAnimation._propertyResetCallback) {
                propertyAnimation._propertyResetCallback(propertyAnimation._originalValue, this._valueSource);
            }
        }
    }

    public _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | CAMediaTimingFunction): CAMediaTimingFunction | string {
        return _resolveAnimationCurve(curve);
    }

    private static _createiOSAnimationFunction(propertyAnimations: Array<PropertyAnimation>, index: number, playSequentially: boolean, valueSource: "animation" | "keyframe", finishedCallback: (cancelled?: boolean) => void): Function {
        return (cancelled?: boolean) => {

            if (cancelled && finishedCallback) {
                if (traceEnabled()) {
                    traceWrite("Animation " + (index - 1).toString() + " was cancelled. Will skip the rest of animations and call finishedCallback(true).", traceCategories.Animation);
                }
                finishedCallback(cancelled);

                return;
            }

            let animation = propertyAnimations[index];
            let args = Animation._getNativeAnimationArguments(animation, valueSource);

            if (animation.curve === "spring") {
                Animation._createNativeSpringAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
            }
            else {
                Animation._createNativeAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
            }
        };
    }

    private static _getNativeAnimationArguments(animation: PropertyAnimationInfo, valueSource: "animation" | "keyframe"): AnimationInfo {

        let nativeView = <UIView>animation.target.nativeViewProtected;
        let propertyNameToAnimate = animation.property;
        let toValue = animation.value;
        let fromValue;
        const parent = animation.target.parent as View;
        const screenScale: number = screen.mainScreen.scale;

        let tempRotate = (animation.target.rotate || 0) * Math.PI / 180;
        let abs;

        let setLocal = valueSource === "animation";

        switch (animation.property) {
            case Properties.backgroundColor:
                animation._originalValue = animation.target.backgroundColor;
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = value;
                };
                fromValue = nativeView.layer.backgroundColor;
                if (nativeView instanceof UILabel) {
                    nativeView.setValueForKey(UIColor.clearColor, "backgroundColor");
                }
                toValue = toValue.CGColor;
                break;
            case Properties.opacity:
                animation._originalValue = animation.target.opacity;
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? opacityProperty.name : opacityProperty.keyframe] = value;
                };
                fromValue = nativeView.layer.opacity;
                break;
            case Properties.rotate:
                animation._originalValue = animation.target.rotate !== undefined ? animation.target.rotate : 0;
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value;
                };
                propertyNameToAnimate = "transform.rotation";
                fromValue = nativeView.layer.valueForKeyPath("transform.rotation");
                if (animation.target.rotate !== undefined && animation.target.rotate !== 0 && Math.floor(toValue / 360) - toValue / 360 === 0) {
                    fromValue = animation.target.rotate * Math.PI / 180;
                }
                toValue = toValue * Math.PI / 180;
                abs = fabs(fromValue - toValue);
                if (abs < 0.001 && fromValue !== tempRotate) {
                    fromValue = tempRotate;
                }
                break;
            case Properties.translate:
                animation._originalValue = { x: animation.target.translateX, y: animation.target.translateY };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.x;
                    animation.target.style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.y;
                };
                propertyNameToAnimate = "transform";
                fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                toValue = NSValue.valueWithCATransform3D(CATransform3DTranslate(nativeView.layer.transform, toValue.x, toValue.y, 0));
                break;
            case Properties.scale:
                if (toValue.x === 0) {
                    toValue.x = 0.001;
                }
                if (toValue.y === 0) {
                    toValue.y = 0.001;
                }
                animation._originalValue = { x: animation.target.scaleX, y: animation.target.scaleY };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.x;
                    animation.target.style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.y;
                };
                propertyNameToAnimate = "transform";
                fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                toValue = NSValue.valueWithCATransform3D(CATransform3DScale(nativeView.layer.transform, toValue.x, toValue.y, 1));
                break;
            case _transform:
                fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                animation._originalValue = {
                    xs: animation.target.scaleX, ys: animation.target.scaleY,
                    xt: animation.target.translateX, yt: animation.target.translateY
                };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.xt;
                    animation.target.style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.yt;
                    animation.target.style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.xs;
                    animation.target.style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.ys;
                };
                propertyNameToAnimate = "transform";
                toValue = NSValue.valueWithCATransform3D(Animation._createNativeAffineTransform(animation));
                break;
            case Properties.width:
            case Properties.height:
                const direction: string = animation.property;
                const isHeight: boolean = direction === "height";
                propertyNameToAnimate = "bounds";
                if (!parent) {
                    throw new Error(`cannot animate ${direction} on root view`);
                }
                const parentExtent: number = isHeight ? parent.getMeasuredHeight() : parent.getMeasuredWidth();
                const asNumber = PercentLength.toDevicePixels(PercentLength.parse(toValue), parentExtent, parentExtent) / screenScale;
                let currentBounds = nativeView.layer.bounds;
                let extentX = isHeight ? currentBounds.size.width : asNumber;
                let extentY = isHeight ? asNumber : currentBounds.size.height;
                fromValue = NSValue.valueWithCGRect(currentBounds);
                toValue = NSValue.valueWithCGRect(
                    CGRectMake(currentBounds.origin.x, currentBounds.origin.y, extentX, extentY)
                );
                animation._originalValue = animation.target.height;
                animation._propertyResetCallback = (value, valueSource) => {
                    const prop = isHeight ? heightProperty : widthProperty;
                    animation.target.style[setLocal ? prop.name : prop.keyframe] = value;
                };
                break;
            default:
                throw new Error(`Animating property '${animation.property}' is unsupported`);
        }

        let duration = 0.3;
        if (animation.duration !== undefined) {
            duration = animation.duration / 1000.0;
        }

        let delay = undefined;
        if (animation.delay) {
            delay = animation.delay / 1000.0;
        }

        let repeatCount = undefined;
        if (animation.iterations !== undefined) {
            if (animation.iterations === Number.POSITIVE_INFINITY) {
                repeatCount = FLT_MAX;
            }
            else {
                repeatCount = animation.iterations;
            }
        }

        return {
            propertyNameToAnimate: propertyNameToAnimate,
            fromValue: fromValue,
            toValue: toValue,
            duration: duration,
            repeatCount: repeatCount,
            delay: delay
        };
    }

    private static _createNativeAnimation(propertyAnimations: Array<PropertyAnimation>, index: number, playSequentially: boolean, args: AnimationInfo, animation: PropertyAnimation, valueSource: "animation" | "keyframe", finishedCallback: (cancelled?: boolean) => void) {

        let nativeView = <UIView>animation.target.nativeViewProtected;
        let nativeAnimation = CABasicAnimation.animationWithKeyPath(args.propertyNameToAnimate);
        nativeAnimation.fromValue = args.fromValue;
        nativeAnimation.toValue = args.toValue;
        nativeAnimation.duration = args.duration;
        if (args.repeatCount !== undefined) {
            nativeAnimation.repeatCount = args.repeatCount;
        }
        if (args.delay !== undefined) {
            nativeAnimation.beginTime = CACurrentMediaTime() + args.delay;
        }
        if (animation.curve !== undefined) {
            nativeAnimation.timingFunction = animation.curve;
        }

        let animationDelegate = AnimationDelegateImpl.initWithFinishedCallback(finishedCallback, animation, valueSource);
        nativeAnimation.setValueForKey(animationDelegate, "delegate");

        nativeView.layer.addAnimationForKey(nativeAnimation, args.propertyNameToAnimate);

        let callback = undefined;
        if (index + 1 < propertyAnimations.length) {
            callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, valueSource, finishedCallback);
            if (!playSequentially) {
                callback();
            }
            else {
                animationDelegate.nextAnimation = callback;
            }
        }
    }

    private static _createNativeSpringAnimation(propertyAnimations: Array<PropertyAnimationInfo>, index: number, playSequentially: boolean, args: AnimationInfo, animation: PropertyAnimationInfo, valueSource: "animation" | "keyframe", finishedCallback: (cancelled?: boolean) => void) {

        let nativeView = <UIView>animation.target.nativeViewProtected;

        let callback = undefined;
        let nextAnimation;
        if (index + 1 < propertyAnimations.length) {
            callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, valueSource, finishedCallback);
            if (!playSequentially) {
                callback();
            }
            else {
                nextAnimation = callback;
            }
        }

        let delay = 0;
        if (args.delay) {
            delay = args.delay;
        }

        UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(args.duration, delay, 0.2, 0,
            UIViewAnimationOptions.CurveLinear,
            () => {
                if (args.repeatCount !== undefined) {
                    UIView.setAnimationRepeatCount(args.repeatCount);
                }

                switch (animation.property) {
                    case Properties.backgroundColor:
                        animation.target.backgroundColor = args.toValue;
                        break;
                    case Properties.opacity:
                        animation.target.opacity = args.toValue;
                        break;
                    case Properties.height:
                    case Properties.width:
                        animation._originalValue = animation.target[animation.property];
                        nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                        animation._propertyResetCallback = function (value) {
                            animation.target[animation.property] = value;
                        };
                        break;
                    case Properties.rotate:
                        nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                        break;
                    case _transform:
                        animation._originalValue = nativeView.layer.transform;
                        nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                        animation._propertyResetCallback = function (value) {
                            nativeView.layer.transform = value;
                        };
                        break;
                }
            }, function (animationDidFinish: boolean) {
                if (animationDidFinish) {
                    if (animation.property === _transform) {
                        if (animation.value[Properties.translate] !== undefined) {
                            animation.target.translateX = animation.value[Properties.translate].x;
                            animation.target.translateY = animation.value[Properties.translate].y;
                        }
                        if (animation.value[Properties.scale] !== undefined) {
                            animation.target.scaleX = animation.value[Properties.scale].x;
                            animation.target.scaleY = animation.value[Properties.scale].y;
                        }
                    }
                }
                else {
                    if (animation._propertyResetCallback) {
                        animation._propertyResetCallback(animation._originalValue);
                    }
                }
                if (finishedCallback) {
                    let cancelled = !animationDidFinish;
                    finishedCallback(cancelled);
                }
                if (animationDidFinish && nextAnimation) {
                    nextAnimation();
                }
            });
    }

    private static _createNativeAffineTransform(animation: PropertyAnimation): CATransform3D {
        let value = animation.value;
        let result: CATransform3D = CATransform3DIdentity;

        if (value[Properties.translate] !== undefined) {
            let x = value[Properties.translate].x;
            let y = value[Properties.translate].y;
            result = CATransform3DTranslate(result, x, y, 0);
        }

        if (value[Properties.scale] !== undefined) {
            let x = value[Properties.scale].x;
            let y = value[Properties.scale].y;
            result = CATransform3DScale(result, x === 0 ? 0.001 : x, y === 0 ? 0.001 : y, 1);
        }

        return result;
    }

    private static _isAffineTransform(property: string): boolean {
        return property === _transform
            || property === Properties.translate
            || property === Properties.scale;
    }

    private static _canBeMerged(animation1: PropertyAnimation, animation2: PropertyAnimation) {
        let result =
            Animation._isAffineTransform(animation1.property) &&
            Animation._isAffineTransform(animation2.property) &&
            animation1.target === animation2.target &&
            animation1.duration === animation2.duration &&
            animation1.delay === animation2.delay &&
            animation1.iterations === animation2.iterations &&
            animation1.curve === animation2.curve;

        return result;
    }

    private static _mergeAffineTransformAnimations(propertyAnimations: Array<PropertyAnimation>): Array<PropertyAnimation> {
        let result = new Array<PropertyAnimation>();

        let i = 0;
        let j;
        let length = propertyAnimations.length;
        for (; i < length; i++) {
            if (propertyAnimations[i][_skip]) {
                continue;
            }

            if (!Animation._isAffineTransform(propertyAnimations[i].property)) {
                // This is not an affine transform animation, so there is nothing to merge.
                result.push(propertyAnimations[i]);
            }
            else {
                // This animation has not been merged anywhere. Create a new transform animation.
                // The value becomes a JSON object combining all affine transforms together like this:
                // {
                //    translate: {x: 100, y: 100 },
                //    rotate: 90,
                //    scale: {x: 2, y: 2 }
                // }
                let newTransformAnimation: PropertyAnimation = {
                    target: propertyAnimations[i].target,
                    property: _transform,
                    value: {},
                    duration: propertyAnimations[i].duration,
                    delay: propertyAnimations[i].delay,
                    iterations: propertyAnimations[i].iterations,
                    curve: propertyAnimations[i].curve
                };
                if (traceEnabled()) {
                    traceWrite("Curve: " + propertyAnimations[i].curve, traceCategories.Animation);
                }
                newTransformAnimation.value[propertyAnimations[i].property] = propertyAnimations[i].value;
                if (traceEnabled()) {
                    traceWrite("Created new transform animation: " + Animation._getAnimationInfo(newTransformAnimation), traceCategories.Animation);
                }

                // Merge all compatible affine transform animations to the right into this new animation.
                j = i + 1;
                if (j < length) {
                    for (; j < length; j++) {
                        if (Animation._canBeMerged(propertyAnimations[i], propertyAnimations[j])) {
                            if (traceEnabled()) {
                                traceWrite("Merging animations: " + Animation._getAnimationInfo(newTransformAnimation) + " + " + Animation._getAnimationInfo(propertyAnimations[j]) + ";", traceCategories.Animation);
                            }
                            newTransformAnimation.value[propertyAnimations[j].property] = propertyAnimations[j].value;
                            // Mark that it has been merged so we can skip it on our outer loop.
                            propertyAnimations[j][_skip] = true;
                        }
                    }
                }

                result.push(newTransformAnimation);
            }
        }

        return result;
    }
}

export function _getTransformMismatchErrorMessage(view: View): string {
    // Order is important: translate, rotate, scale
    let result: CGAffineTransform = CGAffineTransformIdentity;
    const tx = view.translateX;
    const ty = view.translateY;
    result = CGAffineTransformTranslate(result, tx, ty);
    result = CGAffineTransformRotate(result, (view.rotate || 0) * Math.PI / 180);
    result = CGAffineTransformScale(result, view.scaleX || 1, view.scaleY || 1);
    let viewTransform = NSStringFromCGAffineTransform(result);
    let nativeTransform = NSStringFromCGAffineTransform(view.nativeViewProtected.transform);

    if (viewTransform !== nativeTransform) {
        return "View and Native transforms do not match. View: " + viewTransform + "; Native: " + nativeTransform;
    }

    return undefined;
}
