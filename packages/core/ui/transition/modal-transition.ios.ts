import { querySelectorAll } from '../core/view-base';
import type { View } from '../core/view';
import { Screen } from '../../platform';
import { valueMap } from '../../utils/number-utils';
import { Transition, iosMatchLayerProperties, iosPrintRect, iosSnapshotView } from '.';
import { SharedTransition, SharedTransitionAnimationType, DEFAULT_DURATION } from './shared-transition';

export class ModalTransition extends Transition {
	transitionController: ModalTransitionController;
	interactiveController: UIPercentDrivenInteractiveTransition;
	presented: UIViewController;
	presenting: UIViewController;
	sharedElements: {
		presented?: Array<{ view: View; startFrame?: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
		presenting?: Array<{ view: View; startFrame: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
	};

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
		console.log('-- iosInteractionDismiss --');
		this.interactiveController = PercentInteractiveController.initWithOwner(new WeakRef(this));
		return this.interactiveController;
	}

	iosInteractionPresented(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		console.log('-- iosInteractionPresented --');
		return null;
	}

	iosPresentedViewController(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIPresentationController {
		console.log('-- iosPresentedViewController --');
		return null;
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
		console.log('startInteractiveTransition');
		this.transitionContext = transitionContext;
	}

	updateInteractiveTransition(percentComplete: number) {
		// console.log('percentComplete:', percentComplete);
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
				this.backgroundAnimation = UIViewPropertyAnimator.alloc().initWithDurationDampingRatioAnimations(1, 1, () => {
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.frame = p.startFrame;
						iosMatchLayerProperties(p.snapshot, p.view.ios);

						p.snapshot.alpha = 1;
					}
					owner.presented.view.alpha = 0;
					owner.presented.view.frame = CGRectMake(0, 200, owner.presented.view.bounds.size.width, owner.presented.view.bounds.size.height);
				});
			}

			this.backgroundAnimation.fractionComplete = percentComplete;
		}
	}

	cancelInteractiveTransition() {
		console.log('cancelInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner && this.started) {
			const state = SharedTransition.getState(owner.id);
			if (!state) {
				return;
			}
			if (this.backgroundAnimation) {
				this.backgroundAnimation.reversed = true;
				const duration = typeof state.toPageStart?.duration === 'number' ? state.toPageStart?.duration / 1000 : DEFAULT_DURATION;
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
		console.log('finishInteractiveTransition');
		const owner = this.owner?.deref();
		if (owner && this.started) {
			if (this.backgroundAnimation) {
				const state = SharedTransition.getState(owner.id);
				if (!state) {
					SharedTransition.finishState(owner.id);
					this.transitionContext.completeTransition(true);
					return;
				}

				const duration = typeof state.fromPageEnd?.duration === 'number' ? state.fromPageEnd?.duration / 1000 : DEFAULT_DURATION;
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
		// console.log('ModalTransitionController animateTransition:', animationType);
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
					console.log('-- Transition present --');

					transitionContext.containerView.addSubview(owner.presented.view);
					owner.presented.view.layoutIfNeeded();

					const { sharedElements, presented } = SharedTransition.getSharedElements(state.page, state.toPage);

					console.log('  ');
					console.log(
						`1. Found sharedTransitionTags to animate:`,
						sharedElements.map((v) => v.sharedTransitionTag)
					);

					console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);

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
								sharedElementSnapshot.image = iosSnapshotView(presentedSharedElement);
								sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							});

							sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							sharedElementSnapshot.contentMode = presentedSharedElement.contentMode;
						}

						iosMatchLayerProperties(sharedElementSnapshot, presentingSharedElement);
						sharedElementSnapshot.clipsToBounds = true;
						// console.log('---> snapshot: ', sharedElementSnapshot);

						const startFrame = presentingSharedElement.convertRectToView(presentingSharedElement.bounds, transitionContext.containerView);
						const endFrame = presentedSharedElement.convertRectToView(presentedSharedElement.bounds, transitionContext.containerView);
						sharedElementSnapshot.frame = startFrame;
						console.log('---> ', presentingView.sharedTransitionTag, ' frame:', iosPrintRect(sharedElementSnapshot.frame));

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

						// TODO: Discuss with Igor whether this is necessary
						// potential this could help smooth some shared element transitions
						UIView.animateWithDurationAnimationsCompletion(
							0, // Igor: disabled for now, we'll talk about this and decide
							() => {
								for (const presenting of owner.sharedElements.presenting) {
									presenting.snapshot.alpha = presenting.endOpacity;
								}
							},
							() => {
								for (const presenting of owner.sharedElements.presenting) {
									presenting.snapshot.removeFromSuperview();
								}
								SharedTransition.updateState(owner.id, {
									activeType: SharedTransitionAnimationType.dismiss,
								});
								transitionContext.completeTransition(true);
							}
						);
					};
					const updateFramePresent = () => {
						// https://stackoverflow.com/a/27997678/1418981
						// In order to have proper layout. Seems mostly needed when presenting.
						// For instance during presentation, destination view doesn't account navigation bar height.
						// Not sure if best to leave all the time?
						// owner.presented.view.setNeedsLayout();
						// owner.presented.view.layoutIfNeeded();
						console.log('3. Animating shared elements:');
						for (const presented of owner.sharedElements.presented) {
							const presentingMatch = owner.sharedElements.presenting.find((v) => v.view.sharedTransitionTag === presented.view.sharedTransitionTag);
							// Workaround wrong origin due ongoing layout process.
							const updatedEndFrame = presented.view.ios.convertRectToView(presented.view.ios.bounds, transitionContext.containerView);
							const correctedEndFrame = CGRectMake(updatedEndFrame.origin.x, updatedEndFrame.origin.y, presentingMatch.endFrame.size.width, presentingMatch.endFrame.size.height);
							presentingMatch.snapshot.frame = correctedEndFrame;

							// apply view and layer properties to the snapshot view to match the source/presented view
							iosMatchLayerProperties(presentingMatch.snapshot, presented.view.ios);
							// create a snapshot of the presented view
							presentingMatch.snapshot.image = iosSnapshotView(presented.view.ios);
							// apply correct alpha
							presentingMatch.snapshot.alpha = presentingMatch.endOpacity;

							console.log(`---> ${presentingMatch.view.sharedTransitionTag} animate to: `, iosPrintRect(correctedEndFrame));
						}
						console.log('  ');
					};

					// starting page properties
					owner.presented.view.alpha = typeof state.toPageStart?.opacity === 'number' ? state.toPageStart?.opacity : 0;

					const startX = typeof state.toPageStart?.x === 'number' ? state.toPageStart?.x : 0;
					const startY = typeof state.toPageStart?.y === 'number' ? state.toPageStart?.y : Screen.mainScreen.heightDIPs;
					const startWidth = typeof state.toPageStart?.width === 'number' ? state.toPageStart?.width : Screen.mainScreen.widthDIPs;
					const startHeight = typeof state.toPageStart?.height === 'number' ? state.toPageStart?.height : Screen.mainScreen.heightDIPs;
					owner.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

					UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
						typeof state.toPageStart?.duration === 'number' ? state.toPageStart?.duration / 1000 : DEFAULT_DURATION,
						0,
						0.5,
						3,
						UIViewAnimationOptions.CurveEaseInOut,
						() => {
							// animate page properties to the following:
							owner.presented.view.alpha = typeof state.toPageEnd?.opacity === 'number' ? state.toPageEnd?.opacity : 1;

							const endX = typeof state.toPageEnd?.x === 'number' ? state.toPageEnd?.x : 0;
							const endY = typeof state.toPageEnd?.y === 'number' ? state.toPageEnd?.y : 0;
							const endWidth = typeof state.toPageEnd?.width === 'number' ? state.toPageEnd?.width : Screen.mainScreen.widthDIPs;
							const endHeight = typeof state.toPageEnd?.height === 'number' ? state.toPageEnd?.height : Screen.mainScreen.heightDIPs;
							owner.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);

							updateFramePresent();
						},
						() => {
							cleanupPresent();
						}
					);
					break;
				}
				case SharedTransitionAnimationType.dismiss: {
					console.log('-- Transition dismiss --');

					// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

					console.log('  ');
					console.log(
						`1. Dismiss sharedTransitionTags to animate:`,
						owner.sharedElements.presented.map((p) => p.view.sharedTransitionTag)
					);

					console.log(`2. Add back previously stored sharedElements to dismiss:`);

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
						console.log('3. Dismissing shared elements:');
						for (const presenting of owner.sharedElements.presenting) {
							iosMatchLayerProperties(presenting.snapshot, presenting.view.ios);
							presenting.snapshot.frame = presenting.startFrame;
							presenting.snapshot.alpha = presenting.startOpacity;

							console.log(`---> ${presenting.view.sharedTransitionTag} animate to: `, iosPrintRect(presenting.startFrame));
						}
						console.log('  ');
					};

					UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
						typeof state.fromPageEnd?.duration === 'number' ? state.fromPageEnd?.duration / 1000 : DEFAULT_DURATION,
						0,
						0.5,
						3,
						UIViewAnimationOptions.CurveEaseInOut,
						() => {
							owner.presented.view.alpha = typeof state.fromPageEnd?.opacity === 'number' ? state.fromPageEnd?.opacity : 0;

							const endX = typeof state.fromPageEnd?.x === 'number' ? state.fromPageEnd?.x : 0;
							const endY = typeof state.fromPageEnd?.y === 'number' ? state.fromPageEnd?.y : Screen.mainScreen.heightDIPs;
							const endWidth = typeof state.fromPageEnd?.width === 'number' ? state.fromPageEnd?.width : Screen.mainScreen.widthDIPs;
							const endHeight = typeof state.fromPageEnd?.height === 'number' ? state.fromPageEnd?.height : Screen.mainScreen.heightDIPs;
							owner.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);

							updateFrameDismiss();
						},
						() => {
							cleanupDismiss();
						}
					);
					break;
				}
			}
		}
	}
}
