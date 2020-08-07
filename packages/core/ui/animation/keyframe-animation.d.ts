import { View } from '../core/view';
import { Color } from '../../color';
import { PercentLength } from '../styling/style-properties';

export declare const ANIMATION_PROPERTIES;

interface Keyframe {
	backgroundColor?: Color;
	scale?: { x: number; y: number };
	translate?: { x: number; y: number };
	rotate?: { x: number; y: number; z: number };
	opacity?: number;
	width?: PercentLength;
	height?: PercentLength;
	valueSource?: 'keyframe' | 'animation';
	duration?: number;
	curve?: any;
	forceLayer?: boolean;
}

export interface Keyframes {
	name: string;
	keyframes: Array<UnparsedKeyframe>;
}

export interface UnparsedKeyframe {
	values: Array<any>;
	declarations: Array<KeyframeDeclaration>;
}

export interface KeyframeDeclaration {
	property: string;
	value: any;
}

export interface KeyframeInfo {
	duration: number;
	declarations: Array<KeyframeDeclaration>;
	curve?: any;
}

/**
 * Defines animation options for the View.animate method.
 */
export class KeyframeAnimationInfo {
	/**
	 * Return animation keyframes.
	 */
	keyframes: Array<KeyframeInfo>;

	/**
	 * The animation name.
	 */
	name?: string;

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

	/**
	 * Determines whether the animation values will be applied on the animated object after the animation finishes.
	 */
	isForwards: boolean;

	/**
	 * If true the animation will be played backwards.
	 */
	isReverse?: boolean;
}

export class KeyframeAnimation {
	animations: Array<Keyframe>;

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
	 * Returns true if the application is currently running.
	 */
	isPlaying: boolean;

	/**
	 * Plays the animation.
	 */
	public play: (view: View) => Promise<void>;

	/**
	 * Cancels a playing animation.
	 */
	public cancel: () => void;

	/**
	 * Creates a keyframe animation from animation definition.
	 */
	public static keyframeAnimationFromInfo(info: KeyframeAnimationInfo): KeyframeAnimation;
}
