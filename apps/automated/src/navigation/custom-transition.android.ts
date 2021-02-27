import { Transition } from '@nativescript/core';

export class CustomTransition extends Transition {
	constructor(duration: number, curve: any) {
		super(duration, curve);
	}

	public createAndroidAnimator(transitionType: string): android.animation.Animator {
		var scaleValues = Array.create('float', 2);
		switch (transitionType) {
			case Transition.AndroidTransitionType.enter:
			case Transition.AndroidTransitionType.popEnter:
				scaleValues[0] = 0;
				scaleValues[1] = 1;
				break;
			case Transition.AndroidTransitionType.exit:
			case Transition.AndroidTransitionType.popExit:
				scaleValues[0] = 1;
				scaleValues[1] = 0;
				break;
		}
		var objectAnimators = Array.create(android.animation.Animator, 2);
		objectAnimators[0] = android.animation.ObjectAnimator.ofFloat(null, 'scaleX', scaleValues);
		objectAnimators[1] = android.animation.ObjectAnimator.ofFloat(null, 'scaleY', scaleValues);
		var animatorSet = new android.animation.AnimatorSet();
		animatorSet.playTogether(objectAnimators);

		var duration = this.getDuration();
		if (duration !== undefined) {
			animatorSet.setDuration(duration);
		}
		animatorSet.setInterpolator(this.getCurve());

		return animatorSet;
	}
}
