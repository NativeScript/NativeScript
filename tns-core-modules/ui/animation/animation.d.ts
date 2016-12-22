declare module "ui/animation" {
    import { View, Color } from "ui/core/view";

    /**
     * Defines animation options for the View.animate method.
     */
    export interface AnimationDefinition {
        /**
         * The view whose property is to be animated.
         */
        target?: View;

        /**
         * Animates the opacity of the view. Value should be a number between 0.0 and 1.0
         */
        opacity?: number;

        /**
         * Animates the backgroundColor of the view.
         */
        backgroundColor?: Color;

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

    /**
     * Create Promise that can cancel the animation, we have to pretend our returns itself along with the cancel
     */
    export class AnimationPromise extends Promise<void> {
        cancel(): void;
        then(onFulfilled?: (value?: any) => PromiseLike<void>, onRejected?: (error?: any) => PromiseLike<void>): AnimationPromise;
        then(onFulfilled?: (value?: any) => void, onRejected?: (error?: any) => void): AnimationPromise;
        catch(onRejected?: (error?: any) => PromiseLike<void>): AnimationPromise;
        catch(onRejected?: (error?: any) => void): AnimationPromise;
    }

    /**
     * Defines a animation set.
     */
    export class Animation {
        constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean);
        public play: () => AnimationPromise;
        public cancel: () => void;
        public isPlaying: boolean;
        public _resolveAnimationCurve(curve: any): any;
    }

    export function _resolveAnimationCurve(curve: any): any;
}