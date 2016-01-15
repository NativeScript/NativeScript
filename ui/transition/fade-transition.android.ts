import transition = require("ui/transition");
import platform = require("platform");

var floatType = java.lang.Float.class.getField("TYPE").get(null);

export class FadeTransition extends transition.Transition {
    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        var alphaValues = java.lang.reflect.Array.newInstance(floatType, 2);
        switch (transitionType) {
            case transition.AndroidTransitionType.enter:
            case transition.AndroidTransitionType.popEnter:
                alphaValues[0] = 0;
                alphaValues[1] = 1;
                break;
            case transition.AndroidTransitionType.exit:
            case transition.AndroidTransitionType.popExit:
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