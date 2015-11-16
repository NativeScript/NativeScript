import definition = require("ui/animation");
import common = require("./animation-common");
import viewModule = require("ui/core/view");
import trace = require("trace");
import enums = require("ui/enums");

global.moduleMerge(common, exports);

var _transform = "_transform";
var _skip = "_skip";

var FLT_MAX = 340282346638528859811704183484516925440.000000;

class AnimationDelegateImpl extends NSObject {
    static new(): AnimationDelegateImpl {
        return <AnimationDelegateImpl>super.new();
    }

    private _finishedCallback: Function;

    public initWithFinishedCallback(finishedCallback: Function): AnimationDelegateImpl {
        this._finishedCallback = finishedCallback;
        return this;
    }

    public animationWillStart(animationID: string, context: any): void {
        trace.write("AnimationDelegateImpl.animationWillStart, animationID: " + animationID, trace.categories.Animation);
    }

    public animationDidStop(animationID: string, finished: boolean, context: any): void {
        trace.write("AnimationDelegateImpl.animationDidStop, animationID: " + animationID + ", finished: " + finished, trace.categories.Animation);
        if (this._finishedCallback) {
            var cancelled = !finished;
            // This could either be the master finishedCallback or an nextAnimationCallback depending on the playSequentially argument values.
            this._finishedCallback(cancelled);
        }
    }

    public static ObjCExposedMethods = {
        "animationWillStart": { returns: interop.types.void, params: [NSString, NSObject] },
        "animationDidStop": { returns: interop.types.void, params: [NSString, NSNumber, NSObject] }
    };
}

export class Animation extends common.Animation implements definition.Animation {
    private _iOSAnimationFunction: Function;
    private _finishedAnimations: number;
    private _cancelledAnimations: number;
    private _mergedPropertyAnimations: Array<common.PropertyAnimation>;

    public play(): Promise<void> {
        var animationFinishedPromise = super.play();

        this._finishedAnimations = 0;
        this._cancelledAnimations = 0;

        this._iOSAnimationFunction();
        return animationFinishedPromise;
    }

    public cancel(): void {
        super.cancel();

        var i = 0;
        var length = this._mergedPropertyAnimations.length;
        for (; i < length; i++) {
            (<UIView>this._mergedPropertyAnimations[i].target._nativeView).layer.removeAllAnimations();
            if ((<any>this._mergedPropertyAnimations[i])._propertyResetCallback) {
                (<any>this._mergedPropertyAnimations[i])._propertyResetCallback();
            }
        }
    }

    constructor(animationDefinitions: Array<definition.AnimationDefinition>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

        trace.write("Non-merged Property Animations: " + this._propertyAnimations.length, trace.categories.Animation);
        this._mergedPropertyAnimations = Animation._mergeAffineTransformAnimations(this._propertyAnimations);
        trace.write("Merged Property Animations: " + this._mergedPropertyAnimations.length, trace.categories.Animation);

        var that = this;
        var animationFinishedCallback = (cancelled: boolean) => {
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
                    trace.write(that._cancelledAnimations + " animations cancelled.", trace.categories.Animation);
                    that._rejectAnimationFinishedPromise();
                }
                else if (that._finishedAnimations === that._mergedPropertyAnimations.length) {
                    trace.write(that._finishedAnimations + " animations finished.", trace.categories.Animation);

                    // Update our properties on the view.
                    // This should not change the native transform which is already updated by the animation itself.
                    var i;
                    var len = that._propertyAnimations.length;
                    var a: common.PropertyAnimation;
                    for (i = 0; i < len; i++) {
                        a = that._propertyAnimations[i];
                        switch (a.property) {
                            case common.Properties.translate:
                                a.target.translateX = a.value.x;
                                a.target.translateY = a.value.y;
                                break;
                            case common.Properties.rotate:
                                a.target.rotate = a.value;
                                break;
                            case common.Properties.scale:
                                a.target.scaleX = a.value.x;
                                a.target.scaleY = a.value.y;
                                break;
                        }
                    }

                    // Validate that the properties of our view are aligned with the native transform matrix.
                    for (i = 0; i < len; i++) {
                        a = that._propertyAnimations[i];
                        var errorMessage = _getTransformMismatchErrorMessage(a.target);
                        if (errorMessage) {
                            throw new Error(errorMessage);
                        }
                    }

                    that._resolveAnimationFinishedPromise();
                }
            }
        };

        this._iOSAnimationFunction = Animation._createiOSAnimationFunction(this._mergedPropertyAnimations, 0, this._playSequentially, animationFinishedCallback);
    }

    _resolveAnimationCurve(curve: any): any {
        switch (curve) {
            case enums.AnimationCurve.easeIn:
                trace.write("Animation curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseIn.", trace.categories.Animation);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseIn;
            case enums.AnimationCurve.easeOut:
                trace.write("Animation curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseOut.", trace.categories.Animation);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseOut;
            case enums.AnimationCurve.easeInOut:
                trace.write("Animation curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseInOut.", trace.categories.Animation);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseInOut;
            case enums.AnimationCurve.linear:
                trace.write("Animation curve resolved to UIViewAnimationCurve.UIViewAnimationCurveLinear.", trace.categories.Animation);
                return UIViewAnimationCurve.UIViewAnimationCurveLinear;
            default:
                trace.write("Animation curve resolved to original: " + curve, trace.categories.Animation);
                return curve;
        }
    }

    private static _createiOSAnimationFunction(propertyAnimations: Array<common.PropertyAnimation>, index: number, playSequentially: boolean, finishedCallback: (cancelled?: boolean) => void): Function {
        return (cancelled?: boolean) => {
            if (cancelled && finishedCallback) {
                trace.write("Animation " + (index - 1).toString() + " was cancelled. Will skip the rest of animations and call finishedCallback(true).", trace.categories.Animation);
                finishedCallback(cancelled);
                return;
            }

            var animation = propertyAnimations[index];
            var nativeView = (<UIView>animation.target._nativeView);

            var nextAnimationCallback: Function;
            var animationDelegate: AnimationDelegateImpl;
            if (index === propertyAnimations.length - 1) {
                // This is the last animation, so tell it to call the master finishedCallback when done.
                animationDelegate = AnimationDelegateImpl.new().initWithFinishedCallback(finishedCallback);
            }
            else {
                nextAnimationCallback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, finishedCallback);
                // If animations are to be played sequentially, tell it to start the next animation when done. 
                // If played together, all individual animations will call the master finishedCallback, which increments a counter every time it is called.
                animationDelegate = AnimationDelegateImpl.new().initWithFinishedCallback(playSequentially ? nextAnimationCallback : finishedCallback);
            }

            trace.write("UIView.beginAnimationsContext(" + index + "): " + common.Animation._getAnimationInfo(animation), trace.categories.Animation);

            UIView.animateKeyframesWithDurationDelayOptionsAnimationsCompletion(1, 0,
                UIViewKeyframeAnimationOptions.UIViewKeyframeAnimationOptionBeginFromCurrentState,
                () => {
                    UIView.addKeyframeWithRelativeStartTimeRelativeDurationAnimations(0, 1, () => {
                        if (animationDelegate) {
                            UIView.setAnimationDelegate(animationDelegate);
                            UIView.setAnimationWillStartSelector("animationWillStart");
                            UIView.setAnimationDidStopSelector("animationDidStop");
                        }

                        if (animation.duration !== undefined) {
                            UIView.setAnimationDuration(animation.duration / 1000.0);
                        }
                        else {
                            UIView.setAnimationDuration(0.3); //Default duration.
                        }
                        if (animation.delay !== undefined) {
                            UIView.setAnimationDelay(animation.delay / 1000.0);
                        }
                        if (animation.iterations !== undefined) {
                            if (animation.iterations === Number.POSITIVE_INFINITY) {
                                UIView.setAnimationRepeatCount(FLT_MAX);
                            }
                            else {
                                UIView.setAnimationRepeatCount(animation.iterations - 1);
                            }
                        }
                        if (animation.curve !== undefined) {
                            UIView.setAnimationCurve(animation.curve);
                        }

                        var originalValue;
                        switch (animation.property) {
                            case common.Properties.opacity:
                                originalValue = animation.target.opacity;
                                (<any>animation)._propertyResetCallback = () => { animation.target.opacity = originalValue };
                                animation.target.opacity = animation.value;
                                break;
                            case common.Properties.backgroundColor:
                                originalValue = animation.target.backgroundColor;
                                (<any>animation)._propertyResetCallback = () => { animation.target.backgroundColor = originalValue };
                                animation.target.backgroundColor = animation.value;
                                break;
                            case _transform:
                                originalValue = nativeView.transform;
                                (<any>animation)._propertyResetCallback = () => { nativeView.transform = originalValue };
                                nativeView.transform = Animation._createNativeAffineTransform(animation);
                                break;
                            default:
                                throw new Error("Cannot animate " + animation.property);
                                break;
                        }
                    })
                },
                null
            );

            trace.write("UIView.commitAnimations " + index, trace.categories.Animation);

            if (!playSequentially && nextAnimationCallback) {
                nextAnimationCallback();
            }
        }
    }

    private static _createNativeAffineTransform(animation: common.PropertyAnimation): CGAffineTransform {
        var view = animation.target;
        var value = animation.value;

        trace.write("Creating native affine transform. Curent transform is: " + NSStringFromCGAffineTransform(view._nativeView.transform), trace.categories.Animation);
        
        // Order is important: translate, rotate, scale
        var result: CGAffineTransform = CGAffineTransformIdentity;
        trace.write("Identity: " + NSStringFromCGAffineTransform(result), trace.categories.Animation);

        if (value[common.Properties.translate] !== undefined) {
            result = CGAffineTransformTranslate(result, value[common.Properties.translate].x, value[common.Properties.translate].y);
        }
        else {
            result = CGAffineTransformTranslate(result, view.translateX, view.translateY);
        }
        trace.write("After translate: " + NSStringFromCGAffineTransform(result), trace.categories.Animation);

        if (value[common.Properties.rotate] !== undefined) {
            result = CGAffineTransformRotate(result, value[common.Properties.rotate] * Math.PI / 180);
        }
        else {
            result = CGAffineTransformRotate(result, view.rotate * Math.PI / 180);
        }
        trace.write("After rotate: " + NSStringFromCGAffineTransform(result), trace.categories.Animation);

        if (value[common.Properties.scale] !== undefined) {
            result = CGAffineTransformScale(result, value[common.Properties.scale].x, value[common.Properties.scale].y);
        }
        else {
            result = CGAffineTransformScale(result, view.scaleX, view.scaleY);
        }
        trace.write("After scale: " + NSStringFromCGAffineTransform(result), trace.categories.Animation);

        return result;
    } 

    private static _isAffineTransform(property: string): boolean {
        return property === _transform
            || property === common.Properties.translate
            || property === common.Properties.rotate
            || property === common.Properties.scale;
    }

    private static _canBeMerged(animation1: common.PropertyAnimation, animation2: common.PropertyAnimation) {
        var result =
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
        var result = new Array<common.PropertyAnimation>();

        var i = 0;
        var j;
        var length = propertyAnimations.length;
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
                var newTransformAnimation: common.PropertyAnimation = {
                    target: propertyAnimations[i].target,
                    property: _transform,
                    value: {}, 
                    duration: propertyAnimations[i].duration,
                    delay: propertyAnimations[i].delay,
                    iterations: propertyAnimations[i].iterations
                };
                newTransformAnimation.value[propertyAnimations[i].property] = propertyAnimations[i].value;
                trace.write("Created new transform animation: " + common.Animation._getAnimationInfo(newTransformAnimation), trace.categories.Animation);

                // Merge all compatible affine transform animations to the right into this new animation.
                j = i + 1;
                if (j < length) {
                    for (; j < length; j++) {
                        if (Animation._canBeMerged(propertyAnimations[i], propertyAnimations[j])) {
                            trace.write("Merging animations: " + common.Animation._getAnimationInfo(newTransformAnimation) + " + " + common.Animation._getAnimationInfo(propertyAnimations[j]) + ";", trace.categories.Animation);
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

export function _getTransformMismatchErrorMessage(view: viewModule.View): string {
    // Order is important: translate, rotate, scale
    var result: CGAffineTransform = CGAffineTransformIdentity;
    result = CGAffineTransformTranslate(result, view.translateX, view.translateY);
    result = CGAffineTransformRotate(result, view.rotate * Math.PI / 180);
    result = CGAffineTransformScale(result, view.scaleX, view.scaleY);
    var viewTransform = NSStringFromCGAffineTransform(result);
    var nativeTransform = NSStringFromCGAffineTransform(view._nativeView.transform);

    if (viewTransform !== nativeTransform) {
        return "View and Native transforms do not match. View: " + viewTransform + "; Native: " + nativeTransform;
    }

    return undefined;
}
