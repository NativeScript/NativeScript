// Shared animation types/interfaces for animation and styling modules.
// Only put platform-agnostic types/interfaces here.

import type { View } from '../core/view';
import type { CoreTypes } from '../../core-types';
import type { Color } from '../../color';

export type Transformation = {
	property: TransformationType;
	value: TransformationValue;
};

export type TransformationType = 'rotate' | 'rotate3d' | 'rotateX' | 'rotateY' | 'translate' | 'translate3d' | 'translateX' | 'translateY' | 'scale' | 'scale3d' | 'scaleX' | 'scaleY';

export type TransformationValue = Point3D | Pair | number;

export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export type TransformFunctionsInfo = {
	translate: Pair;
	rotate: Point3D;
	scale: Pair;
};

export interface Pair {
	x: number;
	y: number;
}

export interface Cancelable {
	cancel(): void;
}

export type AnimationPromise = Promise<void> & Cancelable;


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

	[k: string]: any;
}

export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export interface Pair {
	x: number;
	y: number;
}

export interface Cancelable {
	cancel(): void;
}

export interface PropertyAnimation {
	target: View;
	property: any;
	propertyName: string;
	value: any;
	duration?: number;
	delay?: number;
	iterations?: number;
	curve?: any;
	animationBlock?: Function;
}

export interface PropertyAnimationInfo extends PropertyAnimation {
	_propertyResetCallback?: any;
	_originalValue?: any;
}

export interface AnimationDefinitionInternal extends AnimationDefinition {
	valueSource?: 'animation' | 'keyframe';
}

export interface IOSView extends View {
	_suspendPresentationLayerUpdates();
	_resumePresentationLayerUpdates();
	_isPresentationLayerUpdateSuspended();
}
