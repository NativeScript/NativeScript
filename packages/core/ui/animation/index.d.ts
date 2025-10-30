export type { Pair, Transformation, TransformationType, TransformationValue, TransformFunctionsInfo, Point3D, AnimationPromise, Cancelable } from './animation-types';
export { KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './keyframe-animation';
import type { AnimationDefinition, AnimationPromise } from './animation-types';

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
