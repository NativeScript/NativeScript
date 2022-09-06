import { Transition } from '.';

export class FadeTransition extends Transition {
	public animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		const toView = toViewCtrl.view;
		const originalToViewAlpha = toView.alpha;
		const fromView = fromViewCtrl.view;
		const originalFromViewAlpha = fromView.alpha;

		toView.alpha = 0.0;
		fromView.alpha = 1.0;

		switch (operation) {
			case UINavigationControllerOperation.Push:
				transitionContext.containerView.insertSubviewAboveSubview(toView, fromView);
				break;
			case UINavigationControllerOperation.Pop:
				transitionContext.containerView.insertSubviewBelowSubview(toView, fromView);
				break;
		}

		const duration = this.getDuration();
		const curve = this.getCurve();
		UIView.animateWithDurationAnimationsCompletion(
			duration,
			() => {
				UIView.setAnimationCurve(curve);
				toView.alpha = 1.0;
				fromView.alpha = 0.0;
			},
			(finished: boolean) => {
				toView.alpha = originalToViewAlpha;
				fromView.alpha = originalFromViewAlpha;
				transitionContext.completeTransition(finished);
			}
		);
	}
}
