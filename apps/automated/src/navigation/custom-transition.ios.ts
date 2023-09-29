import { PageTransition, SharedTransition, SharedTransitionAnimationType, SharedTransitionHelper, Transition, Utils } from '@nativescript/core';
import { CORE_ANIMATION_DEFAULTS } from '@nativescript/core/utils';

export class CustomTransition extends Transition {
	constructor(duration: number, curve: any) {
		super(duration, curve);
	}

	animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		const toView = toViewCtrl.view;
		const fromView = fromViewCtrl.view;
		toView.transform = CGAffineTransformMakeScale(0, 0);
		fromView.transform = CGAffineTransformIdentity;

		switch (operation) {
			case UINavigationControllerOperation.Push:
				transitionContext.containerView.insertSubviewAboveSubview(toView, fromView);
				break;
			case UINavigationControllerOperation.Pop:
				transitionContext.containerView.insertSubviewBelowSubview(toView, fromView);
				break;
		}

		var duration = this.getDuration();
		var curve = this.getCurve();
		UIView.animateWithDurationAnimationsCompletion(
			duration,
			() => {
				UIView.setAnimationCurve(curve);
				toView.transform = CGAffineTransformIdentity;
				fromView.transform = CGAffineTransformMakeScale(0, 0);
			},
			(finished) => {
				transitionContext.completeTransition(finished);
			}
		);
	}
}

export class CustomSharedElementPageTransition extends PageTransition {
	transitionController: PageTransitionController;
	interactiveController: UIPercentDrivenInteractiveTransition;
	presented: UIViewController;
	presenting: UIViewController;
	navigationController: UINavigationController;
	operation: number;

	iosNavigatedController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
		this.navigationController = navigationController;
		if (!this.transitionController) {
			this.presented = toVC;
			this.presenting = fromVC;
		}
		this.transitionController = PageTransitionController.initWithOwner(new WeakRef(this));
		// console.log('iosNavigatedController presenting:', this.presenting);

		this.operation = operation;
		return this.transitionController;
	}
}

@NativeClass()
class PageTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {
	static ObjCProtocols = [UIViewControllerAnimatedTransitioning];
	owner: WeakRef<PageTransition>;

	static initWithOwner(owner: WeakRef<PageTransition>) {
		const ctrl = <PageTransitionController>PageTransitionController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
		const owner = this.owner.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			switch (state?.activeType) {
				case SharedTransitionAnimationType.present:
					if (Utils.isNumber(state?.pageEnd?.duration)) {
						return state.pageEnd?.duration / 1000;
					} else {
						return Utils.getDurationWithDampingFromSpring(state.pageEnd?.spring).duration;
					}

				case SharedTransitionAnimationType.dismiss:
					if (Utils.isNumber(state?.pageReturn?.duration)) {
						return state.pageReturn?.duration / 1000;
					} else {
						return Utils.getDurationWithDampingFromSpring(state.pageReturn?.spring).duration;
					}
			}
		}
		return CORE_ANIMATION_DEFAULTS.duration;
	}

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
		const owner = this.owner.deref();
		if (owner) {
			// console.log('--- PageTransitionController animateTransition');
			const state = SharedTransition.getState(owner.id);
			if (!state) {
				return;
			}
			SharedTransitionHelper.animate(state, transitionContext, 'page');
		}
	}
}
