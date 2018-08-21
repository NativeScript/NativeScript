import { Transition, AndroidTransitionType } from "./transition";

export class FadeTransition extends Transition {
    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        const alphaValues = [];
        switch (transitionType) {
            case AndroidTransitionType.enter:
            case AndroidTransitionType.popEnter:
                alphaValues[0] = 0.0;
                alphaValues[1] = 1.0;
                break;
            case AndroidTransitionType.exit:
            case AndroidTransitionType.popExit:
                alphaValues[0] = 1.0;
                alphaValues[1] = 0.0;
                break;
        }

        const animation = new android.view.animation.AlphaAnimation(alphaValues[0], alphaValues[1]);
        const duration = this.getDuration();
        if (duration !== undefined) {
            animation.setDuration(duration);
        }

        animation.setInterpolator(this.getCurve());

        return animation;
    }
}
