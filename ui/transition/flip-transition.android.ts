import {Transition, AndroidTransitionType} from "ui/transition";

var floatType = java.lang.Float.class.getField("TYPE").get(null);

//http://developer.android.com/training/animation/cardflip.html
export class FlipTransition extends Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        var objectAnimators;
        var values;
        var animator: android.animation.ObjectAnimator;
        var animatorSet = new android.animation.AnimatorSet();
        var fullDuration = this.getDuration() || 300;
        var interpolator = this.getCurve();
        var rotationY = this._direction === "right" ? 180 : -180;

        switch (transitionType) {
            case AndroidTransitionType.enter: // card_flip_right_in
                objectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 3);

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setDuration(0);
                objectAnimators[0] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = rotationY;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[1] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 0.0;
                values[1] = 1.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[2] = animator;
                break;
            case AndroidTransitionType.exit: // card_flip_right_out
                objectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 0.0;
                values[1] = -rotationY;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[0] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[1] = animator;
                break;
            case AndroidTransitionType.popEnter: // card_flip_left_in
                objectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 3);

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setDuration(0);
                objectAnimators[0] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = -rotationY;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[1] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 0.0;
                values[1] = 1.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[2] = animator;
                break;
            case AndroidTransitionType.popExit: // card_flip_left_out
                objectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 0.0;
                values[1] = rotationY;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[0] = animator;

                values = java.lang.reflect.Array.newInstance(floatType, 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[1] = animator;
                break;
        }
        
        animatorSet.playTogether(objectAnimators);
        return animatorSet;
    }
}
