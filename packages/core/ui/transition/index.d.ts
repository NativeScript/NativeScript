export interface TransitionType {
	id: number;

	iosDismissedController?(dismissed: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosPresentedController?(presented: any /* UIViewController */, presenting: any /* UIViewController */, source: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosInteractionDismiss?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosInteractionPresented?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosPresentedViewController?(presented: any /* UIViewController */, presenting: any /* UIViewController */, source: any /* UIViewController */): any /* UIPresentationController */;
}

export declare class Transition implements TransitionType {
	id: number;
	static AndroidTransitionType?: { enter?: string; exit?: string; popEnter?: string; popExit?: string };
	constructor(duration?: number, nativeCurve?: any /* UIViewAnimationCurve | string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator */);
	getDuration(): number;
	getCurve(): any;
	animateIOSTransition(transitionContext: any /*UIViewControllerContextTransitioning */, fromViewCtrl: any /* UIViewController */, toViewCtrl: any /* UIViewController */, operation: any /* UINavigationControllerOperation */): void;
	createAndroidAnimator(transitionType: string): any;
	toString(): string;
}
