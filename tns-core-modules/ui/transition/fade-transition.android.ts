import {Transition, AndroidTransitionType} from "ui/transition";

export class FadeTransition extends Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        let alphaValues = Array.create("float", 2);
        switch (transitionType) {
            case AndroidTransitionType.enter:
            case AndroidTransitionType.popEnter:
                alphaValues[0] = 0;
                alphaValues[1] = 1;
                break;
            case AndroidTransitionType.exit:
            case AndroidTransitionType.popExit:
                alphaValues[0] = 1;
                alphaValues[1] = 0;
                break;
        }
        let animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", alphaValues);
        let duration = this.getDuration();
        if (duration !== undefined) {
            animator.setDuration(duration);
        }
        animator.setInterpolator(this.getCurve());
        return animator;
    }
}