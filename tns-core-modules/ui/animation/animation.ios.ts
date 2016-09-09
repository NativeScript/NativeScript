import definition = require("ui/animation");
import common = require("./animation-common");
import viewModule = require("ui/core/view");
import trace = require("trace");
import enums = require("ui/enums");
import style = require("ui/styling/style");
import dependencyObservable = require("ui/core/dependency-observable");

global.moduleMerge(common, exports);

let _transform = "_transform";
let _skip = "_skip";

let FLT_MAX = 340282346638528859811704183484516925440.000000;

declare var CASpringAnimation:any;

class AnimationInfo {
    public propertyNameToAnimate: string;
    public fromValue: any;
    public toValue: any;
    public duration: number;
    public repeatCount: number;
    public delay: number;
}

interface PropertyAnimationInfo extends common.PropertyAnimation {
    _propertyResetCallback?: any;
    _originalValue?: any;
}

interface AnimationDefinitionInternal extends definition.AnimationDefinition {
    valueSource?: number;
}

interface IOSView extends viewModule.View {
    _suspendPresentationLayerUpdates();
    _resumePresentationLayerUpdates();
    _isPresentationLayerUpdateSuspeneded();
}

class AnimationDelegateImpl extends NSObject {

    public nextAnimation: Function;

    private _finishedCallback: Function;
    private _propertyAnimation: PropertyAnimationInfo;
    private _valueSource: number;

    public static initWithFinishedCallback(finishedCallback: Function, propertyAnimation: PropertyAnimationInfo, valueSource: number): AnimationDelegateImpl {
        let delegate = <AnimationDelegateImpl>AnimationDelegateImpl.new();
        delegate._finishedCallback = finishedCallback;
        delegate._propertyAnimation = propertyAnimation;
        delegate._valueSource = valueSource;
        return delegate;
    }

    animationDidStart(anim: CAAnimation): void {
        let value = this._propertyAnimation.value;
        let valueSource = this._valueSource || dependencyObservable.ValueSource.Local;
        let targetStyle = this._propertyAnimation.target.style;

        (<IOSView>this._propertyAnimation.target)._suspendPresentationLayerUpdates();

        switch (this._propertyAnimation.property) {
            case common.Properties.backgroundColor:
                targetStyle._setValue(style.backgroundColorProperty, value, valueSource);
                break;
            case common.Properties.opacity:
                targetStyle._setValue(style.opacityProperty, value, valueSource);
                break;
            case common.Properties.rotate:
                targetStyle._setValue(style.rotateProperty, value, valueSource);
                break;
            case common.Properties.translate:
                targetStyle._setValue(style.translateXProperty, value.x, valueSource);
                targetStyle._setValue(style.translateYProperty, value.y, valueSource);
                break;
            case common.Properties.scale:
                targetStyle._setValue(style.scaleXProperty, value.x === 0 ? 0.001 : value.x, valueSource);
                targetStyle._setValue(style.scaleYProperty, value.y === 0 ? 0.001 : value.y, valueSource);
                break;
            case _transform:
                if (value[common.Properties.translate] !== undefined) {
                    targetStyle._setValue(style.translateXProperty, value[common.Properties.translate].x, valueSource);
                    targetStyle._setValue(style.translateYProperty, value[common.Properties.translate].y, valueSource);
                }
                if (value[common.Properties.scale] !== undefined) {
                    let x = value[common.Properties.scale].x;
                    let y = value[common.Properties.scale].y;
                    targetStyle._setValue(style.scaleXProperty, x === 0 ? 0.001 : x, valueSource);
                    targetStyle._setValue(style.scaleYProperty, y === 0 ? 0.001 : y, valueSource);
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

export class Animation extends common.Animation implements definition.Animation {
    private _iOSAnimationFunction: Function;
    private _finishedAnimations: number;
    private _cancelledAnimations: number;
    private _mergedPropertyAnimations: Array<PropertyAnimationInfo>;
    private _valueSource: number;

    public play(): definition.AnimationPromise {
        let animationFinishedPromise = super.play();
        this._finishedAnimations = 0;
        this._cancelledAnimations = 0;
        this._iOSAnimationFunction();
        return animationFinishedPromise;
    }

    public cancel(): void {
        super.cancel();

        let i = 0;
        let length = this._mergedPropertyAnimations.length;
        for (; i < length; i++) {
            let propertyAnimation = this._mergedPropertyAnimations[i];
            propertyAnimation.target._nativeView.layer.removeAllAnimations();
            if (propertyAnimation._propertyResetCallback) {
               propertyAnimation._propertyResetCallback(propertyAnimation._originalValue, this._valueSource);
            }
        }
    }

    constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

        if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
            this._valueSource = animationDefinitions[0].valueSource;
        }

        if (!playSequentially) {
            if (trace.enabled) {
                trace.write("Non-merged Property Animations: " + this._propertyAnimations.length, trace.categories.Animation);
            }
            this._mergedPropertyAnimations = Animation._mergeAffineTransformAnimations(this._propertyAnimations);
            if (trace.enabled) {
                trace.write("Merged Property Animations: " + this._mergedPropertyAnimations.length, trace.categories.Animation);
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
                    if (trace.enabled) {
                        trace.write(that._cancelledAnimations + " animations cancelled.", trace.categories.Animation);
                    }
                    that._rejectAnimationFinishedPromise();
                }
                else if (that._finishedAnimations === that._mergedPropertyAnimations.length) {
                    if (trace.enabled) {
                        trace.write(that._finishedAnimations + " animations finished.", trace.categories.Animation);
                    }
                    that._resolveAnimationFinishedPromise();
                }
            }
        };

        this._iOSAnimationFunction = Animation._createiOSAnimationFunction(this._mergedPropertyAnimations, 0, this._playSequentially, this._valueSource, animationFinishedCallback);
    }

    private static _createiOSAnimationFunction(propertyAnimations: Array<common.PropertyAnimation>, index: number, playSequentially: boolean, valueSource: number, finishedCallback: (cancelled?: boolean) => void): Function {
        return (cancelled?: boolean) => {

            if (cancelled && finishedCallback) {
                if (trace.enabled) {
                    trace.write("Animation " + (index - 1).toString() + " was cancelled. Will skip the rest of animations and call finishedCallback(true).", trace.categories.Animation);
                }
                finishedCallback(cancelled);
                return;
            }

           let animation = propertyAnimations[index];
           let args = Animation._getNativeAnimationArguments(animation, valueSource);

           if (animation.curve === enums.AnimationCurve.spring) {
               Animation._createNativeSpringAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
           }
           else {
               Animation._createNativeAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
           }
       }
    }

    private static _getNativeAnimationArguments(animation: PropertyAnimationInfo, valueSource: number): AnimationInfo {

        let nativeView = <UIView>animation.target._nativeView;
        let propertyNameToAnimate = animation.property;
        let value = animation.value;
        let originalValue;

        let tempRotate = (animation.target.rotate || 0) * Math.PI / 180;
        let abs;

        if (valueSource === undefined) {
            valueSource = dependencyObservable.ValueSource.Local;
        }

        switch (animation.property) {
            case common.Properties.backgroundColor:
                animation._originalValue = animation.target.backgroundColor;
                animation._propertyResetCallback = (value, valueSource) => {
                     animation.target.style._setValue(style.backgroundColorProperty, value, valueSource);
                };
                originalValue = nativeView.layer.backgroundColor;
                if (nativeView instanceof UILabel) {
                    nativeView.setValueForKey(UIColor.clearColor, "backgroundColor");
                }
                value = value.CGColor;
                break;
            case common.Properties.opacity:
                animation._originalValue = animation.target.opacity;
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style._setValue(style.opacityProperty, value, valueSource);
                };
                originalValue = nativeView.layer.opacity;
                break;
            case common.Properties.rotate:
                animation._originalValue = animation.target.rotate !== undefined ? animation.target.rotate : 0;
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style._setValue(style.rotateProperty, value, valueSource);
                };
                propertyNameToAnimate = "transform.rotation";
                originalValue = nativeView.layer.valueForKeyPath("transform.rotation");
                if (originalValue === 0 && animation.target.rotate !== undefined &&
                    animation.target.rotate !== 0 && Math.floor(value / 360) - value / 360 === 0) {
                    originalValue = animation.target.rotate * Math.PI / 180;
                }
                value = value * Math.PI / 180;
                abs = fabs(originalValue - value);
                if (abs < 0.001 && originalValue !== tempRotate) {
                    originalValue = tempRotate;
                }
                break;
            case common.Properties.translate:
                animation._originalValue = { x: animation.target.translateX, y: animation.target.translateY };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style._setValue(style.translateXProperty, value.x, valueSource);
                    animation.target.style._setValue(style.translateYProperty, value.y, valueSource);
                };
                propertyNameToAnimate = "transform";
                originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                value = NSValue.valueWithCATransform3D(CATransform3DTranslate(nativeView.layer.transform, value.x, value.y, 0));
                break;
            case common.Properties.scale:
                if (value.x === 0) {
                    value.x = 0.001;
                }
                if (value.y === 0) {
                    value.y = 0.001;
                }
                animation._originalValue = { x: animation.target.scaleX, y: animation.target.scaleY };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style._setValue(style.scaleXProperty, value.x, valueSource);
                    animation.target.style._setValue(style.scaleYProperty, value.y, valueSource);
                };
                propertyNameToAnimate = "transform";
                originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                value = NSValue.valueWithCATransform3D(CATransform3DScale(nativeView.layer.transform, value.x, value.y, 1));
                break;
            case _transform:
                originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                animation._originalValue = { xs: animation.target.scaleX, ys: animation.target.scaleY,
                                             xt: animation.target.translateX, yt: animation.target.translateY };
                animation._propertyResetCallback = (value, valueSource) => {
                    animation.target.style._setValue(style.translateXProperty, value.xt, valueSource);
                    animation.target.style._setValue(style.translateYProperty, value.yt, valueSource);
                    animation.target.style._setValue(style.scaleXProperty, value.xs, valueSource);
                    animation.target.style._setValue(style.scaleYProperty, value.ys, valueSource);
                };
                propertyNameToAnimate = "transform";
                value = NSValue.valueWithCATransform3D(Animation._createNativeAffineTransform(animation));
                break;
            default:
                throw new Error("Cannot animate " + animation.property);
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
            fromValue: originalValue,
            toValue: value,
            duration: duration,
            repeatCount: repeatCount,
            delay: delay
        };
    }

    private static _createNativeAnimation(propertyAnimations: Array<common.PropertyAnimation>, index: number, playSequentially: boolean, args: AnimationInfo, animation: common.PropertyAnimation, valueSource: number, finishedCallback: (cancelled?: boolean) => void) {

        let nativeView = <UIView>animation.target._nativeView;
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

    private static _createNativeSpringAnimation(propertyAnimations: Array<PropertyAnimationInfo>, index: number, playSequentially: boolean, args: AnimationInfo, animation: PropertyAnimationInfo, valueSource: number, finishedCallback: (cancelled?: boolean) => void) {

        let nativeView = <UIView>animation.target._nativeView;

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
                   case common.Properties.backgroundColor:
                       animation.target.backgroundColor = args.toValue;
                       break;
                   case common.Properties.opacity:
                       animation.target.opacity = args.toValue;
                       break;
                   case common.Properties.rotate:
                       nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                       break;
                   case _transform:
                       animation._originalValue = nativeView.layer.transform;
                       nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                       animation._propertyResetCallback = function (value) {
                          nativeView.layer.transform = value;
                       }
                       break;
                }
        }, function (finished: boolean) {
            if (finished) {
                if (animation.property === _transform) {
                    if (animation.value[common.Properties.translate] !== undefined) {
                         animation.target.translateX = animation.value[common.Properties.translate].x;
                         animation.target.translateY = animation.value[common.Properties.translate].y;
                    }
                    if (animation.value[common.Properties.scale] !== undefined) {
                         animation.target.scaleX = animation.value[common.Properties.scale].x;
                         animation.target.scaleY = animation.value[common.Properties.scale].y;
                    }
                }
            }
            else {
                if (animation._propertyResetCallback) {
                    animation._propertyResetCallback(animation._originalValue);
                }
            }
            if (finishedCallback) {
                let cancelled = !finished;
                finishedCallback(cancelled);
            }
            if (finished && nextAnimation) {
                nextAnimation();
            }
        });
    }

    private static _createNativeAffineTransform(animation: common.PropertyAnimation): CATransform3D {
        let value = animation.value;
        let result: CATransform3D = CATransform3DIdentity;

        if (value[common.Properties.translate] !== undefined) {
            let x = value[common.Properties.translate].x;
            let y = value[common.Properties.translate].y;
            result = CATransform3DTranslate(result, x, y, 0);
        }

        if (value[common.Properties.scale] !== undefined) {
            let x = value[common.Properties.scale].x;
            let y = value[common.Properties.scale].y;
            result = CATransform3DScale(result, x === 0 ? 0.001 : x, y === 0 ? 0.001 : y, 1);
        }

        return result;
    }

    private static _isAffineTransform(property: string): boolean {
        return property === _transform
            || property === common.Properties.translate
            || property === common.Properties.scale;
    }

    private static _canBeMerged(animation1: common.PropertyAnimation, animation2: common.PropertyAnimation) {
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

    private static _mergeAffineTransformAnimations(propertyAnimations: Array<common.PropertyAnimation>): Array<common.PropertyAnimation> {
        let result = new Array<common.PropertyAnimation>();

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
                let newTransformAnimation: common.PropertyAnimation = {
                    target: propertyAnimations[i].target,
                    property: _transform,
                    value: {},
                    duration: propertyAnimations[i].duration,
                    delay: propertyAnimations[i].delay,
                    iterations: propertyAnimations[i].iterations,
                    curve: propertyAnimations[i].curve
                };
                if (trace.enabled) {
                    trace.write("Curve: " + propertyAnimations[i].curve, trace.categories.Animation);
                }
                newTransformAnimation.value[propertyAnimations[i].property] = propertyAnimations[i].value;
                if (trace.enabled) {
                    trace.write("Created new transform animation: " + common.Animation._getAnimationInfo(newTransformAnimation), trace.categories.Animation);
                }

                // Merge all compatible affine transform animations to the right into this new animation.
                j = i + 1;
                if (j < length) {
                    for (; j < length; j++) {
                        if (Animation._canBeMerged(propertyAnimations[i], propertyAnimations[j])) {
                            if (trace.enabled) {
                                trace.write("Merging animations: " + common.Animation._getAnimationInfo(newTransformAnimation) + " + " + common.Animation._getAnimationInfo(propertyAnimations[j]) + ";", trace.categories.Animation);
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

export function _resolveAnimationCurve(curve: any): any {
    switch (curve) {
        case enums.AnimationCurve.easeIn:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseIn);
        case enums.AnimationCurve.easeOut:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseOut);
        case enums.AnimationCurve.easeInOut:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut);
        case enums.AnimationCurve.linear:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
        case enums.AnimationCurve.spring:
            return curve;
        case enums.AnimationCurve.ease:
            return CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1.0);
        default:
            if (curve instanceof CAMediaTimingFunction) {
                return curve;
            }
            else if (curve instanceof common.CubicBezierAnimationCurve) {
                let animationCurve = <common.CubicBezierAnimationCurve>curve;
                return CAMediaTimingFunction.functionWithControlPoints(animationCurve.x1, animationCurve.y1, animationCurve.x2, animationCurve.y2);
            }
            return undefined;
    }
}

export function _getTransformMismatchErrorMessage(view: viewModule.View): string {
    // Order is important: translate, rotate, scale
    let result: CGAffineTransform = CGAffineTransformIdentity;
    result = CGAffineTransformTranslate(result, view.translateX || 0, view.translateY || 0);
    result = CGAffineTransformRotate(result, (view.rotate || 0) * Math.PI / 180);
    result = CGAffineTransformScale(result, view.scaleX || 1, view.scaleY || 1);
    let viewTransform = NSStringFromCGAffineTransform(result);
    let nativeTransform = NSStringFromCGAffineTransform(view._nativeView.transform);

    if (viewTransform !== nativeTransform) {
        return "View and Native transforms do not match. View: " + viewTransform + "; Native: " + nativeTransform;
    }

    return undefined;
}