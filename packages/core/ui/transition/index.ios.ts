import { CORE_ANIMATION_DEFAULTS } from '../../utils/common';
import type { Transition as TransitionType } from '.';

let transitionId = 0;
export class Transition implements TransitionType {
	static AndroidTransitionType = {};
	id: number;
	private _duration: number;
	private _curve: UIViewAnimationCurve;

	constructor(duration: number = 350, nativeCurve: UIViewAnimationCurve = UIViewAnimationCurve.EaseInOut) {
		this._duration = duration ? duration / 1000 : CORE_ANIMATION_DEFAULTS.duration;
		this._curve = nativeCurve;
		transitionId++;
		this.id = transitionId;
	}

	public getDuration(): number {
		return this._duration;
	}

	public setDuration(value: number) {
		this._duration = value;
	}

	public getCurve(): UIViewAnimationCurve {
		return this._curve;
	}

	public animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		throw new Error('Abstract method call');
	}

	public createAndroidAnimator(transitionType: string): any {
		throw new Error('Abstract method call');
	}

	public toString(): string {
		return `Transition@${this.id}`;
	}
}
