import type { View } from '../core/view';
import { Screen } from '../../platform';
import { iOSNativeHelper } from '../../utils/native-helper';
import { isNumber } from '../../utils/types';
import { Transition } from '.';
import { SharedTransition, SharedTransitionAnimationType, DEFAULT_DURATION, DEFAULT_SPRING } from './shared-transition';
import { PanGestureEventData, GestureStateTypes } from '../gestures';

export class ModalTransition extends Transition {
	transitionController: ModalTransitionController;
	interactiveController: UIPercentDrivenInteractiveTransition;
	interactiveGestureRecognizer: UIScreenEdgePanGestureRecognizer;
	presented: UIViewController;
	presenting: UIViewController;
	sharedElements: {
		presented?: Array<{ view: View; startFrame?: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
		presenting?: Array<{ view: View; startFrame: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
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
			// SharedTransition.updateState(this.id, {
			// 	interactiveBegan: true,
			// 	interactiveCancelled: false
			// });
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
	started = false;
	transitionContext: UIViewControllerContextTransitioning;
	backgroundAnimation: UIViewPropertyAnimator;

	static initWithOwner(owner: WeakRef<ModalTransition>) {
		const ctrl = <PercentInteractiveController>PercentInteractiveController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning) {
		// console.log('startInteractiveTransition');
		this.transitionContext = transitionContext;
	}

	updateInteractiveTransition(percentComplete: number) {
		const owner = this.owner?.deref();
		if (owner) {
			if (!this.started) {
				this.started = true;
				for (const p of owner.sharedElements.presented) {
					p.view.opacity = 0;
				}
				for (const p of owner.sharedElements.presenting) {
					p.snapshot.alpha = p.endOpacity;
					this.transitionContext.containerView.addSubview(p.snapshot);
				}
				const state = SharedTransition.getState(owner.id);
				const toProps = state.toPageStart;
				const startY = isNumber(toProps?.y) ? toProps?.y : Screen.mainScreen.heightDIPs;
				this.backgroundAnimation = UIViewPropertyAnimator.alloc().initWithDurationDampingRatioAnimations(1, 1, () => {
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.frame = p.startFrame;
						iOSNativeHelper.copyLayerProperties(p.snapshot, p.view.ios);

						p.snapshot.alpha = 1;
					}
					owner.presented.view.alpha = 0;
					owner.presented.view.frame = CGRectMake(0, startY, owner.presented.view.bounds.size.width, owner.presented.view.bounds.size.height);
				});
			}

			this.backgroundAnimation.fractionComplete = percentComplete;
		}
	}

	cancelInteractiveTransition() {
		// console.log('cancelInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner && this.started) {
			const state = SharedTransition.getState(owner.id);
			if (!state) {
				return;
			}
			if (this.backgroundAnimation) {
				this.backgroundAnimation.reversed = true;
				const duration = isNumber(state.toPageStart?.duration) ? state.toPageStart?.duration / 1000 : DEFAULT_DURATION;
				this.backgroundAnimation.continueAnimationWithTimingParametersDurationFactor(null, duration);
				setTimeout(() => {
					for (const p of owner.sharedElements.presented) {
						p.view.opacity = 1;
					}
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.removeFromSuperview();
					}
					owner.presented.view.alpha = 1;
					this.backgroundAnimation = null;
					this.started = false;
					this.transitionContext.completeTransition(false);
				}, duration * 1000);
			}
		}
	}

	finishInteractiveTransition() {
		// console.log('finishInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner && this.started) {
			if (this.backgroundAnimation) {
				this.backgroundAnimation.reversed = false;
				const state = SharedTransition.getState(owner.id);
				if (!state) {
					SharedTransition.finishState(owner.id);
					this.transitionContext.completeTransition(true);
					return;
				}

				const duration = isNumber(state.fromPageEnd?.duration) ? state.fromPageEnd?.duration / 1000 : DEFAULT_DURATION;
				this.backgroundAnimation.continueAnimationWithTimingParametersDurationFactor(null, duration);
				setTimeout(() => {
					for (const presenting of owner.sharedElements.presenting) {
						presenting.view.opacity = presenting.startOpacity;
					}
					SharedTransition.finishState(owner.id);
					this.transitionContext.completeTransition(true);
				}, duration * 1000);
			}
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
		return DEFAULT_DURATION;
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
			// console.log('state.activeType:', state.activeType)
			switch (state.activeType) {
				case SharedTransitionAnimationType.present: {
					// console.log('-- Transition present --');

					transitionContext.containerView.addSubview(owner.presented.view);
					owner.presented.view.layoutIfNeeded();

					const { sharedElements, presented } = SharedTransition.getSharedElements(state.page, state.toPage);

					if (SharedTransition.DEBUG) {
						console.log('  ModalTransition: Present');
						console.log(
							`1. Found sharedTransitionTags to animate:`,
							sharedElements.map((v) => v.sharedTransitionTag)
						);

						console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);
					}

					for (const presentingView of sharedElements) {
						if (!owner.sharedElements) {
							owner.sharedElements = {
								presented: [],
								presenting: [],
							};
						}
						const presentingSharedElement = presentingView.ios;
						// console.log('fromTarget instanceof UIImageView:', fromTarget instanceof UIImageView)

						// TODO: discuss whether we should check if UIImage/UIImageView type to always snapshot images or if other view types could be duped/added vs. snapshotted
						// Note: snapshot may be most efficient/simple
						// console.log('---> ', presentingView.sharedTransitionTag, ': ', presentingSharedElement)

						const presentedView = presented.find((v) => v.sharedTransitionTag === presentingView.sharedTransitionTag);
						const presentedSharedElement = presentedView.ios;

						const sharedElementSnapshot = UIImageView.alloc().init(); // WithImage(snapshotView(presentedSharedElement));

						// treat images differently...
						if (presentedSharedElement instanceof UIImageView) {
							// in case the image is loaded async, we need to update the snapshot when it changes
							// todo: remove listener on transition end
							presentedView.on('imageSourceChange', () => {
								sharedElementSnapshot.image = iOSNativeHelper.snapshotView(presentedSharedElement, Screen.mainScreen.scale);
								sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							});

							sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							sharedElementSnapshot.contentMode = presentedSharedElement.contentMode;
						}

						iOSNativeHelper.copyLayerProperties(sharedElementSnapshot, presentingSharedElement);
						sharedElementSnapshot.clipsToBounds = true;
						// console.log('---> snapshot: ', sharedElementSnapshot);

						const startFrame = presentingSharedElement.convertRectToView(presentingSharedElement.bounds, transitionContext.containerView);
						const endFrame = presentedSharedElement.convertRectToView(presentedSharedElement.bounds, transitionContext.containerView);
						sharedElementSnapshot.frame = startFrame;
						if (SharedTransition.DEBUG) {
							console.log('---> ', presentingView.sharedTransitionTag, ' frame:', iOSNativeHelper.printCGRect(sharedElementSnapshot.frame));
						}

						owner.sharedElements.presenting.push({
							view: presentingView,
							startFrame,
							endFrame,
							snapshot: sharedElementSnapshot,
							startOpacity: presentingView.opacity,
							endOpacity: presentedView.opacity,
						});
						owner.sharedElements.presented.push({
							view: presentedView,
							startFrame: endFrame,
							endFrame: startFrame,
							startOpacity: presentedView.opacity,
							endOpacity: presentingView.opacity,
						});

						// set initial opacity to match the source view opacity
						sharedElementSnapshot.alpha = presentingView.opacity;
						// hide both while animating within the transition context
						presentingView.opacity = 0;
						presentedView.opacity = 0;
						// add snapshot to animate
						transitionContext.containerView.addSubview(sharedElementSnapshot);
					}

					const cleanupPresent = () => {
						for (const presented of owner.sharedElements.presented) {
							presented.view.opacity = presented.startOpacity;
						}
						for (const presenting of owner.sharedElements.presenting) {
							presenting.snapshot.removeFromSuperview();
						}
						SharedTransition.updateState(owner.id, {
							activeType: SharedTransitionAnimationType.dismiss,
						});
						transitionContext.completeTransition(true);
					};
					const updateFramePresent = () => {
						// https://stackoverflow.com/a/27997678/1418981
						// In order to have proper layout. Seems mostly needed when presenting.
						// For instance during presentation, destination view doesn't account navigation bar height.
						// Not sure if best to leave all the time?
						// owner.presented.view.setNeedsLayout();
						// owner.presented.view.layoutIfNeeded();
						if (SharedTransition.DEBUG) {
							console.log('3. Animating shared elements:');
						}
						for (const presented of owner.sharedElements.presented) {
							const presentingMatch = owner.sharedElements.presenting.find((v) => v.view.sharedTransitionTag === presented.view.sharedTransitionTag);
							// Workaround wrong origin due ongoing layout process.
							const updatedEndFrame = presented.view.ios.convertRectToView(presented.view.ios.bounds, transitionContext.containerView);
							const correctedEndFrame = CGRectMake(updatedEndFrame.origin.x, updatedEndFrame.origin.y, presentingMatch.endFrame.size.width, presentingMatch.endFrame.size.height);
							presentingMatch.snapshot.frame = correctedEndFrame;

							// apply view and layer properties to the snapshot view to match the source/presented view
							iOSNativeHelper.copyLayerProperties(presentingMatch.snapshot, presented.view.ios);
							// create a snapshot of the presented view
							presentingMatch.snapshot.image = iOSNativeHelper.snapshotView(presented.view.ios, Screen.mainScreen.scale);
							// apply correct alpha
							presentingMatch.snapshot.alpha = presentingMatch.endOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presentingMatch.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(correctedEndFrame));
							}
						}
					};

					// starting page properties
					const toProps = state.toPageStart;
					owner.presented.view.alpha = isNumber(toProps?.opacity) ? toProps?.opacity : 0;

					const startX = isNumber(toProps?.x) ? toProps?.x : 0;
					const startY = isNumber(toProps?.y) ? toProps?.y : Screen.mainScreen.heightDIPs;
					const startWidth = isNumber(toProps?.width) ? toProps?.width : Screen.mainScreen.widthDIPs;
					const startHeight = isNumber(toProps?.height) ? toProps?.height : Screen.mainScreen.heightDIPs;
					owner.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

					const animateProperties = () => {
						const props = state.toPageEnd;
						// animate page properties to the following:
						owner.presented.view.alpha = isNumber(props?.opacity) ? props?.opacity : 1;

						const endX = isNumber(props?.x) ? props?.x : 0;
						const endY = isNumber(props?.y) ? props?.y : 0;
						const endWidth = isNumber(props?.width) ? props?.width : Screen.mainScreen.widthDIPs;
						const endHeight = isNumber(props?.height) ? props?.height : Screen.mainScreen.heightDIPs;
						owner.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);
					};

					if (isNumber(toProps?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationAnimationsCompletion(
							toProps?.duration / 1000,
							() => {
								animateProperties();
								updateFramePresent();
							},
							() => {
								cleanupPresent();
							}
						);
					} else {
						const spring = toProps?.spring;
						iOSNativeHelper.animateWithSpring({
							tension: isNumber(spring?.tension) ? spring?.tension : DEFAULT_SPRING.tension,
							friction: isNumber(spring?.friction) ? spring?.tension : DEFAULT_SPRING.friction,
							animations: () => {
								animateProperties();

								updateFramePresent();
							},
							completion: () => {
								cleanupPresent();
							},
						});
					}

					break;
				}
				case SharedTransitionAnimationType.dismiss: {
					// console.log('-- Transition dismiss --');

					// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

					if (SharedTransition.DEBUG) {
						console.log('  ModalTransition: Dismiss');
						console.log(
							`1. Dismiss sharedTransitionTags to animate:`,
							owner.sharedElements.presented.map((p) => p.view.sharedTransitionTag)
						);

						console.log(`2. Add back previously stored sharedElements to dismiss:`);
					}

					for (const p of owner.sharedElements.presented) {
						p.view.opacity = 0;
					}
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.alpha = p.endOpacity;
						transitionContext.containerView.addSubview(p.snapshot);
					}

					const cleanupDismiss = () => {
						for (const presenting of owner.sharedElements.presenting) {
							presenting.view.opacity = presenting.startOpacity;
						}
						SharedTransition.finishState(owner.id);
						transitionContext.completeTransition(true);
					};
					const updateFrameDismiss = () => {
						if (SharedTransition.DEBUG) {
							console.log('3. Dismissing shared elements:');
						}
						for (const presenting of owner.sharedElements.presenting) {
							iOSNativeHelper.copyLayerProperties(presenting.snapshot, presenting.view.ios);
							presenting.snapshot.frame = presenting.startFrame;
							presenting.snapshot.alpha = presenting.startOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presenting.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(presenting.startFrame));
							}
						}
					};

					const props = state.fromPageEnd;

					const animateProperties = () => {
						owner.presented.view.alpha = isNumber(props?.opacity) ? props?.opacity : 0;

						const endX = isNumber(props?.x) ? props?.x : 0;
						const endY = isNumber(props?.y) ? props?.y : Screen.mainScreen.heightDIPs;
						const endWidth = isNumber(props?.width) ? props?.width : Screen.mainScreen.widthDIPs;
						const endHeight = isNumber(props?.height) ? props?.height : Screen.mainScreen.heightDIPs;
						owner.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);
					};

					if (isNumber(props?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationAnimationsCompletion(
							props?.duration / 1000,
							() => {
								animateProperties();
								updateFrameDismiss();
							},
							() => {
								cleanupDismiss();
							}
						);
					} else {
						const spring = props?.spring;
						iOSNativeHelper.animateWithSpring({
							tension: isNumber(spring?.tension) ? spring?.tension : DEFAULT_SPRING.tension,
							friction: isNumber(spring?.friction) ? spring?.tension : DEFAULT_SPRING.friction,
							animations: () => {
								animateProperties();

								updateFrameDismiss();
							},
							completion: () => {
								cleanupDismiss();
							},
						});
					}

					break;
				}
			}
		}
	}
}
