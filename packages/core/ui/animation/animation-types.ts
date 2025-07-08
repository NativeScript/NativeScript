// Shared types/interfaces for animation
import { View } from '../core/view';

export interface AnimationDefinition {
	target?: View;
	opacity?: number;
	backgroundColor?: any;
	translate?: { x: number; y: number };
	scale?: { x: number; y: number };
	height?: any;
	width?: any;
	rotate?: number | { x: number; y: number; z: number };
	duration?: number;
	delay?: number;
	iterations?: number;
	curve?: any;
}

// Types from index.d.ts that need to be exported for consumers
export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export interface Pair {
	x: number;
	y: number;
}

export type TransformationType = 'rotate' | 'rotate3d' | 'rotateX' | 'rotateY' | 'translate' | 'translate3d' | 'translateX' | 'translateY' | 'scale' | 'scale3d' | 'scaleX' | 'scaleY';

export type TransformationValue = Point3D | Pair | number;

export type Transformation = {
	property: TransformationType;
	value: TransformationValue;
};

export type TransformFunctionsInfo = {
	translate: Pair;
	rotate: Point3D;
	scale: Pair;
};

export interface Cancelable {
	cancel(): void;
}

export type AnimationPromise = Promise<void> & Cancelable;
