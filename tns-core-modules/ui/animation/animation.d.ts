declare module "ui/animation" {
    import viewModule = require("ui/core/view");
    import colorModule = require("color");
    
    /**
     * Defines animation options for the View.animate method.
     */
    export interface AnimationDefinition {
        /**
         * The view whose property is to be animated.
         */
        target?: viewModule.View;

        /**
         * Animates the opacity of the view. Value should be a number between 0.0 and 1.0
         */
        opacity?: number;

        /**
         * Animates the backgroundColor of the view.
         */
        backgroundColor?: colorModule.Color;

        /**
         * Animates the translate affine transform of the view.
         */
        translate?: Pair;

        /**
         * Animates the scale affine transform of the view.
         */
        scale?: Pair;

        /**
         * Animates the rotate affine transform of the view. Value should be a number specifying the rotation amount in degrees.
         */
        rotate?: number;

        /**
         * The length of the animation in milliseconds. The default duration is 300 milliseconds.
         */
        duration?: number;

        /**
         * The amount of time, in milliseconds, to delay starting the animation.
         */
        delay?: number;

        /**
         * Specifies how many times the animation should be played. Default is 1.
         * iOS animations support fractional iterations, i.e. 1.5.
         * To repeat an animation infinitely, use Number.POSITIVE_INFINITY
         */
        iterations?: number;

        /**
         * An optional animation curve. Possible values are contained in the [AnimationCurve enumeration](../enums/AnimationCurve/README.md).
         * Alternatively, you can pass an instance of type UIViewAnimationCurve for iOS or android.animation.TimeInterpolator for Android.
         */
        curve?: any;
    }

    /**
     * Defines a custom animation timing curve by using the cubic-bezier function.
     * Possible values are numeric values from 0 to 1
     */
    export class CubicBezierAnimationCurve {

        public x1: number;
        public y1: number;
        public x2: number;
        public y2: number;

        constructor(x1: number, y1: number, x2: number, y2: number);
    }

    /**
     * Defines a pair of values (horizontal and vertical) for translate and scale animations.
     */
    export interface Pair {
        x: number;
        y: number;
    }

    export interface Cancelable {
        cancel(): void;
    }

    /**
     * A Promise that can cancel the animation.
     */
    export type AnimationPromise = Promise<void> & Cancelable;

    /**
     * Defines a animation set.
     */
    export class Animation {
        constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean);
        public play: () => AnimationPromise;
        public cancel: () => void;
        public isPlaying: boolean;
    }

    //@private
    export function _resolveAnimationCurve(curve: any): any;
    //@endprivate
}
