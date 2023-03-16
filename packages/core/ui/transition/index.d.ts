import type { BackstackEntry } from '../frame';

export declare class Transition {
	id: number;
	static AndroidTransitionType?: { enter?: string; exit?: string; popEnter?: string; popExit?: string };
	constructor(duration?: number, nativeCurve?: any /* UIViewAnimationCurve | string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator */);
	getDuration(): number;
	getCurve(): any;
	animateIOSTransition(transitionContext: any /*UIViewControllerContextTransitioning */, fromViewCtrl: any /* UIViewController */, toViewCtrl: any /* UIViewController */, operation: any /* UINavigationControllerOperation */): void;
	createAndroidAnimator(transitionType: string): any;
	iosDismissedController?(dismissed: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosPresentedController?(presented: any /* UIViewController */, presenting: any /* UIViewController */, source: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosInteractionDismiss?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosInteractionPresented?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosPresentedViewController?(presented: any /* UIViewController */, presenting: any /* UIViewController */, source: any /* UIViewController */): any /* UIPresentationController */;

	androidFragmentTransactionCallback?(fragmentTransaction: any /* androidx.fragment.app.FragmentTransaction */, currentEntry: BackstackEntry, newEntry: BackstackEntry): void;
}
