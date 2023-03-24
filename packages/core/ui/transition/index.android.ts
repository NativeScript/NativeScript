import { _resolveAnimationCurve } from '../animation';
import lazy from '../../utils/lazy';
import type { Transition as TransitionType } from '.';

const _defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

let transitionId = 0;
export class Transition implements TransitionType {
	static AndroidTransitionType = {
		enter: 'enter',
		exit: 'exit',
		popEnter: 'popEnter',
		popExit: 'popExit',
	};
	id: number;
	private _duration: number;
	private _interpolator: android.view.animation.Interpolator;

	constructor(duration: number = 350, curve?: any) {
		this._duration = duration;
		this._interpolator = curve ? _resolveAnimationCurve(curve) : _defaultInterpolator();
		transitionId++;
		this.id = transitionId;
	}

	public getDuration(): number {
		return this._duration;
	}

	public setDuration(value: number) {
		this._duration = value;
	}

	public getCurve(): android.view.animation.Interpolator {
		return this._interpolator;
	}

	public animateIOSTransition(transitionContext: any, fromViewCtrl: any, toViewCtrl: any, operation: any): void {
		throw new Error('Abstract method call');
	}

	public createAndroidAnimator(transitionType: string): android.animation.Animator {
		throw new Error('Abstract method call');
	}

	public toString(): string {
		return `Transition@${this.id}`;
	}
}
