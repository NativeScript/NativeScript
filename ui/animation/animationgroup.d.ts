declare module "ui/animation/animationgroup" {

import view = require("ui/core/view");
import cssParser = require("css");

    export class KeyframeDeclaration {
        property: string;
        value: any;
    }

    export class Keyframe {
        duration: number;
        declarations: Array<KeyframeDeclaration>;
    }

    /**
     * Defines animation options for the View.animate method.
     */
    export class AnimationGroup {

        name: string;

        /**
         * The length of the animation in milliseconds. The default duration is 300 milliseconds.
         */
        duration: number;

        /**
         * The amount of time, in milliseconds, to delay starting the animation.
         */
        delay: number;

        /**
         * Specifies how many times the animation should be played. Default is 1.
         * iOS animations support fractional iterations, i.e. 1.5.
         * To repeat an animation infinitely, use Number.POSITIVE_INFINITY
         */
        iterations: number;

        /**
         * An optional animation curve. Possible values are contained in the [AnimationCurve enumeration](../enums/AnimationCurve/README.md).
         * Alternatively, you can pass an instance of type UIViewAnimationCurve for iOS or android.animation.TimeInterpolator for Android.
         */
        curve: any;

        /**
         * Determines whether the animation values will be applied on the animated object after the animation finishes.
         */
        isForwards: boolean;

        /**
         * If true the animation will be played backwards.
         */
        isReverse: boolean;

        /**
         * Returns true if the application is currently running.
         */
        isPlaying: boolean;

        /**
         * Return animation keyframes.
         */
        keyframes: Array<Keyframe>;

        /**
         * Plays the animation.
         */
        public play: (view: view.View) => Promise<void>;

        public static animationGroupFromSelectorDeclarations(declarations: cssParser.Declaration[]): AnimationGroup;

        public static keyframesFromCSS(cssKeyframes: Object): Array<Keyframe>;
    }
}