import { CORE_ANIMATION_DEFAULTS } from '../../utils/common';
import { Transition } from '.';

export class FadeTransition extends Transition {
	transitionController: FadeTransitionController;
	presented: UIViewController;
	presenting: UIViewController;
	operation: number;

	iosNavigatedController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
		this.transitionController = FadeTransitionController.initWithOwner(new WeakRef(this));
		this.presented = toVC;
		this.presenting = fromVC;
		this.operation = operation;
		// console.log('presenting:', this.presenting);
		return this.transitionController;
	}
}

@NativeClass()
export class FadeTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {
	static ObjCProtocols = [UIViewControllerAnimatedTransitioning];
	owner: WeakRef<FadeTransition>;

	static initWithOwner(owner: WeakRef<FadeTransition>) {
		const ctrl = <FadeTransitionController>FadeTransitionController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
		const owner = this.owner.deref();
		if (owner) {
			return owner.getDuration();
		}
		return CORE_ANIMATION_DEFAULTS.duration;
	}

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
		const owner = this.owner.deref();
		if (owner) {
			// console.log('FadeTransitionController animateTransition:', owner.operation);
			const toView = owner.presented.view;
			const originalToViewAlpha = toView.alpha;
			const fromView = owner.presenting.view;
			const originalFromViewAlpha = fromView.alpha;

			toView.alpha = 0.0;
			fromView.alpha = 1.0;

			switch (owner.operation) {
				case UINavigationControllerOperation.Push:
					transitionContext.containerView.insertSubviewAboveSubview(toView, fromView);
					break;
				case UINavigationControllerOperation.Pop:
					transitionContext.containerView.insertSubviewBelowSubview(toView, fromView);
					break;
			}

			const duration = owner.getDuration();
			const curve = owner.getCurve();
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
}
