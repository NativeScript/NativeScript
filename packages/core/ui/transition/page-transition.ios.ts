import type { View } from '../core/view';
import { Transition } from '.';
import { Screen } from '../../platform';
import { iOSNativeHelper } from '../../utils/native-helper';
import { isNumber } from '../../utils/types';
import { SharedTransition, SharedTransitionAnimationType, DEFAULT_DURATION, DEFAULT_SPRING } from './shared-transition';

export class PageTransition extends Transition {
	presented: UIViewController;
	presenting: UIViewController;
	sharedElements: {
		presented?: Array<{ view: View; startFrame?: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
		presenting?: Array<{ view: View; startFrame: CGRect; endFrame?: CGRect; snapshot?: UIImageView; startOpacity?: number; endOpacity?: number }>;
	};

	animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		// console.log('--- PageTransitionController animateTransition');
		// console.log('toViewCtrl:', toViewCtrl);
		// console.log('fromViewCtrl:', fromViewCtrl);

		// console.log('owner.id:', owner.id);
		const state = SharedTransition.getState(this.id);
		if (!state) {
			return;
		}
		// console.log('state.activeType:', state.activeType);
		// console.log('operation:', operation);
		// switch (state.activeType) {
		switch (operation) {
			case UINavigationControllerOperation.Push: {
				this.presented = toViewCtrl;
				// console.log('-- Transition present --', this.presented);

				// transitionContext.containerView.addSubview(this.presented.view);
				transitionContext.containerView.insertSubviewAboveSubview(this.presented.view, fromViewCtrl.view);
				this.presented.view.layoutIfNeeded();

				const { sharedElements, presented } = SharedTransition.getSharedElements(state.page, state.toPage);

				if (SharedTransition.DEBUG) {
					console.log('  PageTransition: Push');
					console.log(
						`1. Found sharedTransitionTags to animate:`,
						sharedElements.map((v) => v.sharedTransitionTag)
					);

					console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);
				}

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
					for (const presenting of this.sharedElements.presenting) {
						presenting.snapshot.removeFromSuperview();
					}
					SharedTransition.updateState(this.id, {
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
					for (const presented of this.sharedElements.presented) {
						const presentingMatch = this.sharedElements.presenting.find((v) => v.view.sharedTransitionTag === presented.view.sharedTransitionTag);
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
				this.presented.view.alpha = isNumber(toProps?.opacity) ? toProps?.opacity : 0;

				const startX = isNumber(toProps?.x) ? toProps?.x : Screen.mainScreen.widthDIPs;
				const startY = isNumber(toProps?.y) ? toProps?.y : 0;
				const startWidth = isNumber(toProps?.width) ? toProps?.width : Screen.mainScreen.widthDIPs;
				const startHeight = isNumber(toProps?.height) ? toProps?.height : Screen.mainScreen.heightDIPs;
				this.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

				const animateProperties = () => {
					const props = state.toPageEnd;
					// animate page properties to the following:
					this.presented.view.alpha = isNumber(props?.opacity) ? props?.opacity : 1;

					const endX = isNumber(props?.x) ? props?.x : 0;
					const endY = isNumber(props?.y) ? props?.y : 0;
					const endWidth = isNumber(props?.width) ? props?.width : Screen.mainScreen.widthDIPs;
					const endHeight = isNumber(props?.height) ? props?.height : Screen.mainScreen.heightDIPs;
					this.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);
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
			case UINavigationControllerOperation.Pop: {
				// this.presented = fromViewCtrl;
				// console.log('-- Transition dismiss --', this.presented);

				transitionContext.containerView.insertSubviewBelowSubview(toViewCtrl.view, fromViewCtrl.view);

				// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

				if (SharedTransition.DEBUG) {
					console.log('  PageTransition: Pop');
					console.log(
						`1. Dismiss sharedTransitionTags to animate:`,
						this.sharedElements.presented.map((p) => p.view.sharedTransitionTag)
					);

					console.log(`2. Add back previously stored sharedElements to dismiss:`);
				}

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
						presenting.snapshot.removeFromSuperview();
					}
					SharedTransition.finishState(this.id);
					transitionContext.completeTransition(true);
				};
				const updateFrameDismiss = () => {
					if (SharedTransition.DEBUG) {
						console.log('3. Dismissing shared elements:');
					}
					for (const presenting of this.sharedElements.presenting) {
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
					this.presented.view.alpha = isNumber(props?.opacity) ? props?.opacity : 0;

					const endX = isNumber(props?.x) ? props?.x : Screen.mainScreen.widthDIPs;
					const endY = isNumber(props?.y) ? props?.y : 0;
					const endWidth = isNumber(props?.width) ? props?.width : Screen.mainScreen.widthDIPs;
					const endHeight = isNumber(props?.height) ? props?.height : Screen.mainScreen.heightDIPs;
					this.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);
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
