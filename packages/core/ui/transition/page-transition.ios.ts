import type { View } from '../core/view';
import { SharedElementSettings, TransitionInteractiveState, Transition } from '.';
import { isNumber } from '../../utils/types';
import { CORE_ANIMATION_DEFAULTS, getDurationWithDampingFromSpring } from '../../utils/common';
import { PanGestureEventData, GestureStateTypes } from '../gestures';
import { SharedTransition, SharedTransitionAnimationType } from './shared-transition';
import { SharedTransitionHelper } from './shared-transition-helper';

export class PageTransition extends Transition {
	transitionController: PageTransitionController;
	interactiveController: UIPercentDrivenInteractiveTransition;
	presented: UIViewController;
	presenting: UIViewController;
	navigationController: UINavigationController;
	operation: number;
	sharedElements: {
		presented?: Array<SharedElementSettings>;
		presenting?: Array<SharedElementSettings>;
		// independent sharedTransitionTags which are part of the shared transition but only on one page
		independent?: Array<SharedElementSettings & { isPresented?: boolean }>;
	};
	private _interactiveStartCallback: () => void;
	private _interactiveDismissGesture: (args: any /*PanGestureEventData*/) => void;
	private _interactiveGestureTeardown: () => void;

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

	iosInteractionDismiss(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		// console.log('-- iosInteractionDismiss --');
		this.interactiveController = PercentInteractiveController.initWithOwner(new WeakRef(this));
		return this.interactiveController;
	}

	setupInteractiveGesture(startCallback: () => void, view: View): () => void {
		// console.log(' -- setupInteractiveGesture --');
		this._interactiveStartCallback = startCallback;
		if (!this._interactiveDismissGesture) {
			// console.log('setup but tearing down first!');
			view.off('pan', this._interactiveDismissGesture);
			this._interactiveDismissGesture = this._interactiveDismissGestureHandler.bind(this);
		}
		view.on('pan', this._interactiveDismissGesture);

		this._interactiveGestureTeardown = () => {
			// console.log(`-- TEARDOWN setupInteractiveGesture --`);
			if (view) {
				view.off('pan', this._interactiveDismissGesture);
			}
			this._interactiveDismissGesture = null;
		};
		return this._interactiveGestureTeardown;
	}

	private _interactiveDismissGestureHandler(args: PanGestureEventData) {
		if (args?.ios?.view) {
			// console.log('this.id:', this.id);
			const state = SharedTransition.getState(this.id);
			if (!state) {
				// cleanup and exit, already shutdown
				this._teardownGesture();
				return;
			}

			const percent = state.interactive?.dismiss?.percentFormula ? state.interactive.dismiss.percentFormula(args) : args.deltaX / (args.ios.view.bounds.size.width / 2);
			if (SharedTransition.DEBUG) {
				console.log('Interactive dismissal percentage:', percent);
			}
			switch (args.state) {
				case GestureStateTypes.began:
					SharedTransition.updateState(this.id, {
						interactiveBegan: true,
						interactiveCancelled: false,
					});
					if (this._interactiveStartCallback) {
						this._interactiveStartCallback();
					}
					break;
				case GestureStateTypes.changed:
					if (percent < 1) {
						if (this.interactiveController) {
							this.interactiveController.updateInteractiveTransition(percent);
						}
					}
					break;
				case GestureStateTypes.cancelled:
				case GestureStateTypes.ended:
					if (this.interactiveController) {
						const finishThreshold = isNumber(state.interactive?.dismiss?.finishThreshold) ? state.interactive.dismiss.finishThreshold : 0.5;
						if (percent > finishThreshold) {
							this._teardownGesture();
							this.interactiveController.finishInteractiveTransition();
						} else {
							SharedTransition.updateState(this.id, {
								interactiveCancelled: true,
							});
							this.interactiveController.cancelInteractiveTransition();
						}
					}
					break;
			}
		}
	}

	private _teardownGesture() {
		if (this._interactiveGestureTeardown) {
			this._interactiveGestureTeardown();
			this._interactiveGestureTeardown = null;
		}
	}
}

@NativeClass()
class PercentInteractiveController extends UIPercentDrivenInteractiveTransition implements UIViewControllerInteractiveTransitioning {
	static ObjCProtocols = [UIViewControllerInteractiveTransitioning];
	owner: WeakRef<PageTransition>;
	interactiveState: TransitionInteractiveState;

	static initWithOwner(owner: WeakRef<PageTransition>) {
		const ctrl = <PercentInteractiveController>PercentInteractiveController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning) {
		// console.log('startInteractiveTransition');
		if (!this.interactiveState) {
			this.interactiveState = {
				transitionContext,
			};
			const owner = this.owner?.deref();
			if (owner) {
				const state = SharedTransition.getState(owner.id);
				SharedTransitionHelper.interactiveStart(state, this.interactiveState, 'page');
			}
		}
	}

	updateInteractiveTransition(percentComplete: number) {
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveUpdate(state, this.interactiveState, 'page', percentComplete);
		}
	}

	cancelInteractiveTransition() {
		// console.log('cancelInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveCancel(state, this.interactiveState, 'page');
		}
	}

	finishInteractiveTransition() {
		// console.log('finishInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveFinish(state, this.interactiveState, 'page');
		}
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
					if (isNumber(state?.pageEnd?.duration)) {
						return state.pageEnd?.duration / 1000;
					} else {
						return getDurationWithDampingFromSpring(state.pageEnd?.spring).duration;
					}

				case SharedTransitionAnimationType.dismiss:
					if (isNumber(state?.pageReturn?.duration)) {
						return state.pageReturn?.duration / 1000;
					} else {
						return getDurationWithDampingFromSpring(state.pageReturn?.spring).duration;
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
