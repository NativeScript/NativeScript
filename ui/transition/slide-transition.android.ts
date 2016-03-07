import transition = require("ui/transition");
import platform = require("platform");

var screenWidth = platform.screen.mainScreen.widthPixels;
var screenHeight = platform.screen.mainScreen.heightPixels;

export class SlideTransition extends transition.Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimator(transitionType: string): android.animation.Animator {
        var translationValues = Array.create("float", 2);
        switch (this._direction) {
            case "left":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = screenWidth;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenWidth;
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = -screenWidth;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = screenWidth;
                        break;
                }
                break;
            case "right":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = -screenWidth;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = screenWidth;
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = screenWidth;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenWidth;
                        break;
                }
                break;
            case "top":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = screenHeight;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenHeight;
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = -screenHeight;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = screenHeight;
                        break;
                }
                break;
            case "bottom":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = -screenHeight;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = screenHeight;
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = screenHeight;
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenHeight;
                        break;
                }
                break;
        }
        var prop;
        if (this._direction === "left" || this._direction === "right") {
            prop = "translationX";
        }
        else {
            prop = "translationY";
        }

        var animator = android.animation.ObjectAnimator.ofFloat(null, prop, translationValues);
        var duration = this.getDuration();
        if (duration !== undefined) {
            animator.setDuration(duration);
        }
        animator.setInterpolator(this.getCurve());
        return animator;
    }
}