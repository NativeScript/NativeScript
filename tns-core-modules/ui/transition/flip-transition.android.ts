import {Transition, AndroidTransitionType} from "ui/transition";

//http://developer.android.com/training/animation/cardflip.html
export class FlipTransition extends Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        let objectAnimators;
        let values;
        let animator: android.animation.ObjectAnimator;
        let animatorSet = new android.animation.AnimatorSet();
        let fullDuration = this.getDuration() || 300;
        let interpolator = this.getCurve();
        let rotationY = this._direction === "right" ? 180 : -180;

        switch (transitionType) {
            case AndroidTransitionType.enter: // card_flip_right_in
                objectAnimators = Array.create(android.animation.Animator, 3);

                values = Array.create("float", 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setDuration(0);
                objectAnimators[0] = animator;

                values = Array.create("float", 2);
                values[0] = rotationY;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[1] = animator;

                values = Array.create("float", 2);
                values[0] = 0.0;
                values[1] = 1.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[2] = animator;
                break;
            case AndroidTransitionType.exit: // card_flip_right_out
                objectAnimators = Array.create(android.animation.Animator, 2);

                values = Array.create("float", 2);
                values[0] = 0.0;
                values[1] = -rotationY;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[0] = animator;

                values = Array.create("float", 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[1] = animator;
                break;
            case AndroidTransitionType.popEnter: // card_flip_left_in
                objectAnimators = Array.create(android.animation.Animator, 3);

                values = Array.create("float", 2);
                values[0] = 1.0;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setDuration(0);
                objectAnimators[0] = animator;

                values = Array.create("float", 2);
                values[0] = -rotationY;
                values[1] = 0.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[1] = animator;

                values = Array.create("float", 2);
                values[0] = 0.0;
                values[1] = 1.0;
                animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", values);
                animator.setStartDelay(fullDuration / 2);
                animator.setDuration(1);
                objectAnimators[2] = animator;
                break;
            case AndroidTransitionType.popExit: // card_flip_left_out
                objectAnimators = Array.create(android.animation.Animator, 2);

                values = Array.create("float", 2);
                values[0] = 0.0;
                values[1] = rotationY;
                animator = android.animation.ObjectAnimator.ofFloat(null, "rotationY", values);
                animator.setInterpolator(interpolator);
                animator.setDuration(fullDuration);
                objectAnimators[0] = animator;

                values = Array.create("float", 2);
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