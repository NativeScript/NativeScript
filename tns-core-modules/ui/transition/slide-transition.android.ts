import * as transition from "./transition";
import * as platform from "../../platform";
import lazy from "../../utils/lazy";

const screenWidth = lazy(() => platform.screen.mainScreen.widthPixels);
const screenHeight = lazy(() => platform.screen.mainScreen.heightPixels);

export class SlideTransition extends transition.Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        const translationValues = [];
        switch (this._direction) {
            case "left":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = screenWidth();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenWidth();
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = -screenWidth();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = screenWidth();
                        break;
                }
                break;
            case "right":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = -screenWidth();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = screenWidth();
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = screenWidth();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenWidth();
                        break;
                }
                break;
            case "top":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = screenHeight();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenHeight();
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = -screenHeight();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = screenHeight();
                        break;
                }
                break;
            case "bottom":
                switch (transitionType) {
                    case transition.AndroidTransitionType.enter:
                        translationValues[0] = -screenHeight();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.exit:
                        translationValues[0] = 0;
                        translationValues[1] = screenHeight();
                        break;
                    case transition.AndroidTransitionType.popEnter:
                        translationValues[0] = screenHeight();
                        translationValues[1] = 0;
                        break;
                    case transition.AndroidTransitionType.popExit:
                        translationValues[0] = 0;
                        translationValues[1] = -screenHeight();
                        break;
                }
                break;
        }

        let animation;
        if (this._direction === "left" || this._direction === "right") {
            animation = new android.view.animation.TranslateAnimation(translationValues[0], translationValues[1], 0, 0);
        }
        else {
            animation = new android.view.animation.TranslateAnimation(0, 0, translationValues[0], translationValues[1]);
        }

        const duration = this.getDuration();
        if (duration !== undefined) {
            animation.setDuration(duration);
        }

        animation.setInterpolator(this.getCurve());
        
        return animation;
    }

    public toString(): string {
        return `${super.toString()} ${this._direction}`;
    }
}
