import { Transition } from '.';
import { Screen } from '../../platform';
import { CORE_ANIMATION_DEFAULTS } from '../../utils/common';

export class SlideTransition extends Transition {
	transitionController: SlideTransitionController;
	presented: UIViewController;
	presenting: UIViewController;
	operation: number;
	direction: string;

	constructor(direction: string, duration: number, curve: any) {
		super(duration, curve);
		this.direction = direction;
	}

	iosNavigatedController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
		this.transitionController = SlideTransitionController.initWithOwner(new WeakRef(this));
		this.presented = toVC;
		this.presenting = fromVC;
		this.operation = operation;
		// console.log('presenting:', presenting)
		return this.transitionController;
	}
}

@NativeClass()
export class SlideTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {
	static ObjCProtocols = [UIViewControllerAnimatedTransitioning];
	owner: WeakRef<SlideTransition>;

	static initWithOwner(owner: WeakRef<SlideTransition>) {
		const ctrl = <SlideTransitionController>SlideTransitionController.new();
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
		// console.log('SlideTransitionController animateTransition');
		const owner = this.owner.deref();
		if (owner) {
			const toView = owner.presented.view;
			const originalToViewTransform = toView.transform;
			const fromView = owner.presenting.view;
			const originalFromViewTransform = fromView.transform;

			let fromViewEndTransform: CGAffineTransform;
			let toViewBeginTransform: CGAffineTransform;
			const push = owner.operation === UINavigationControllerOperation.Push;

			const leftEdge = CGAffineTransformMakeTranslation(-Screen.mainScreen.widthDIPs, 0);
			const rightEdge = CGAffineTransformMakeTranslation(Screen.mainScreen.widthDIPs, 0);
			const topEdge = CGAffineTransformMakeTranslation(0, -Screen.mainScreen.heightDIPs);
			const bottomEdge = CGAffineTransformMakeTranslation(0, Screen.mainScreen.heightDIPs);

			switch (owner.direction) {
				case 'left':
					toViewBeginTransform = push ? rightEdge : leftEdge;
					fromViewEndTransform = push ? leftEdge : rightEdge;
					break;
				case 'right':
					toViewBeginTransform = push ? leftEdge : rightEdge;
					fromViewEndTransform = push ? rightEdge : leftEdge;
					break;
				case 'top':
					toViewBeginTransform = push ? bottomEdge : topEdge;
					fromViewEndTransform = push ? topEdge : bottomEdge;
					break;
				case 'bottom':
					toViewBeginTransform = push ? topEdge : bottomEdge;
					fromViewEndTransform = push ? bottomEdge : topEdge;
					break;
			}

			toView.transform = toViewBeginTransform;
			fromView.transform = CGAffineTransformIdentity;

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
					toView.transform = CGAffineTransformIdentity;
					fromView.transform = fromViewEndTransform;
				},
				(finished: boolean) => {
					toView.transform = originalToViewTransform;
					fromView.transform = originalFromViewTransform;
					transitionContext.completeTransition(finished);
				}
			);
		}
	}
}
