import { AnimationBase, AnimationDefinition, AnimationPromise } from './animation-common';

export * from './animation-common';

export class Animation extends AnimationBase {
	constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
	}

	_resolveAnimationCurve(curve: any): any {
		return curve;
	}

	public play(): AnimationPromise {
		return super.play();
	}

	public cancel(): void {
		this._rejectAnimationFinishedPromise();
	}
}
