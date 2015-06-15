import definition = require("ui/animation");
import common = require("ui/animation/animation-common");
import utils = require("utils/utils");
import color = require("color");
import trace = require("trace");
import types = require("utils/types");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

var density = utils.layout.getDisplayDensity();
var intType = java.lang.Integer.class.getField("TYPE").get(null);
var floatType = java.lang.Float.class.getField("TYPE").get(null);
var argbEvaluator = new android.animation.ArgbEvaluator();

function getAnimationInfo(animation: definition.Animation): string {
    return JSON.stringify({
        target: animation.target.id,
        property: animation.property,
        value: animation.value,
        duration: animation.duration,
        delay: animation.delay,
        repeatCount: animation.repeatCount,
        androidInterpolator: animation.androidInterpolator
    });
}

function createAndroidAnimators(animation: definition.Animation): any {
    trace.write("Creating ObjectAnimator(s) for animation: " + getAnimationInfo(animation) + "...", trace.categories.Animation);

    if (types.isNullOrUndefined(animation.value)) {
        throw new Error("Animation value cannot be null or undefined!");
    }

    var nativeArray;
    var nativeView = (<android.view.View>animation.target._nativeView);
    var animators = new Array<android.animation.ValueAnimator>();
    var propertyUpdateCallbacks = new Array<Function>();
    var propertyResetCallbacks = new Array<Function>();
    var animator: android.animation.ValueAnimator;
    var originalValue;
    switch (animation.property) {

        case definition.Properties.opacity:
            originalValue = nativeView.getAlpha();
            if (animation.value !== animation.target.opacity) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                propertyUpdateCallbacks.push(() => { animation.target.opacity = animation.value });
                propertyResetCallbacks.push(() => { nativeView.setAlpha(originalValue); });
            }
            break;

        case definition.Properties.backgroundColor:
            originalValue = nativeView.getBackground();
            if (!color.Color.equals(animation.value, animation.target.backgroundColor)) {
                nativeArray = java.lang.reflect.Array.newInstance(intType, 1);
                nativeArray[0] = (<color.Color>animation.value).argb;
                animator = android.animation.ObjectAnimator.ofInt(nativeView, "backgroundColor", nativeArray);
                animator.setEvaluator(argbEvaluator);
                animators.push(animator);
                propertyUpdateCallbacks.push(() => { animation.target.backgroundColor = animation.value; });
                propertyResetCallbacks.push(() => { nativeView.setBackground(originalValue); });
            }
            break;

        case definition.Properties.translate:
            originalValue = nativeView.getTranslationX();
            if (animation.value.x * density !== originalValue) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value.x * density;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray));
                propertyResetCallbacks.push(() => { nativeView.setTranslationX(originalValue); });
            }

            originalValue = nativeView.getTranslationY();
            if (animation.value.y * density !== originalValue) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value.y * density;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray));
                propertyResetCallbacks.push(() => { nativeView.setTranslationY(originalValue); });
            }
            break;

        case definition.Properties.rotate:
            originalValue = nativeView.getRotation();
            if (animation.value !== originalValue) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                propertyResetCallbacks.push(() => { nativeView.setRotation(originalValue); });
            }
            break;

        case definition.Properties.scale:
            originalValue = nativeView.getScaleX();
            if (animation.value.x !== originalValue) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value.x;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "scaleX", nativeArray));
                propertyResetCallbacks.push(() => { nativeView.setScaleX(originalValue); });
            }

            originalValue = nativeView.getScaleY();
            if (animation.value.y !== originalValue) {
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = animation.value.y;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "scaleY", nativeArray));
                propertyResetCallbacks.push(() => { nativeView.setScaleY(originalValue); });
            }
            break;

        default:
            throw new Error("Cannot animate " + animation.property);
            break;
    }

    var i = 0;
    var length = animators.length;
    for (; i < length; i++) {
        if (animation.duration) {
            animators[i].setDuration(animation.duration);
        }
        if (animation.delay) {
            animators[i].setStartDelay(animation.delay);
        }
        if (animation.repeatCount) {
            animators[i].setRepeatCount(animation.repeatCount);
        }
        if (animation.androidInterpolator) {
            animators[i].setInterpolator(animation.androidInterpolator);
        }
        trace.write("ObjectAnimator created: " + animators[i], trace.categories.Animation);
    }

    return {
        animators: animators,
        propertyUpdateCallbacks: propertyUpdateCallbacks,
        propertyResetCallbacks: propertyResetCallbacks
    };
}

export var start = function start(animations: Array<definition.Animation>, playSequentially: boolean, finishedCallback?: (cancelled?: boolean) => void): definition.Cancelable {
    var i: number;
    var length: number;

    var animators = new Array<android.animation.Animator>();
    var propertyUpdateCallbacks = new Array<Function>();
    var propertyResetCallbacks = new Array<Function>();

    i = 0;
    length = animations.length;
    for (; i < length; i++) {
        var result = createAndroidAnimators(animations[i]);
        animators = animators.concat(result.animators);
        propertyUpdateCallbacks = propertyUpdateCallbacks.concat(result.propertyUpdateCallbacks);
        propertyResetCallbacks = propertyResetCallbacks.concat(result.propertyResetCallbacks);
    }

    if (animators.length === 0) {
        if (finishedCallback) {
            finishedCallback();
        }
        return;
    }

    var nativeArray = java.lang.reflect.Array.newInstance(android.animation.Animator.class, animators.length);
    i = 0;
    length = animators.length;
    for (; i < length; i++) {
        nativeArray[i.toString()] = animators[i];
    }

    var animatorSet = new android.animation.AnimatorSet();
    if (playSequentially) {
        animatorSet.playSequentially(nativeArray);
    }
    else {
        animatorSet.playTogether(nativeArray);
    }

    var cancelled: boolean;
    animatorSet.addListener(new android.animation.Animator.AnimatorListener({
        onAnimationStart: function (animator: android.animation.Animator): void {
            trace.write("AnimatorListener.onAnimationStart.", trace.categories.Animation);
        },
        onAnimationRepeat: function (animator: android.animation.Animator): void {
            trace.write("AnimatorListener.onAnimationRepeat.", trace.categories.Animation);
        },
        onAnimationEnd: function (animator: android.animation.Animator): void {
            trace.write("AnimatorListener.onAnimationEnd.", trace.categories.Animation);
            i = 0;
            if (cancelled) {
                length = propertyResetCallbacks.length;
                for (; i < length; i++) {
                    propertyResetCallbacks[i]();
                }
            }
            else {
                length = propertyUpdateCallbacks.length;
                for (; i < length; i++) {
                    propertyUpdateCallbacks[i]();
                }
            }

            if (finishedCallback) {
                finishedCallback(cancelled);
            }
        },
        onAnimationCancel: function (animator: android.animation.Animator): void {
            trace.write("AnimatorListener.onAnimationCancel.", trace.categories.Animation);
            cancelled = true;
        }
    }));

    trace.write("Starting " + animators.length + " animations " + (playSequentially ? "sequentially." : "together."), trace.categories.Animation);
    animatorSet.start();

    return {
        cancel: () => {
            trace.write("Cancelling AnimatorSet.", trace.categories.Animation);
            animatorSet.cancel();
        }
    };
}