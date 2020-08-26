import * as transition from '.';
import { Screen } from '../../platform';
import lazy from '../../utils/lazy';

const screenWidth = lazy(() => Screen.mainScreen.widthPixels);
const screenHeight = lazy(() => Screen.mainScreen.heightPixels);

export class SlideTransition extends transition.Transition {
	private _direction: string;

	constructor(direction: string, duration: number, curve: any) {
		super(duration, curve);
		this._direction = direction;
	}

	public createAndroidAnimator(transitionType: string): android.animation.Animator {
		const translationValues = Array.create('float', 2);
		switch (this._direction) {
			case 'left':
				switch (transitionType) {
					case transition.AndroidTransitionType.enter:
						translationValues[0] = screenWidth();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.exit:
						translationValues[0] = 0;
						translationValues[1] = -screenWidth();
						break;
					case transition.AndroidTransitionType.popEnter:
						translationValues[0] = -screenWidth();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.popExit:
						translationValues[0] = 0;
						translationValues[1] = screenWidth();
						break;
				}
				break;
			case 'right':
				switch (transitionType) {
					case transition.AndroidTransitionType.enter:
						translationValues[0] = -screenWidth();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.exit:
						translationValues[0] = 0;
						translationValues[1] = screenWidth();
						break;
					case transition.AndroidTransitionType.popEnter:
						translationValues[0] = screenWidth();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.popExit:
						translationValues[0] = 0;
						translationValues[1] = -screenWidth();
						break;
				}
				break;
			case 'top':
				switch (transitionType) {
					case transition.AndroidTransitionType.enter:
						translationValues[0] = screenHeight();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.exit:
						translationValues[0] = 0;
						translationValues[1] = -screenHeight();
						break;
					case transition.AndroidTransitionType.popEnter:
						translationValues[0] = -screenHeight();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.popExit:
						translationValues[0] = 0;
						translationValues[1] = screenHeight();
						break;
				}
				break;
			case 'bottom':
				switch (transitionType) {
					case transition.AndroidTransitionType.enter:
						translationValues[0] = -screenHeight();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.exit:
						translationValues[0] = 0;
						translationValues[1] = screenHeight();
						break;
					case transition.AndroidTransitionType.popEnter:
						translationValues[0] = screenHeight();
						translationValues[1] = 0;
						break;
					case transition.AndroidTransitionType.popExit:
						translationValues[0] = 0;
						translationValues[1] = -screenHeight();
						break;
				}
				break;
		}

		let prop;

		if (this._direction === 'left' || this._direction === 'right') {
			prop = 'translationX';
		} else {
			prop = 'translationY';
		}

		const animator = android.animation.ObjectAnimator.ofFloat(null, prop, translationValues);
		const duration = this.getDuration();
		if (duration !== undefined) {
			animator.setDuration(duration);
		}
		animator.setInterpolator(this.getCurve());

		return animator;
	}

	public toString(): string {
		return `${super.toString()} ${this._direction}`;
	}
}
