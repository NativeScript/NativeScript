import * as transition from '@nativescript/core/ui/transition';

export class CustomTransition extends transition.Transition {
	constructor(duration: number, curve: any) {
		super(duration, curve);
	}

	public createAndroidAnimator(transitionType: string): android.animation.Animator {
		var scaleValues = Array.create('float', 2);
		switch (transitionType) {
			case transition.AndroidTransitionType.enter:
			case transition.AndroidTransitionType.popEnter:
				scaleValues[0] = 0;
				scaleValues[1] = 1;
				break;
			case transition.AndroidTransitionType.exit:
			case transition.AndroidTransitionType.popExit:
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
