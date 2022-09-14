let transitionId = 0;
export class Transition {
	static AndroidTransitionType = {};
	private _duration: number;
	private _curve: UIViewAnimationCurve;
	private _id: number;

	constructor(duration: number, curve: UIViewAnimationCurve = UIViewAnimationCurve.EaseInOut) {
		this._duration = duration ? duration / 1000 : 0.35;
		this._curve = curve;
		this._id = transitionId++;
	}

	public getDuration(): number {
		return this._duration;
	}

	public getCurve(): UIViewAnimationCurve {
		return this._curve;
	}

	public animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		throw new Error('Abstract method call');
	}

	public createAndroidAnimator(transitionType: string): any {
		throw new Error('Abstract method call');
	}

	public toString(): string {
		return `Transition@${this._id}`;
	}
}

export class CustomTransitionModal extends Transition {
	// Extend this class to create your own
	dismissedController?(dismissed: UIViewController): UIViewControllerAnimatedTransitioning {
		return null;
	}

	presentedController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning {
		return null;
	}

	interactionDismiss?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		return null;
	}

	interactionPresented?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		return null;
	}

	presentedViewController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIPresentationController {
		return null;
	}
}
