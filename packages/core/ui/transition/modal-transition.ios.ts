import type { View } from '../core/view';
import { CORE_ANIMATION_DEFAULTS } from '../../utils/common';
import { isNumber } from '../../utils/types';
import { Transition, SharedElementSettings, TransitionInteractiveState } from '.';
import { SharedTransition } from './shared-transition';
import { SharedTransitionHelper } from './shared-transition-helper';
import { PanGestureEventData, GestureStateTypes } from '../gestures';

export class ModalTransition extends Transition {
	transitionController: ModalTransitionController;
	interactiveController: UIPercentDrivenInteractiveTransition;
	interactiveGestureRecognizer: UIScreenEdgePanGestureRecognizer;
	presented: UIViewController;
	presenting: UIViewController;
	sharedElements: {
		presented?: Array<SharedElementSettings>;
		presenting?: Array<SharedElementSettings>;
		// independent sharedTransitionTags which are part of the shared transition but only on one page
		independent?: Array<SharedElementSettings & { isPresented?: boolean }>;
	};
	private _interactiveStartCallback: () => void;
	private _interactiveDismissGesture: (args: any /*PanGestureEventData*/) => void;

	iosPresentedController(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning {
		this.transitionController = ModalTransitionController.initWithOwner(new WeakRef(this));
		this.presented = presented;
		// console.log('presenting:', presenting)
		return this.transitionController;
	}

	iosDismissedController(dismissed: UIViewController): UIViewControllerAnimatedTransitioning {
		this.transitionController = ModalTransitionController.initWithOwner(new WeakRef(this));
		this.presented = dismissed;
		return this.transitionController;
	}

	iosInteractionDismiss(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		// console.log('-- iosInteractionDismiss --');
		this.interactiveController = PercentInteractiveController.initWithOwner(new WeakRef(this));
		return this.interactiveController;
	}

	iosInteractionPresented(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		// console.log('-- iosInteractionPresented --');
		return null;
	}

	setupInteractiveGesture(startCallback: () => void, view: View) {
		this._interactiveStartCallback = startCallback;
		this._interactiveDismissGesture = this._interactiveDismissGestureHandler.bind(this);
		view.on('pan', this._interactiveDismissGesture);
		// this.interactiveGestureRecognizer = UIScreenEdgePanGestureRecognizer.alloc().initWithTargetAction()
		// 			let edgeSwipeGestureRecognizer = UIScreenEdgePanGestureRecognizer(target: self, action: #selector(handleSwipe(_:)))
		// edgeSwipeGestureRecognizer.edges = .left
		// view.addGestureRecognizer(edgeSwipeGestureRecognizer)
	}

	private _interactiveDismissGestureHandler(args: PanGestureEventData) {
		if (args?.ios?.view) {
			const state = SharedTransition.getState(this.id);
			const percent = state.interactive?.dismiss?.percentFormula ? state.interactive.dismiss.percentFormula(args) : args.deltaY / (args.ios.view.bounds.size.height / 2);
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
}

@NativeClass()
class PercentInteractiveController extends UIPercentDrivenInteractiveTransition implements UIViewControllerInteractiveTransitioning {
	static ObjCProtocols = [UIViewControllerInteractiveTransitioning];
	owner: WeakRef<ModalTransition>;
	interactiveState: TransitionInteractiveState;

	static initWithOwner(owner: WeakRef<ModalTransition>) {
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
				SharedTransitionHelper.interactiveStart(state, this.interactiveState, 'modal');
			}
		}
	}

	updateInteractiveTransition(percentComplete: number) {
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveUpdate(state, this.interactiveState, 'modal', percentComplete);
		}
	}

	cancelInteractiveTransition() {
		// console.log('cancelInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveCancel(state, this.interactiveState, 'modal');
		}
	}

	finishInteractiveTransition() {
		// console.log('finishInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner) {
			const state = SharedTransition.getState(owner.id);
			SharedTransitionHelper.interactiveFinish(state, this.interactiveState, 'modal');
		}
	}
}

@NativeClass()
class ModalTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {
	static ObjCProtocols = [UIViewControllerAnimatedTransitioning];
	owner: WeakRef<ModalTransition>;

	static initWithOwner(owner: WeakRef<ModalTransition>) {
		const ctrl = <ModalTransitionController>ModalTransitionController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
		return CORE_ANIMATION_DEFAULTS.duration;
	}

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
		// console.log('ModalTransitionController animateTransition');
		const owner = this.owner.deref();
		if (owner) {
			// console.log('owner.id:', owner.id);
			const state = SharedTransition.getState(owner.id);
			if (!state) {
				return;
			}
			SharedTransitionHelper.animate(state, transitionContext, 'modal');
		}
	}
}
