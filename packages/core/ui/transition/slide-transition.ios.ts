import { Transition } from '.';
import { Screen } from '../../platform';

const leftEdge = CGAffineTransformMakeTranslation(-Screen.mainScreen.widthDIPs, 0);
const rightEdge = CGAffineTransformMakeTranslation(Screen.mainScreen.widthDIPs, 0);
const topEdge = CGAffineTransformMakeTranslation(0, -Screen.mainScreen.heightDIPs);
const bottomEdge = CGAffineTransformMakeTranslation(0, Screen.mainScreen.heightDIPs);

export class SlideTransition extends Transition {
	private _direction: string;

	constructor(direction: string, duration: number, curve: any) {
		super(duration, curve);
		this._direction = direction;
	}

	public animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		const toView = toViewCtrl.view;
		const originalToViewTransform = toView.transform;
		const fromView = fromViewCtrl.view;
		const originalFromViewTransform = fromView.transform;

		let fromViewEndTransform: CGAffineTransform;
		let toViewBeginTransform: CGAffineTransform;
		const push = operation === UINavigationControllerOperation.Push;

		switch (this._direction) {
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
