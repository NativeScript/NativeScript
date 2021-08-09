import { View } from '../core/view';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';

export { KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './keyframe-animation';

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
	 * Animates the height of a view.
	 */
	height?: CoreTypes.PercentLengthType | string;

	/**
	 * Animates the width of a view.
	 */
	width?: CoreTypes.PercentLengthType | string;

	/**
	 * Animates the rotate affine transform of the view. Value should be a number specifying the rotation amount in degrees.
	 */
	rotate?: number | Point3D;

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
	 * An optional animation curve. Possible values are contained in the [AnimationCurve enumeration](../modules/_ui_enums_.animationcurve.html).
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
 * Defines a key-value pair for css transformation
 */
export type Transformation = {
	property: TransformationType;
	value: TransformationValue;
};

/**
 * Defines possible css transformations
 */
export type TransformationType = 'rotate' | 'rotateX' | 'rotateY' | 'translate' | 'translateX' | 'translateY' | 'scale' | 'scaleX' | 'scaleY';

/**
 * Defines possible css transformation values
 */
export type TransformationValue = Point3D | Pair | number;

/**
 * Defines a point in 3d space (x, y and z) for rotation in 3d animations.
 */
export interface Point3D {
	x: number;
	y: number;
	z: number;
}

/**
 * Defines a pair of values (horizontal and vertical) for translate and scale animations.
 */
export interface Pair {
	x: number;
	y: number;
}

/**
 * Defines full information for css transformation
 */
export type TransformFunctionsInfo = {
	translate: Pair;
	rotate: Point3D;
	scale: Pair;
};

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
	public play: (resetOnFinish?: boolean) => AnimationPromise;
	public cancel: () => void;
	public isPlaying: boolean;
	public _resolveAnimationCurve(curve: any): any;
}

export function _resolveAnimationCurve(curve: any): any;
