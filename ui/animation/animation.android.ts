import definition = require("ui/animation");
import common = require("./animation-common");
import utils = require("utils/utils");
import color = require("color");
import trace = require("trace");
import types = require("utils/types");
import enums = require("ui/enums");

global.moduleMerge(common, exports);

var floatType = java.lang.Float.class.getField("TYPE").get(null);
var argbEvaluator = new android.animation.ArgbEvaluator();

var keyPrefix = "ui.animation.";
var propertyKeys = {};
propertyKeys[common.Properties.backgroundColor] = Symbol(keyPrefix + common.Properties.backgroundColor);
propertyKeys[common.Properties.opacity] = Symbol(keyPrefix + common.Properties.opacity);
propertyKeys[common.Properties.rotate] = Symbol(keyPrefix + common.Properties.rotate);
propertyKeys[common.Properties.scale] = Symbol(keyPrefix + common.Properties.scale);
propertyKeys[common.Properties.translate] = Symbol(keyPrefix + common.Properties.translate);

export class Animation extends common.Animation implements definition.Animation {
    private _animatorListener: android.animation.Animator.AnimatorListener;
    private _nativeAnimatorsArray: any;
    private _animatorSet: android.animation.AnimatorSet; 
    private _animators: Array<android.animation.Animator>;
    private _propertyUpdateCallbacks: Array<Function>;
    private _propertyResetCallbacks: Array<Function>;

    public play(): Promise<void> {
        var animationFinishedPromise = super.play();

        var i: number;
        var length: number;

        this._animators = new Array<android.animation.Animator>();
        this._propertyUpdateCallbacks = new Array<Function>();
        this._propertyResetCallbacks = new Array<Function>();

        i = 0;
        length = this._propertyAnimations.length;
        for (; i < length; i++) {
            this._createAnimators(this._propertyAnimations[i]);
        }

        this._nativeAnimatorsArray = java.lang.reflect.Array.newInstance(android.animation.Animator.class, this._animators.length);
        i = 0;
        length = this._animators.length;
        for (; i < length; i++) {
            this._nativeAnimatorsArray[i] = this._animators[i];
        }

        this._animatorSet = new android.animation.AnimatorSet();
        this._animatorSet.addListener(this._animatorListener);
        if (this._playSequentially) {
            this._animatorSet.playSequentially(this._nativeAnimatorsArray);
        }
        else {
            this._animatorSet.playTogether(this._nativeAnimatorsArray);
        }

        trace.write("Starting " + this._nativeAnimatorsArray.length + " animations " + (this._playSequentially ? "sequentially." : "together."), trace.categories.Animation);
        this._animatorSet.setupStartValues();
        this._animatorSet.start();
        return animationFinishedPromise;
    }

    public cancel(): void {
        super.cancel();
        trace.write("Cancelling AnimatorSet.", trace.categories.Animation);
        this._animatorSet.cancel();
    }

    constructor(animationDefinitions: Array<definition.AnimationDefinition>, playSequentially?: boolean) {
        super(animationDefinitions, playSequentially);

        var that = this;
        this._animatorListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator: android.animation.Animator): void {
                trace.write("MainAnimatorListener.onAndroidAnimationStart(" + animator +")", trace.categories.Animation);
            },
            onAnimationRepeat: function (animator: android.animation.Animator): void {
                trace.write("MainAnimatorListener.onAnimationRepeat(" + animator + ")", trace.categories.Animation);
            },
            onAnimationEnd: function (animator: android.animation.Animator): void {
                trace.write("MainAnimatorListener.onAnimationEnd(" + animator + ")", trace.categories.Animation);
                that._onAndroidAnimationEnd();
            },
            onAnimationCancel: function (animator: android.animation.Animator): void {
                trace.write("MainAnimatorListener.onAnimationCancel(" + animator + ")", trace.categories.Animation);
                that._onAndroidAnimationCancel();
            }
        });
    }

    private _onAndroidAnimationEnd() {
        if (!this.isPlaying) {
            // It has been cancelled
            return;
        }
        
        var i = 0;
        var length = this._propertyUpdateCallbacks.length;
        for (; i < length; i++) {
            this._propertyUpdateCallbacks[i]();
        }
        this._resolveAnimationFinishedPromise();
    }

    private _onAndroidAnimationCancel() {
        var i = 0;
        var length = this._propertyResetCallbacks.length;
        for (; i < length; i++) {
            this._propertyResetCallbacks[i]();
        }
        this._rejectAnimationFinishedPromise();
    }

    private _createAnimators(propertyAnimation: common.PropertyAnimation): void {
        trace.write("Creating ObjectAnimator(s) for animation: " + common.Animation._getAnimationInfo(propertyAnimation) + "...", trace.categories.Animation);

        if (types.isNullOrUndefined(propertyAnimation.target)) {
            throw new Error("Animation target cannot be null or undefined!");
        }

        if (types.isNullOrUndefined(propertyAnimation.property)) {
            throw new Error("Animation property cannot be null or undefined!");
        }

        if (types.isNullOrUndefined(propertyAnimation.value)) {
            throw new Error("Animation value cannot be null or undefined!");
        }

        var nativeArray;
        var nativeView: android.view.View = (<android.view.View>propertyAnimation.target._nativeView);
        var animators = new Array<android.animation.Animator>();
        var propertyUpdateCallbacks = new Array<Function>();
        var propertyResetCallbacks = new Array<Function>();
        var originalValue;
        var density = utils.layout.getDisplayDensity();
        var xyObjectAnimators: any;
        var animatorSet: android.animation.AnimatorSet;
        
        var key = propertyKeys[propertyAnimation.property];
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
        
        switch (propertyAnimation.property) {

            case common.Properties.opacity:
                originalValue = nativeView.getAlpha();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.opacity = propertyAnimation.value }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setAlpha(originalValue); }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                break;

            case common.Properties.backgroundColor:
                originalValue = nativeView.getBackground();
                nativeArray = java.lang.reflect.Array.newInstance(java.lang.Object.class, 2);
                nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf((<color.Color>propertyAnimation.target.backgroundColor).argb) : java.lang.Integer.valueOf(-1);
                nativeArray[1] = java.lang.Integer.valueOf((<color.Color>propertyAnimation.value).argb);
                var animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
                animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate(animator: android.animation.ValueAnimator) {
                        var argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
                        propertyAnimation.target.backgroundColor = new color.Color(argb);
                    }
                }));

                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.backgroundColor = propertyAnimation.value; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setBackground(originalValue); }));
                animators.push(animator);
                break;

            case common.Properties.translate:
                xyObjectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);

                originalValue = nativeView.getTranslationX();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x * density;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.translateX = propertyAnimation.value.x; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setTranslationX(originalValue); }));

                originalValue = nativeView.getTranslationY();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y * density;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.translateY = propertyAnimation.value.y; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setTranslationY(originalValue); }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case common.Properties.scale:
                xyObjectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);

                originalValue = nativeView.getScaleX();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.scaleX = propertyAnimation.value.x; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setScaleX(originalValue); }));

                originalValue = nativeView.getScaleY();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.scaleY = propertyAnimation.value.y; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setScaleY(originalValue); }));

                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;

            case common.Properties.rotate:
                originalValue = nativeView.getRotation();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(() => { propertyAnimation.target.rotate = propertyAnimation.value; }));
                propertyResetCallbacks.push(checkAnimation(() => { nativeView.setRotation(originalValue); }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                break;

            default:
                throw new Error("Cannot animate " + propertyAnimation.property);
                break;
        }

        var i = 0;
        var length = animators.length;
        for (; i < length; i++) {
            
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
            trace.write("Animator created: " + animators[i], trace.categories.Animation);
        }

        this._animators = this._animators.concat(animators);
        this._propertyUpdateCallbacks = this._propertyUpdateCallbacks.concat(propertyUpdateCallbacks);
        this._propertyResetCallbacks = this._propertyResetCallbacks.concat(propertyResetCallbacks);
    }

    _resolveAnimationCurve(curve: any): any {
        switch (curve) {
            case enums.AnimationCurve.easeIn:
                trace.write("Animation curve resolved to android.view.animation.AccelerateInterpolator(1).", trace.categories.Animation);
                return new android.view.animation.AccelerateInterpolator(1);
            case enums.AnimationCurve.easeOut:
                trace.write("Animation curve resolved to android.view.animation.DecelerateInterpolator(1).", trace.categories.Animation);
                return new android.view.animation.DecelerateInterpolator(1);
            case enums.AnimationCurve.easeInOut:
                trace.write("Animation curve resolved to android.view.animation.AccelerateDecelerateInterpolator().", trace.categories.Animation);
                return new android.view.animation.AccelerateDecelerateInterpolator();
            case enums.AnimationCurve.linear:
                trace.write("Animation curve resolved to android.view.animation.LinearInterpolator().", trace.categories.Animation);
                return new android.view.animation.LinearInterpolator();
            default:
                trace.write("Animation curve resolved to original: " + curve, trace.categories.Animation);
                return curve;
        }
    }

    private static _getAndroidRepeatCount(iterations: number): number {
        return (iterations === Number.POSITIVE_INFINITY) ? android.view.animation.Animation.INFINITE : iterations - 1;
    }
}