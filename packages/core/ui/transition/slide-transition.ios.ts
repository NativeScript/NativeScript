import { Transition } from '.';
import { Screen } from '../../platform';

let leftEdge = CGAffineTransformMakeTranslation(-Screen.mainScreen.widthDIPs, 0);
let rightEdge = CGAffineTransformMakeTranslation(Screen.mainScreen.widthDIPs, 0);
let topEdge = CGAffineTransformMakeTranslation(0, -Screen.mainScreen.heightDIPs);
let bottomEdge = CGAffineTransformMakeTranslation(0, Screen.mainScreen.heightDIPs);

export class SlideTransition extends Transition {
	private _direction: string;

	constructor(direction: string, duration: number, curve: any) {
		super(duration, curve);
		this._direction = direction;
	}

	public animateIOSTransition(containerView: UIView, fromView: UIView, toView: UIView, operation: UINavigationControllerOperation, completion: (finished: boolean) => void): void {
		let originalToViewTransform = toView.transform;
		let originalFromViewTransform = fromView.transform;

		let fromViewEndTransform: CGAffineTransform;
		let toViewBeginTransform: CGAffineTransform;
		let push = operation === UINavigationControllerOperation.Push;

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
				containerView.insertSubviewAboveSubview(toView, fromView);
				break;
			case UINavigationControllerOperation.Pop:
				containerView.insertSubviewBelowSubview(toView, fromView);
				break;
		}

		let duration = this.getDuration();
		let curve = this.getCurve();
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
				completion(finished);
			}
		);
	}
}
