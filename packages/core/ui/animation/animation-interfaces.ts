// Types
import { View } from '../core/view';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';

export type Transformation = {
	property: TransformationType;
	value: TransformationValue;
};

export type TransformationType = 'rotate' | 'translate' | 'translateX' | 'translateY' | 'scale' | 'scaleX' | 'scaleY';

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

export interface AnimationPromise extends Promise<any>, Cancelable {
	then(...args): AnimationPromise;
	catch(...args): AnimationPromise;
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
	property: string;
	value: any;
	duration?: number;
	delay?: number;
	iterations?: number;
	curve?: any;
}

export interface PropertyAnimationInfo extends PropertyAnimation {
	_propertyResetCallback?: any;
	_originalValue?: any;
}

export interface AnimationDefinition {
	target?: View;
	opacity?: number;
	backgroundColor?: Color;
	translate?: Pair;
	scale?: Pair;
	height?: CoreTypes.PercentLengthType | string;
	width?: CoreTypes.PercentLengthType | string;
	rotate?: Point3D;
	duration?: number;
	delay?: number;
	iterations?: number;
	curve?: any;
}

export interface AnimationDefinitionInternal extends AnimationDefinition {
	valueSource?: 'animation' | 'keyframe';
}

export interface IOSView extends View {
	_suspendPresentationLayerUpdates();
	_resumePresentationLayerUpdates();
	_isPresentationLayerUpdateSuspended();
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

	constructor(x1: number, y1: number, x2: number, y2: number) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
}
