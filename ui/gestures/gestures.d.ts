/**
 * Contains the GesturesObserver class, which lets you observe and respond to user gestures
 */
declare module "ui/gestures" {
    import view = require("ui/core/view");
    import observable = require("data/observable");

    /**
     * Defines an enum with supported gesture types.
     */
    export enum GestureTypes {
        /**
         * Denotes tap (click) gesture.
         */
        tap,
        /**
         * Denotes double tap gesture.
         */
        doubleTap,
        /**
         * Denotes pinch gesture.
         */
        pinch,
        /**
         * Denotes pan gesture.
         */
        pan,
        /**
         * Denotes swipe gesture.
         */
        swipe,
        /**
         * Denotes rotation gesture.
         */
        rotation,
        /**
         * Denotes long press gesture.
         */
        longPress
    }

    /**
     * Defines an enum for swipe gesture direction.
     */
    export enum SwipeDirection {
        /**
         * Denotes right direction for swipe gesture.
         */
        right,
        /**
         * Denotes left direction for swipe gesture.
         */
        left,
        /**
         * Denotes up direction for swipe gesture.
         */
        up,
        /**
         * Denotes down direction for swipe gesture.
         */
        down
    }

    /**
     * Provides gesture event data.
     */
    export interface GestureEventData extends observable.EventData {
        /**
         * Gets the type of the gesture.
         */
        type: GestureTypes;
        /**
         * Gets the view which originates the gesture.
         */
        view: view.View;
        /**
         * Gets the underlying native iOS specific [UIGestureRecognizer](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIGestureRecognizer_Class/).
         */
        ios: UIGestureRecognizer
        /**
         * Gets the underlying native android specific [gesture detector](http://developer.android.com/reference/android/view/GestureDetector.html).
         */
        android: any
    }

    /**
     * Provides gesture event data for pinch gesture.
     */
    export interface PinchGestureEventData extends GestureEventData {
        scale: number;
    }

    /**
     * Provides gesture event data for swipe gesture.
     */
    export interface SwipeGestureEventData extends GestureEventData {
        direction: SwipeDirection;
    }

    /**
     * Provides gesture event data for pan gesture.
     */
    export interface PanGestureEventData extends GestureEventData {
        deltaX: number;
        deltaY: number;
    }

    /**
     * Provides gesture event data for rotation gesture.
     */
    export interface RotationGestureEventData extends GestureEventData {
        rotation: number;
    }

    /**
     * Provides options for the GesturesObserver.
     */
    export class GesturesObserver {
        /**
         * Creates an instance of GesturesObserver class.
         * @param callback - A function that will be executed when a gesture is received.
         */
        constructor(target: view.View, callback: (args: GestureEventData) => void, context: any);

        /**
         * Registers a gesture observer to a view and gesture.
         * @param type - Type of the gesture.
         */
        observe(type: GestureTypes);

        /**
         * Disconnects the gesture observer.
         */
        disconnect();

        /**
         * Gesture type attached to the observer.
         */
        type: GestureTypes;

        /**
         * A function that will be executed when a gesture is received.
         */
        callback: (args: GestureEventData) => void;

        /**
         * A context which will be used as `this` in callback execution.
         */
        context: any;

        /**
         * An internal Android specific method used to pass the motion event to the correct gesture observer.
         */
        androidOnTouchEvent: (motionEvent: android.view.MotionEvent) => void;
    }

    /**
     * A short-hand function that is used to create a gesture observer for a view and gesture.
     * @param target - View which will be watched for originating a specific gesture.
     * @param type - Type of the gesture.
     * @param callback - A function that will be executed when a gesture is received.
     */
    export function observe(target: view.View, type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): GesturesObserver;

    /**
     * Returns a string representation of a gesture type.
     * @param type - Type of the gesture.
     * @param separator(optional) - Text separator between gesture type strings.
     */
    export function toString(type: GestureTypes, separator?: string): string;

    /**
     * Returns a gesture type enum value from a string (case insensitive).
     * @param type - A string representation of a gesture type (e.g. Tap).
     */
    export function fromString(type: string): GestureTypes;
}