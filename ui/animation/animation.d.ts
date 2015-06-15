declare module "ui/animation" {
    import viewModule = require("ui/core/view");

    /**
     * Animatable properties enumeration.
     */
    module Properties {
        /**
         * Animates the opacity of the target view. Value should be a number between 0.0 and 1.0
         */
        export var opacity: string;

        /**
         * Animates the backgroundColor of the target view. Value should be an instance of Color.
         */
        export var backgroundColor: string;

        /**
         * Animates the translation affine transform of the target view. Value should be a JSON object of the form {x: 100, y: 100}.
         */
        export var translate: string;
        
        /**
         * Animates the rotate affine transform of the target view. Value should be a number specifying the roation amount in degrees.
         */
        export var rotate: string;

        /**
         * Animates the scale affine transform of the target view. Value should be a JSON object of the form {x: 0.5, y: 0.5}.
         */
        export var scale: string;
    }

    /**
     * Defines the data for an animation.
     */
    export interface Animation {
        
        /**
         * The view whose property is to be animated. 
         */
        target: viewModule.View;
        
        /**
         * The property to be animated. Animatable properties are contained in the animation.Properties enumeration.
         */
        property: string;

        /**
         * The value of the property to animate to.
         */
        value: any;
        
        /**
         * The length of the animation in milliseconds. The default duration is 300 milliseconds.
         */
        duration?: number;

        /**
         * The amount of time, in milliseconds, to delay starting the animation after start() is called. 
         */
        delay?: number;
        
        /**
         * Specifies how many times the animation should be repeated. 
         * The default repeat count is 0 meaning the animation is never repeated, i.e. it is played only once. 
         * iOS animations support fractional repeat counts, i.e. 1.5
         */
        repeatCount?: number;
        
        /**
         * An optional animation curve of type UIViewAnimationCurve.
         */
        iosUIViewAnimationCurve?: any;

        /**
         * An optional android.animation.TimeInterpolator instance used in calculating the elapsed fraction of this animation. 
         * The interpolator determines whether the animation runs with linear or non-linear motion, such as acceleration and deceleration. 
         * The default value is AccelerateDecelerateInterpolator.
         */
        androidInterpolator?: any;
    }

    /**
     * Defines an operation that can be cancelled.
     */
    export interface Cancelable {
        
        /**
         * Cancels the opertaion.
         */
        cancel: () => void;
    }

    /**
     * Starts the specified animations and returns a Cancelable object that can be used to stop the animations.
     * @param animations - The animations to start.
     * @param finishedCallback - Callback function which will be executed when all animations finish. Useful for chaining multiple animation sets on after another.
     */
    export function start(animations: Array<Animation>, playSequentially: boolean, finishedCallback?: (cancelled?: boolean) => void): Cancelable;
}