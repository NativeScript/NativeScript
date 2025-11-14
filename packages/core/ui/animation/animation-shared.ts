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

export interface AnimationDefinition {
	target?: View;
	opacity?: number;
	backgroundColor?: Color | any;
	translate?: Pair | { x: number; y: number };
	scale?: Pair | { x: number; y: number };
	height?: CoreTypes.PercentLengthType | string | any;
	width?: CoreTypes.PercentLengthType | string | any;
	rotate?: number | Point3D | { x: number; y: number; z: number };
	duration?: number;
	delay?: number;
	iterations?: number;
	curve?: any;
	animationBlock?: any;
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
