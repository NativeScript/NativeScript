import definition = require("ui/animation");
import common = require("ui/animation/animation-common");
import trace = require("trace");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

var _transform = "_transform";
var _skip = "_skip";

function getAnimationInfo(animation: definition.Animation): string {
    return JSON.stringify({
        target: animation.target.id ? animation.target.id : animation.target._domId,
        property: animation.property,
        value: animation.value,
        duration: animation.duration,
        delay: animation.delay,
        repeatCount: animation.repeatCount,
        iosUIViewAnimationCurve: animation.iosUIViewAnimationCurve
    });
}

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

function createiOSAnimation(animations: Array<definition.Animation>, index: number, playSequentially: boolean, finishedCallback: (cancelled?: boolean) => void): Function {
    return (cancelled?: boolean) => {
        if (cancelled && finishedCallback) {
            trace.write("Animation " + (index - 1).toString() + " was cancelled. Will skip the rest of animations and call finishedCallback(true).", trace.categories.Animation);
            finishedCallback(cancelled);
            return;
        }

        var animation = animations[index];
        var nativeView = (<UIView>animation.target._nativeView);

        var nextAnimationCallback: Function;
        var animationDelegate: AnimationDelegateImpl;
        if (index === animations.length - 1) {
            // This is the last animation, so tell it to call the master finishedCallback when done.
            animationDelegate = AnimationDelegateImpl.new().initWithFinishedCallback(finishedCallback);
        }
        else {
            nextAnimationCallback = createiOSAnimation(animations, index + 1, playSequentially, finishedCallback);
            // If animations are to be played sequentially, tell it to start the next animation when done. 
            // If played together, all individual animations will call the master finishedCallback, which increments a counter every time it is called.
            animationDelegate = AnimationDelegateImpl.new().initWithFinishedCallback(playSequentially ? nextAnimationCallback : finishedCallback);
        }

        trace.write("UIView.beginAnimationsContext("+index+"): " + getAnimationInfo(animation), trace.categories.Animation);
        UIView.beginAnimationsContext(index.toString(), null);

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
        if (animation.repeatCount !== undefined) {
            UIView.setAnimationRepeatCount(animation.repeatCount);
        }
        if (animation.iosUIViewAnimationCurve !== undefined) {
            UIView.setAnimationCurve(animation.iosUIViewAnimationCurve);
        }

        var originalValue;
        switch (animation.property) {
            case definition.Properties.opacity:
                originalValue = animation.target.opacity;
                (<any>animation)._propertyResetCallback = () => { animation.target.opacity = originalValue };
                animation.target.opacity = animation.value;
                break;
            case definition.Properties.backgroundColor:
                originalValue = animation.target.backgroundColor;
                (<any>animation)._propertyResetCallback = () => { animation.target.backgroundColor = originalValue };
                animation.target.backgroundColor = animation.value;
                break;
            case _transform:
                originalValue = nativeView.transform;
                (<any>animation)._propertyResetCallback = () => { nativeView.transform = originalValue };
                nativeView.transform = animation.value;
                break;
            default:
                throw new Error("Cannot animate " + animation.property);
                break;
        }

        trace.write("UIView.commitAnimations " + index, trace.categories.Animation);
        UIView.commitAnimations();

        if (!playSequentially && nextAnimationCallback) {
            nextAnimationCallback();
        }
    }
}

function isAffineTransform(property: string): boolean {
    return property === _transform
        || property === definition.Properties.translate
        || property === definition.Properties.rotate
        || property === definition.Properties.scale;
}

function canBeMerged(animation1: definition.Animation, animation2: definition.Animation) {
    var result =
        isAffineTransform(animation1.property) &&
        isAffineTransform(animation2.property) &&
        animation1.target === animation2.target &&
        animation1.duration === animation2.duration &&
        animation1.delay === animation2.delay &&
        animation1.repeatCount === animation2.repeatCount &&
        animation1.iosUIViewAnimationCurve === animation2.iosUIViewAnimationCurve;
    return result;
}

function affineTransform(matrix: CGAffineTransform, property: string, value: any): CGAffineTransform {
    switch (property) {
        case definition.Properties.translate:
            return CGAffineTransformTranslate(matrix, value.x, value.y);
        case definition.Properties.rotate:
            return CGAffineTransformRotate(matrix, value * Math.PI / 180);
        case definition.Properties.scale:
            return CGAffineTransformScale(matrix, value.x, value.y);
        default:
            throw new Error("Cannot create transform for" + property);
            break;
    }
}

function mergeAffineTransformAnimations(animations: Array<definition.Animation>): Array<definition.Animation> {
    var result = new Array<definition.Animation>();

    var i = 0;
    var j;
    var length = animations.length;
    for (; i < length; i++) {
        if (animations[i].property !== _skip) {

            if (!isAffineTransform(animations[i].property)) {
                // This is not an affine transform animation, so there is nothing to merge.
                result.push(animations[i]);
            }
            else {

                // This animation has not been merged anywhere. Create a new transform animation.
                var newTransformAnimation: definition.Animation = {
                    target: animations[i].target,
                    property: _transform,
                    value: affineTransform(CGAffineTransformIdentity, animations[i].property, animations[i].value),
                    duration: animations[i].duration,
                    delay: animations[i].delay,
                    repeatCount: animations[i].repeatCount,
                    iosUIViewAnimationCurve: animations[i].iosUIViewAnimationCurve
                };
                //trace.write("Created new transform animation: " + getAnimationInfo(newTransformAnimation), trace.categories.Animation);

                j = i + 1;
                if (j < length) {
                    // Merge all compatible affine transform animations to the right into this new animation.
                    for (; j < length; j++) {
                        if (canBeMerged(animations[i], animations[j])) {
                            //trace.write("Merging animations: " + getAnimationInfo(newTransformAnimation) + " + " + getAnimationInfo(animations[j]) + " = ", trace.categories.Animation);
                            //trace.write("New native transform is: " + NSStringFromCGAffineTransform(newTransformAnimation.value), trace.categories.Animation);
                            newTransformAnimation.value = affineTransform(newTransformAnimation.value, animations[j].property, animations[j].value);
                            
                            // Mark that it has been merged so we can skip it on our outer loop.
                            animations[j].property = _skip;
                        }
                    }
                }

                result.push(newTransformAnimation);
            }
        }
    }

    return result;
}

export var start = function start(animations: Array<definition.Animation>, playSequentially: boolean, finishedCallback?: (cancelled?: boolean) => void): definition.Cancelable {
    //trace.write("Non-merged: " + animations.length, trace.categories.Animation);
    var mergedAnimations = mergeAffineTransformAnimations(animations);
    //trace.write("Merged: " + mergedAnimations.length, trace.categories.Animation);

    var animationFinishedCallback: () => void;
    if (finishedCallback) {
        if (playSequentially) {
            // This callback will be called by the last animation when done or by another animation if the user cancels them halfway through.
            animationFinishedCallback = finishedCallback;
        }
        else {
            var finishedAnimations = 0;
            var cancelledAnimations = 0;
            
            // This callback will be called by each individual animation when it finishes or is cancelled.
            animationFinishedCallback = (cancelled?: boolean) => {
                if (cancelled) {
                    cancelledAnimations++;
                }
                else {
                    finishedAnimations++;
                }

                if (cancelledAnimations === mergedAnimations.length) {
                    trace.write(cancelledAnimations + " animations cancelled.", trace.categories.Animation);
                    finishedCallback(cancelled);
                    return;
                }

                if (finishedAnimations === mergedAnimations.length) {
                    trace.write(finishedAnimations + " animations finished.", trace.categories.Animation);
                    finishedCallback(cancelled);
                    return;
                }
            };
        }
    }

    var iOSAnimation = createiOSAnimation(mergedAnimations, 0, playSequentially, animationFinishedCallback);
    trace.write("Starting " + mergedAnimations.length + " animations " + (playSequentially ? "sequentially." : "together."), trace.categories.Animation);
    iOSAnimation();

    return {
        cancel: () => {
            var i = 0;
            var length = mergedAnimations.length;
            for (; i < length; i++) {
                (<UIView>mergedAnimations[i].target._nativeView).layer.removeAllAnimations();
                if ((<any>mergedAnimations[i])._propertyResetCallback) {
                    (<any>mergedAnimations[i])._propertyResetCallback();
                }
            }
        }
    };
}