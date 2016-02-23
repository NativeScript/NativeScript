import {Transition, AndroidTransitionType} from "ui/transition";

var floatType = java.lang.Float.class.getField("TYPE").get(null);

export class FadeTransition extends Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        var alphaValues = java.lang.reflect.Array.newInstance(floatType, 2);
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
        var animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", alphaValues);
        var duration = this.getDuration();
        if (duration !== undefined) {
            animator.setDuration(duration);
        }
        animator.setInterpolator(this.getCurve());
        return animator;
    }
}
