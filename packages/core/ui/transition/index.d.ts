import type { View } from '../core/view';
import type { BackstackEntry } from '../frame';
export type SharedTransitionTagPropertiesToMatch = {
	/**
	 * View related properties
	 */
	view?: Array<string>;
	/**
	 * For iOS, can be specific if CALayer related properties
	 */
	layer?: Array<string>;
};
export type SharedElementSettings = { view: View; startFrame: any; endFrame?: any; startOpacity?: number; endOpacity?: number; scale?: { x?: number; y?: number }; zIndex?: number; startTransform?: any; snapshot?: any; propertiesToMatch?: SharedTransitionTagPropertiesToMatch };
export type TransitionNavigationType = 'page' | 'modal';
export interface TransitionInteractiveState {
	started?: false;
	added?: boolean;
	transitionContext?: any;
	propertyAnimator?: any;
}

export declare class Transition {
	id: number;
	/**
	 * (Optional) Provide a unique name to identify this transition
	 */
	name?: string;
	transitionController?: any;
	interactiveController?: any;
	presented?: any;
	presenting?: any;
	sharedElements?: {
		presented?: Array<SharedElementSettings>;
		presenting?: Array<SharedElementSettings>;
		// independent sharedTransitionTags which are part of the shared transition but only on one page
		independent?: Array<SharedElementSettings & { isPresented?: boolean }>;
	};
	static AndroidTransitionType?: { enter?: string; exit?: string; popEnter?: string; popExit?: string };
	constructor(duration?: number, nativeCurve?: any /* UIViewAnimationCurve | string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator */);
	getDuration(): number;
	setDuration(value: number): void;
	getCurve(): any;
	animateIOSTransition(transitionContext: any /*UIViewControllerContextTransitioning */, fromViewCtrl: any /* UIViewController */, toViewCtrl: any /* UIViewController */, operation: any /* UINavigationControllerOperation */): void;
	createAndroidAnimator(transitionType: string): any;

	setupInteractiveGesture?(startCallback: () => void, view: View): void;

	iosDismissedController?(dismissed: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosPresentedController?(presented: any /* UIViewController */, presenting: any /* UIViewController */, source: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	iosInteractionDismiss?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosInteractionPresented?(animator: any /* UIViewControllerAnimatedTransitioning */): any /* UIViewControllerInteractiveTransitioning */;

	iosNavigatedController?(navigationController: any /* UINavigationController */, operation: number, fromVC: any /* UIViewController */, toVC: any /* UIViewController */): any /* UIViewControllerAnimatedTransitioning */;

	androidFragmentTransactionCallback?(fragmentTransaction: any /* androidx.fragment.app.FragmentTransaction */, currentEntry: BackstackEntry, newEntry: BackstackEntry): void;
}
