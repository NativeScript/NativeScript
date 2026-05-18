export * from './shared-transition';

let transitionId = 0;

export class Transition {
	static AndroidTransitionType: { enter?: string; exit?: string; popEnter?: string; popExit?: string } = {};
	id: number;
	name?: string;
	private _duration: number;
	private _curve: any;

	constructor(duration: number = 350, nativeCurve?: any) {
		this._duration = duration ? duration / 1000 : 0.35;
		this._curve = nativeCurve;
		transitionId++;
		this.id = transitionId;
	}

	getDuration(): number {
		return this._duration;
	}

	setDuration(value: number): void {
		this._duration = value;
	}

	getCurve(): any {
		return this._curve;
	}

	animateIOSTransition(_transitionContext: any, _fromViewCtrl: any, _toViewCtrl: any, _operation: any): void {
		throw new Error('Abstract method call');
	}

	createAndroidAnimator(_transitionType: string): any {
		throw new Error('Abstract method call');
	}

	toString(): string {
		return `Transition@${this.id}`;
	}
}
