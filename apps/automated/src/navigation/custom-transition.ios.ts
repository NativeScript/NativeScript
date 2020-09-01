import * as transition from '@nativescript/core/ui/transition';

export class CustomTransition extends transition.Transition {
	constructor(duration: number, curve: any) {
		super(duration, curve);
	}

	public animateIOSTransition(containerView: UIView, fromView: UIView, toView: UIView, operation: UINavigationControllerOperation, completion: (finished: boolean) => void): void {
		toView.transform = CGAffineTransformMakeScale(0, 0);
		fromView.transform = CGAffineTransformIdentity;

		switch (operation) {
			case UINavigationControllerOperation.Push:
				containerView.insertSubviewAboveSubview(toView, fromView);
				break;
			case UINavigationControllerOperation.Pop:
				containerView.insertSubviewBelowSubview(toView, fromView);
				break;
		}

		var duration = this.getDuration();
		var curve = this.getCurve();
		UIView.animateWithDurationAnimationsCompletion(
			duration,
			() => {
				UIView.setAnimationCurve(curve);
				toView.transform = CGAffineTransformIdentity;
				fromView.transform = CGAffineTransformMakeScale(0, 0);
			},
			completion
		);
	}
}
