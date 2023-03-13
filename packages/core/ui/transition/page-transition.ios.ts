import { querySelectorAll } from '../core/view-base';
import type { View } from '../core/view';
import { Transition, iosMatchLayerProperties, iosSnapshotView, iosPrintRect } from '.';
import { Screen } from '../../platform';
import { SharedTransition, SharedTransitionAnimationType, DEFAULT_DURATION } from './shared-transition';

export class PageTransition extends Transition {
	presented: UIViewController;
	presenting: UIViewController;
	sharedElements: {
		presented?: Array<{ view: View; startFrame?: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
		presenting?: Array<{ view: View; startFrame: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
	};

	animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		console.log('--- PageTransitionController animateTransition');
		console.log('toViewCtrl:', toViewCtrl);
		console.log('fromViewCtrl:', fromViewCtrl);

		// console.log('owner.id:', owner.id);
		const state = SharedTransition.getState(this.id);
		if (!state) {
			return;
		}
		console.log('state.activeType:', state.activeType);
		console.log('operation:', operation);
		// switch (state.activeType) {
		switch (operation) {
			case UINavigationControllerOperation.Push: {
				this.presented = toViewCtrl;
				console.log('-- Transition present --', this.presented);

				// transitionContext.containerView.addSubview(this.presented.view);
				transitionContext.containerView.insertSubviewAboveSubview(this.presented.view, fromViewCtrl.view);
				this.presented.view.layoutIfNeeded();

				const { sharedElements, presented } = SharedTransition.getSharedElements(state.page, state.toPage);

				console.log('  ');
				console.log(
					`1. Found sharedTransitionTags to animate:`,
					sharedElements.map((v) => v.sharedTransitionTag)
				);

				console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);

				for (const presentingView of sharedElements) {
					if (!this.sharedElements) {
						this.sharedElements = {
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

					this.sharedElements.presenting.push({
						view: presentingView,
						startFrame,
						endFrame,
						snapshot: sharedElementSnapshot,
						startOpacity: presentingView.opacity,
						endOpacity: presentedView.opacity,
					});
					this.sharedElements.presented.push({
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
					// transitionContext.containerView.addSubview(sharedElementSnapshot);
					transitionContext.containerView.insertSubviewAboveSubview(sharedElementSnapshot, this.presented.view);
				}

				const cleanupPresent = () => {
					for (const presented of this.sharedElements.presented) {
						presented.view.opacity = presented.startOpacity;
					}

					// TODO: Discuss with Igor whether this is necessary
					// potential this could help smooth some shared element transitions
					UIView.animateWithDurationAnimationsCompletion(
						0, // Igor: disabled for now, we'll talk about this and decide
						() => {
							for (const presenting of this.sharedElements.presenting) {
								presenting.snapshot.alpha = presenting.endOpacity;
							}
						},
						() => {
							for (const presenting of this.sharedElements.presenting) {
								presenting.snapshot.removeFromSuperview();
							}
							SharedTransition.updateState({
								id: this.id,
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
					for (const presented of this.sharedElements.presented) {
						const presentingMatch = this.sharedElements.presenting.find((v) => v.view.sharedTransitionTag === presented.view.sharedTransitionTag);
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
				this.presented.view.alpha = typeof state.toPageStart?.opacity === 'number' ? state.toPageStart?.opacity : 0;

				const startX = typeof state.toPageStart?.x === 'number' ? state.toPageStart?.x : Screen.mainScreen.widthDIPs;
				const startY = typeof state.toPageStart?.y === 'number' ? state.toPageStart?.y : 0;
				const startWidth = typeof state.toPageStart?.width === 'number' ? state.toPageStart?.width : Screen.mainScreen.widthDIPs;
				const startHeight = typeof state.toPageStart?.height === 'number' ? state.toPageStart?.height : Screen.mainScreen.heightDIPs;
				this.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					typeof state.toPageStart?.duration === 'number' ? state.toPageStart?.duration / 1000 : DEFAULT_DURATION,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut,
					() => {
						// animate page properties to the following:
						this.presented.view.alpha = typeof state.toPageEnd?.opacity === 'number' ? state.toPageEnd?.opacity : 1;

						const endX = typeof state.toPageEnd?.x === 'number' ? state.toPageEnd?.x : 0;
						const endY = typeof state.toPageEnd?.y === 'number' ? state.toPageEnd?.y : 0;
						const endWidth = typeof state.toPageEnd?.width === 'number' ? state.toPageEnd?.width : Screen.mainScreen.widthDIPs;
						const endHeight = typeof state.toPageEnd?.height === 'number' ? state.toPageEnd?.height : Screen.mainScreen.heightDIPs;
						this.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);

						updateFramePresent();
					},
					() => {
						cleanupPresent();
					}
				);
				break;
			}
			case UINavigationControllerOperation.Pop: {
				// this.presented = fromViewCtrl;
				console.log('-- Transition dismiss --', this.presented);

				transitionContext.containerView.insertSubviewBelowSubview(toViewCtrl.view, fromViewCtrl.view);

				// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

				console.log('  ');
				console.log(
					`1. Dismiss sharedTransitionTags to animate:`,
					this.sharedElements.presented.map((p) => p.view.sharedTransitionTag)
				);

				console.log(`2. Add back previously stored sharedElements to dismiss:`);

				for (const p of this.sharedElements.presented) {
					p.view.opacity = 0;
				}
				for (const p of this.sharedElements.presenting) {
					p.snapshot.alpha = p.endOpacity;
					transitionContext.containerView.addSubview(p.snapshot);
					// transitionContext.containerView.insertSubviewBelowSubview(p.snapshot, fromViewCtrl.view);
				}

				const cleanupDismiss = () => {
					for (const presenting of this.sharedElements.presenting) {
						presenting.view.opacity = presenting.startOpacity;
						presenting.snapshot.removeFromSuperview();
					}
					SharedTransition.finishState(this.id);
					transitionContext.completeTransition(true);
				};
				const updateFrameDismiss = () => {
					console.log('3. Dismissing shared elements:');
					for (const presenting of this.sharedElements.presenting) {
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
						this.presented.view.alpha = typeof state.fromPageEnd?.opacity === 'number' ? state.fromPageEnd?.opacity : 0;

						const endX = typeof state.fromPageEnd?.x === 'number' ? state.fromPageEnd?.x : Screen.mainScreen.widthDIPs;
						const endY = typeof state.fromPageEnd?.y === 'number' ? state.fromPageEnd?.y : 0;
						const endWidth = typeof state.fromPageEnd?.width === 'number' ? state.fromPageEnd?.width : Screen.mainScreen.widthDIPs;
						const endHeight = typeof state.fromPageEnd?.height === 'number' ? state.fromPageEnd?.height : Screen.mainScreen.heightDIPs;
						this.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);

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
