export declare class Transition {
	static AndroidTransitionType: { enter: string; exit: string; popEnter: string; popExit: string };
	constructor(duration: number, nativeCurve?: any /* UIViewAnimationCurve | string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator */);
	public getDuration(): number;
	public getCurve(): any;
	public animateIOSTransition(transitionContext: any /*UIViewControllerContextTransitioning */, fromViewCtrl: any /* UIViewController */, toViewCtrl: any /* UIViewController */, operation: any /* UINavigationControllerOperation */): void;
	public createAndroidAnimator(transitionType: string): any;
	public toString(): string;
}

export declare class CustomTransitionModal extends Transition {
	dismissedController?(dismissed: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	presentedController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning;

	interactionDismiss?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	interactionPresented?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	presentedViewController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIPresentationController;
}
