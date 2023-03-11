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

				transitionContext.containerView.addSubview(this.presented.view);
				this.presented.view.layoutIfNeeded();

				// 1. Presented view: gather all sharedTransitionTag views
				const presentedSharedElements = <Array<View>>querySelectorAll(state.toPage, 'sharedTransitionTag');
				// console.log('presented sharedTransitionTag total:', presentedSharedElements.length);

				// 2. Presenting view: gather all sharedTransitionTag views
				const presentingSharedElements = <Array<View>>querySelectorAll(state.page, 'sharedTransitionTag');
				// console.log('presenting sharedTransitionTag total:', presentingSharedElements.length);

				// 3. only handle sharedTransitionTag on presenting which match presented
				const presentedTags = presentedSharedElements.map((v) => v.sharedTransitionTag);
				const presentingViewsToHandle = presentingSharedElements.filter((v) => presentedTags.includes(v.sharedTransitionTag));

				console.log('  ');
				console.log(
					`1. Found sharedTransitionTags to animate:`,
					presentingViewsToHandle.map((v) => v.sharedTransitionTag)
				);

				console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);

				for (const presentingView of presentingViewsToHandle) {
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

					const presentedView = presentedSharedElements.find((v) => v.sharedTransitionTag === presentingView.sharedTransitionTag);
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
					transitionContext.containerView.addSubview(sharedElementSnapshot);
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
				this.presented.view.alpha = typeof state.incomingViewStart?.opacity === 'number' ? state.incomingViewStart?.opacity : 0;

				const startX = typeof state.incomingViewStart?.x === 'number' ? state.incomingViewStart?.x : Screen.mainScreen.widthDIPs;
				const startY = typeof state.incomingViewStart?.y === 'number' ? state.incomingViewStart?.y : 0;
				const startWidth = typeof state.incomingViewStart?.width === 'number' ? state.incomingViewStart?.width : Screen.mainScreen.widthDIPs;
				const startHeight = typeof state.incomingViewStart?.height === 'number' ? state.incomingViewStart?.height : Screen.mainScreen.heightDIPs;
				this.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					typeof state.incomingViewStart?.duration === 'number' ? state.incomingViewStart?.duration / 1000 : DEFAULT_DURATION,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut,
					() => {
						// animate page properties to the following:
						this.presented.view.alpha = typeof state.incomingViewEnd?.opacity === 'number' ? state.incomingViewEnd?.opacity : 1;

						const endX = typeof state.incomingViewEnd?.x === 'number' ? state.incomingViewEnd?.x : 0;
						const endY = typeof state.incomingViewEnd?.y === 'number' ? state.incomingViewEnd?.y : 0;
						const endWidth = typeof state.incomingViewEnd?.width === 'number' ? state.incomingViewEnd?.width : Screen.mainScreen.widthDIPs;
						const endHeight = typeof state.incomingViewEnd?.height === 'number' ? state.incomingViewEnd?.height : Screen.mainScreen.heightDIPs;
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
				}

				const cleanupDismiss = () => {
					for (const presenting of this.sharedElements.presenting) {
						presenting.view.opacity = presenting.startOpacity;
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
					typeof state.dismissViewEnd?.duration === 'number' ? state.dismissViewEnd?.duration / 1000 : DEFAULT_DURATION,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut,
					() => {
						this.presented.view.alpha = typeof state.dismissViewEnd?.opacity === 'number' ? state.dismissViewEnd?.opacity : 0;

						const endX = typeof state.dismissViewEnd?.x === 'number' ? state.dismissViewEnd?.x : Screen.mainScreen.widthDIPs;
						const endY = typeof state.dismissViewEnd?.y === 'number' ? state.dismissViewEnd?.y : 0;
						const endWidth = typeof state.dismissViewEnd?.width === 'number' ? state.dismissViewEnd?.width : Screen.mainScreen.widthDIPs;
						const endHeight = typeof state.dismissViewEnd?.height === 'number' ? state.dismissViewEnd?.height : Screen.mainScreen.heightDIPs;
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
