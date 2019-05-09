// Definitions.
import { AnimationDefinition } from ".";
import { View } from "../core/view";

import { AnimationBase, Properties, PropertyAnimation, CubicBezierAnimationCurve, AnimationPromise, Color, traceWrite, traceEnabled, traceCategories, traceType } from "./animation-common";
import {
    opacityProperty, backgroundColorProperty, rotateProperty,
    translateXProperty, translateYProperty, scaleXProperty, scaleYProperty,
    heightProperty, widthProperty, PercentLength
} from "../styling/style-properties";

import { layout } from "../../utils/utils";
import { device, screen } from "../../platform";
import lazy from "../../utils/lazy";
export * from "./animation-common";

interface AnimationDefinitionInternal extends AnimationDefinition {
    valueSource?: "animation" | "keyframe";
}

let argbEvaluator: android.animation.ArgbEvaluator;
function ensureArgbEvaluator() {
    if (!argbEvaluator) {
        argbEvaluator = new android.animation.ArgbEvaluator();
    }
}

let easeIn = lazy(() => new android.view.animation.AccelerateInterpolator(1));
let easeOut = lazy(() => new android.view.animation.DecelerateInterpolator(1));
let easeInOut = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());
let linear = lazy(() => new android.view.animation.LinearInterpolator());
let bounce = lazy(() => new android.view.animation.BounceInterpolator());

let keyPrefix = "ui.animation.";
let propertyKeys = {};
propertyKeys[Properties.backgroundColor] = Symbol(keyPrefix + Properties.backgroundColor);
propertyKeys[Properties.opacity] = Symbol(keyPrefix + Properties.opacity);
propertyKeys[Properties.rotate] = Symbol(keyPrefix + Properties.rotate);
propertyKeys[Properties.scale] = Symbol(keyPrefix + Properties.scale);
propertyKeys[Properties.translate] = Symbol(keyPrefix + Properties.translate);
propertyKeys[Properties.height] = Symbol(keyPrefix + Properties.height);
propertyKeys[Properties.width] = Symbol(keyPrefix + Properties.width);

export function _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator): android.view.animation.Interpolator {
    switch (curve) {
        case "easeIn":
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to android.view.animation.AccelerateInterpolator(1).", traceCategories.Animation);
            }
            return easeIn();
        case "easeOut":
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to android.view.animation.DecelerateInterpolator(1).", traceCategories.Animation);
            }
            return easeOut();
        case "easeInOut":
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to android.view.animation.AccelerateDecelerateInterpolator().", traceCategories.Animation);
            }
            return easeInOut();
        case "linear":
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to android.view.animation.LinearInterpolator().", traceCategories.Animation);
            }
            return linear();
        case "spring":
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to android.view.animation.BounceInterpolator().", traceCategories.Animation);
            }
            return bounce();
        case "ease":
            return (<any>android).support.v4.view.animation.PathInterpolatorCompat.create(0.25, 0.1, 0.25, 1.0);
        default:
            if (traceEnabled()) {
                traceWrite("Animation curve resolved to original: " + curve, traceCategories.Animation);
            }
            if (curve instanceof CubicBezierAnimationCurve) {
                return (<any>android).support.v4.view.animation.PathInterpolatorCompat.create(curve.x1, curve.y1, curve.x2, curve.y2);
            } else if (curve && (<any>curve).getInterpolation) {
                return <android.view.animation.Interpolator>curve;
            } else if ((<any>curve) instanceof android.view.animation.LinearInterpolator) {
                return <android.view.animation.Interpolator>curve;
            } else {
                throw new Error(`Invalid animation curve: ${curve}`);
            }
    }
}

export class Animation extends AnimationBase {
    private _animatorListener: android.animation.Animator.AnimatorListener;
    private _nativeAnimatorsArray: any;
    private _animatorSet: android.animation.AnimatorSet;
    private _animators: Array<android.animation.Animator>;
    private _propertyUpdateCallbacks: Array<Function>;
    private _propertyResetCallbacks: Array<Function>;
    private _valueSource: "animation" | "keyframe";
    private _target: View;
    private _resetOnFinish: boolean = true;

    constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

        this._valueSource = "animation";
        if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
            this._valueSource = animationDefinitions[0].valueSource;
        }

        let that = new WeakRef(this);
        this._animatorListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite("MainAnimatorListener.onAndroidAnimationStart(" + animator + ")", traceCategories.Animation);
                }
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite("MainAnimatorListener.onAnimationRepeat(" + animator + ")", traceCategories.Animation);
                }
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite("MainAnimatorListener.onAnimationEnd(" + animator + ")", traceCategories.Animation);
                }
                const thisRef = that.get();
                if (thisRef) {
                    thisRef._onAndroidAnimationEnd();
                }
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite("MainAnimatorListener.onAnimationCancel(" + animator + ")", traceCategories.Animation);
                }
                const thisRef = that.get();
                if (thisRef) {
                    thisRef._onAndroidAnimationCancel();
                }
            }
        });
    }

    public play(resetOnFinish?: boolean): AnimationPromise {
        if (resetOnFinish !== undefined) {
            this._resetOnFinish = resetOnFinish;
        }

        if (this.isPlaying) {
            return this._rejectAlreadyPlaying();
        }

        if (this._animatorSet) {
            return this._play();
        }

        this._animators = new Array<android.animation.Animator>();
        this._propertyUpdateCallbacks = new Array<Function>();
        this._propertyResetCallbacks = new Array<Function>();

        for (let i = 0, length = this._propertyAnimations.length; i < length; i++) {
            this._createAnimators(this._propertyAnimations[i]);
        }

        this._nativeAnimatorsArray = Array.create(android.animation.Animator, this._animators.length);
        for (let i = 0, length = this._animators.length; i < length; i++) {
            this._nativeAnimatorsArray[i] = this._animators[i];
        }

        this._animatorSet = new android.animation.AnimatorSet();
        this._animatorSet.addListener(this._animatorListener);

        return this._play();
    }

    public cancel(): void {
        if (!this.isPlaying) {
            traceWrite("Animation is not currently playing.", traceCategories.Animation, traceType.warn);
            return;
        }

        traceWrite("Cancelling AnimatorSet.", traceCategories.Animation);

        this._animatorSet.cancel();
    }

    public _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator): android.view.animation.Interpolator {
        return _resolveAnimationCurve(curve);
    }

    private _play(): AnimationPromise {
        const animationFinishedPromise = super.play();

        if (device.sdkVersion <= "23") {
            this._animatorSet = new android.animation.AnimatorSet();
            this._animatorSet.addListener(this._animatorListener);
        }

        if (this._animators.length > 0) {
            if (this._playSequentially) {
                this._animatorSet.playSequentially(this._nativeAnimatorsArray);
            }
            else {
                this._animatorSet.playTogether(this._nativeAnimatorsArray);
            }
        }

        if (traceEnabled()) {
            traceWrite("Starting " + this._nativeAnimatorsArray.length + " animations " + (this._playSequentially ? "sequentially." : "together."), traceCategories.Animation);
        }

        this._animatorSet.setupStartValues();
        this._animatorSet.start();

        return animationFinishedPromise;
    }

    private _onAndroidAnimationEnd() { // tslint:disable-line
        if (!this.isPlaying) {
            // It has been cancelled
            return;
        }

        this._propertyUpdateCallbacks.forEach(v => v());
        this._resolveAnimationFinishedPromise();

        if (this._resetOnFinish && this._target) {
            this._target._removeAnimation(this);
        }
    }

    private _onAndroidAnimationCancel() { // tslint:disable-line
        this._propertyResetCallbacks.forEach(v => v());
        this._rejectAnimationFinishedPromise();

        if (this._target) {
            this._target._removeAnimation(this);
        }
    }

    private _createAnimators(propertyAnimation: PropertyAnimation): void {
        if (!propertyAnimation.target.nativeViewProtected) {
            return;
        }

        if (traceEnabled()) {
            traceWrite("Creating ObjectAnimator(s) for animation: " + Animation._getAnimationInfo(propertyAnimation) + "...", traceCategories.Animation);
        }

        if (propertyAnimation.target === null || propertyAnimation.target === undefined) {
            throw new Error(`Animation target cannot be null or undefined; property: ${propertyAnimation.property}; value: ${propertyAnimation.value};`);
        }

        if (propertyAnimation.property === null || propertyAnimation.property === undefined) {
            throw new Error(`Animation property cannot be null or undefined; target: ${propertyAnimation.target}; value: ${propertyAnimation.value};`);
        }

        if (propertyAnimation.value === null || propertyAnimation.value === undefined) {
            throw new Error(`Animation value cannot be null or undefined; target: ${propertyAnimation.target}; property: ${propertyAnimation.property};`);
        }

        this._target = propertyAnimation.target;

        let nativeArray;
        const nativeView = <android.view.View>propertyAnimation.target.nativeViewProtected;
        const animators = new Array<android.animation.Animator>();
        const propertyUpdateCallbacks = new Array<Function>();
        const propertyResetCallbacks = new Array<Function>();
        let originalValue1;
        let originalValue2;
        const density = layout.getDisplayDensity();
        let xyObjectAnimators: any;
        let animatorSet: android.animation.AnimatorSet;

        let key = propertyKeys[propertyAnimation.property];
        if (key) {
            propertyAnimation.target[key] = propertyAnimation;
        }
        function checkAnimation(cb) {
            return () => {
                if (propertyAnimation.target[key] === propertyAnimation) {
                    delete propertyAnimation.target[key];
                    cb();
                }
            }
        }

        let setLocal = this._valueSource === "animation";
        const style = propertyAnimation.target.style;
        switch (propertyAnimation.property) {
            case Properties.opacity:
                opacityProperty._initDefaultNativeValue(style);

                originalValue1 = nativeView.getAlpha();
                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[setLocal ? opacityProperty.name : opacityProperty.keyframe] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    if (setLocal) {
                        propertyAnimation.target.style[opacityProperty.name] = originalValue1;
                    } else {
                        propertyAnimation.target.style[opacityProperty.keyframe] = originalValue1;
                    }
                    if (propertyAnimation.target.nativeViewProtected) {
                        propertyAnimation.target[opacityProperty.setNative](propertyAnimation.target.style.opacity);
                    }
                }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                break;

            case Properties.backgroundColor:
                backgroundColorProperty._initDefaultNativeValue(style);

                ensureArgbEvaluator();
                originalValue1 = propertyAnimation.target.backgroundColor;
                nativeArray = Array.create(java.lang.Object, 2);
                nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf((<Color>propertyAnimation.target.backgroundColor).argb) : java.lang.Integer.valueOf(-1);
                nativeArray[1] = java.lang.Integer.valueOf((<Color>propertyAnimation.value).argb);
                let animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
                animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate(animator: android.animation.ValueAnimator) {
                        let argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
                        propertyAnimation.target.style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = new Color(argb);
                    }
                }));

                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    if (setLocal) {
                        propertyAnimation.target.style[backgroundColorProperty.name] = originalValue1;
                    } else {
                        propertyAnimation.target.style[backgroundColorProperty.keyframe] = originalValue1;
                    }

                    if (propertyAnimation.target.nativeViewProtected && propertyAnimation.target[backgroundColorProperty.setNative]) {
                        propertyAnimation.target[backgroundColorProperty.setNative](propertyAnimation.target.style.backgroundColor);
                    }
                }));
                animators.push(animator);
                break;

            case Properties.translate:
                translateXProperty._initDefaultNativeValue(style);
                translateYProperty._initDefaultNativeValue(style);

                xyObjectAnimators = Array.create(android.animation.Animator, 2);

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.x * density;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.y * density;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                originalValue1 = nativeView.getTranslationX() / density;
                originalValue2 = nativeView.getTranslationY() / density;

                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = propertyAnimation.value.x;
                    propertyAnimation.target.style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = propertyAnimation.value.y;
                }));

                propertyResetCallbacks.push(checkAnimation(() => {
                    if (setLocal) {
                        propertyAnimation.target.style[translateXProperty.name] = originalValue1;
                        propertyAnimation.target.style[translateYProperty.name] = originalValue2;
                    } else {
                        propertyAnimation.target.style[translateXProperty.keyframe] = originalValue1;
                        propertyAnimation.target.style[translateYProperty.keyframe] = originalValue2;
                    }

                    if (propertyAnimation.target.nativeViewProtected) {
                        propertyAnimation.target[translateXProperty.setNative](propertyAnimation.target.style.translateX);
                        propertyAnimation.target[translateYProperty.setNative](propertyAnimation.target.style.translateY);
                    }
                }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case Properties.scale:
                scaleXProperty._initDefaultNativeValue(style);
                scaleYProperty._initDefaultNativeValue(style);

                xyObjectAnimators = Array.create(android.animation.Animator, 2);

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.x;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.y;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                originalValue1 = nativeView.getScaleX();
                originalValue2 = nativeView.getScaleY();

                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = propertyAnimation.value.x;
                    propertyAnimation.target.style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = propertyAnimation.value.y;
                }));

                propertyResetCallbacks.push(checkAnimation(() => {
                    if (setLocal) {
                        propertyAnimation.target.style[scaleXProperty.name] = originalValue1;
                        propertyAnimation.target.style[scaleYProperty.name] = originalValue2;
                    } else {
                        propertyAnimation.target.style[scaleXProperty.keyframe] = originalValue1;
                        propertyAnimation.target.style[scaleYProperty.keyframe] = originalValue2;
                    }

                    if (propertyAnimation.target.nativeViewProtected) {
                        propertyAnimation.target[scaleXProperty.setNative](propertyAnimation.target.style.scaleX);
                        propertyAnimation.target[scaleYProperty.setNative](propertyAnimation.target.style.scaleY);
                    }
                }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case Properties.rotate:
                rotateProperty._initDefaultNativeValue(style);

                originalValue1 = nativeView.getRotation();
                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[setLocal ? rotateProperty.name : rotateProperty.keyframe] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    if (setLocal) {
                        propertyAnimation.target.style[rotateProperty.name] = originalValue1;
                    } else {
                        propertyAnimation.target.style[rotateProperty.keyframe] = originalValue1;
                    }

                    if (propertyAnimation.target.nativeViewProtected) {
                        propertyAnimation.target[rotateProperty.setNative](propertyAnimation.target.style.rotate);
                    }
                }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                break;
            case Properties.width:
            case Properties.height: {

                const isVertical: boolean = propertyAnimation.property === "height";
                const extentProperty = isVertical ? heightProperty : widthProperty;

                extentProperty._initDefaultNativeValue(style);
                nativeArray = Array.create("float", 2);
                let toValue = propertyAnimation.value;
                let parent = propertyAnimation.target.parent as View;
                if (!parent) {
                    throw new Error(`cannot animate ${propertyAnimation.property} on root view`);
                }
                const parentExtent: number = isVertical ? parent.getMeasuredHeight() : parent.getMeasuredWidth();
                toValue = PercentLength.toDevicePixels(toValue, parentExtent, parentExtent) / screen.mainScreen.scale;
                const nativeHeight: number = isVertical ? nativeView.getHeight() : nativeView.getWidth();
                const targetStyle: string = setLocal ? extentProperty.name : extentProperty.keyframe;
                originalValue1 = nativeHeight / screen.mainScreen.scale;
                nativeArray[0] = originalValue1;
                nativeArray[1] = toValue;
                let extentAnimator = android.animation.ValueAnimator.ofFloat(nativeArray);
                extentAnimator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate(animator: android.animation.ValueAnimator) {
                        const argb = (<java.lang.Float>animator.getAnimatedValue()).floatValue();
                        propertyAnimation.target.style[setLocal ? extentProperty.name : extentProperty.keyframe] = argb;
                    }
                }));
                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[targetStyle] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[targetStyle] = originalValue1;
                    if (propertyAnimation.target.nativeViewProtected) {
                        const setter = propertyAnimation.target[extentProperty.setNative];
                        setter(propertyAnimation.target.style[propertyAnimation.property]);
                    }
                }));
                animators.push(extentAnimator);
                break;
            }
            default:
                throw new Error(`Animating property '${propertyAnimation.property}' is unsupported`);
        }

        for (let i = 0, length = animators.length; i < length; i++) {

            // Duration
            if (propertyAnimation.duration !== undefined) {
                animators[i].setDuration(propertyAnimation.duration);
            }

            // Delay
            if (propertyAnimation.delay !== undefined) {
                animators[i].setStartDelay(propertyAnimation.delay);
            }

            // Repeat Count
            if (propertyAnimation.iterations !== undefined && animators[i] instanceof android.animation.ValueAnimator) {
                (<android.animation.ValueAnimator>animators[i]).setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
            }

            // Interpolator
            if (propertyAnimation.curve !== undefined) {
                animators[i].setInterpolator(propertyAnimation.curve);
            }

            if (traceEnabled()) {
                traceWrite("Animator created: " + animators[i], traceCategories.Animation);
            }
        }

        this._animators = this._animators.concat(animators);
        this._propertyUpdateCallbacks = this._propertyUpdateCallbacks.concat(propertyUpdateCallbacks);
        this._propertyResetCallbacks = this._propertyResetCallbacks.concat(propertyResetCallbacks);
    }

    private static _getAndroidRepeatCount(iterations: number): number {
        return (iterations === Number.POSITIVE_INFINITY) ? android.view.animation.Animation.INFINITE : iterations - 1;
    }
}
