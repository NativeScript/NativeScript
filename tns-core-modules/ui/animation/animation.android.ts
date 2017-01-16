import { AnimationDefinition } from "ui/animation";
import {
    AnimationBase, Properties, PropertyAnimation, CubicBezierAnimationCurve, AnimationPromise,
    opacityProperty, backgroundColorProperty, rotateProperty,
    translateXProperty, translateYProperty,
    scaleXProperty, scaleYProperty, Color, traceWrite, traceEnabled, traceCategories
} from "./animation-common";

import { CacheLayerType, layout } from "utils/utils";
import lazy from "utils/lazy";

export * from "./animation-common";

interface AnimationDefinitionInternal extends AnimationDefinition {
    valueSource?: number;
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

export function _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator): android.view.animation.Interpolator {
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
            } 
            else if (curve instanceof android.view.animation.Interpolator) {
                return curve;
            }
            else {
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
    private _valueSource: number;

    constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

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
                that.get()._onAndroidAnimationEnd();
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                if (traceEnabled()) {
                    traceWrite("MainAnimatorListener.onAnimationCancel(" + animator + ")", traceCategories.Animation);
                }
                that.get()._onAndroidAnimationCancel();
            }
        });
    }

    public play(): AnimationPromise {
        let animationFinishedPromise = super.play();

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
        if (this._animators.length > 0) {
            if (this._playSequentially) {
                this._animatorSet.playSequentially(this._nativeAnimatorsArray);
            }
            else {
                this._animatorSet.playTogether(this._nativeAnimatorsArray);
            }
        }

        this._enableHardwareAcceleration();

        if (traceEnabled()) {
            traceWrite("Starting " + this._nativeAnimatorsArray.length + " animations " + (this._playSequentially ? "sequentially." : "together."), traceCategories.Animation);
        }
        this._animatorSet.setupStartValues();
        this._animatorSet.start();
        return animationFinishedPromise;
    }

    public cancel(): void {
        super.cancel();
        if (traceEnabled()) {
            traceWrite("Cancelling AnimatorSet.", traceCategories.Animation);
        }
        this._animatorSet.cancel();
    }

    public _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator): android.view.animation.Interpolator {
        return _resolveAnimationCurve(curve);
    }

    private _onAndroidAnimationEnd() { // tslint:disable-line
        if (!this.isPlaying) {
            // It has been cancelled
            return;
        }

        let i = 0;
        let length = this._propertyUpdateCallbacks.length;
        for (; i < length; i++) {
            this._propertyUpdateCallbacks[i]();
        }
        this._disableHardwareAcceleration();
        this._resolveAnimationFinishedPromise();
    }

    private _onAndroidAnimationCancel() { // tslint:disable-line 
        let i = 0;
        let length = this._propertyResetCallbacks.length;
        for (; i < length; i++) {
            this._propertyResetCallbacks[i]();
        }
        this._disableHardwareAcceleration();
        this._rejectAnimationFinishedPromise();
    }

    private _createAnimators(propertyAnimation: PropertyAnimation): void {
        if (!propertyAnimation.target._nativeView) {
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

        let nativeArray;
        let nativeView = <android.view.View>propertyAnimation.target._nativeView;
        let animators = new Array<android.animation.Animator>();
        let propertyUpdateCallbacks = new Array<Function>();
        let propertyResetCallbacks = new Array<Function>();
        let originalValue1;
        let originalValue2;
        let density = layout.getDisplayDensity();
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

        // let valueSource = this._valueSource !== undefined ? this._valueSource : dependencyObservable.ValueSource.Local;

        switch (propertyAnimation.property) {
            case Properties.opacity:
                originalValue1 = nativeView.getAlpha();
                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[opacityProperty.cssName] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[opacityProperty.cssName] = originalValue1;
                }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                break;

            case Properties.backgroundColor:
                ensureArgbEvaluator();
                originalValue1 = propertyAnimation.target.backgroundColor;
                nativeArray = Array.create(java.lang.Object, 2);
                nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf((<Color>propertyAnimation.target.backgroundColor).argb) : java.lang.Integer.valueOf(-1);
                nativeArray[1] = java.lang.Integer.valueOf((<Color>propertyAnimation.value).argb);
                let animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
                animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate(animator: android.animation.ValueAnimator) {
                        let argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
                        propertyAnimation.target.style[backgroundColorProperty.cssName] = new Color(argb);
                    }
                }));

                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[backgroundColorProperty.cssName] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[backgroundColorProperty.cssName] = originalValue1;
                }));
                animators.push(animator);
                break;

            case Properties.translate:
                xyObjectAnimators = Array.create(android.animation.Animator, 2);

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.x * density;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value.y * density;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));

                originalValue1 = nativeView.getTranslationX();
                originalValue2 = nativeView.getTranslationY();

                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[translateXProperty.cssName] = propertyAnimation.value.x;
                    propertyAnimation.target.style[translateYProperty.cssName] = propertyAnimation.value.y;
                }));

                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[translateXProperty.cssName] = originalValue1;
                    propertyAnimation.target.style[translateYProperty.cssName] = originalValue2;
                }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case Properties.scale:
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
                    propertyAnimation.target.style[scaleXProperty.cssName] = propertyAnimation.value.x;
                    propertyAnimation.target.style[scaleYProperty.cssName] = propertyAnimation.value.y;
                }));

                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[scaleXProperty.cssName] = originalValue1;
                    propertyAnimation.target.style[scaleYProperty.cssName] = originalValue2;
                }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case Properties.rotate:
                originalValue1 = nativeView.getRotation();
                nativeArray = Array.create("float", 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[rotateProperty.cssName] = propertyAnimation.value;
                }));
                propertyResetCallbacks.push(checkAnimation(() => {
                    propertyAnimation.target.style[rotateProperty.cssName] = originalValue1;
                }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                break;

            default:
                throw new Error("Cannot animate " + propertyAnimation.property);
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

    private _enableHardwareAcceleration() {
        for (let i = 0, length = this._propertyAnimations.length; i < length; i++) {
            let cache = <CacheLayerType>this._propertyAnimations[i].target._nativeView;
            if (cache) {
                let layerType = cache.getLayerType();
                if (layerType !== android.view.View.LAYER_TYPE_HARDWARE) {
                    cache.layerType = layerType;
                    cache.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
                }
            }
        }
    }

    private _disableHardwareAcceleration() {
        for (let i = 0, length = this._propertyAnimations.length; i < length; i++) {
            let cache = <CacheLayerType>this._propertyAnimations[i].target._nativeView;
            if (cache && cache.layerType !== undefined) {
                cache.setLayerType(cache.layerType, null);
                cache.layerType = undefined;
            }
        }
    }
}