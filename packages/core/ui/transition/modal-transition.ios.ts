import { querySelectorAll } from '../core/view-base';
import type { View } from '../core/view';
import { Screen } from '../../platform';
import { Transition } from '.';
import type { TransitionType } from '.';
import { SharedTransition, SharedTransitionAnimationType } from './shared-transition';

const printRect = (r: CGRect) => `CGRect(${r.origin.x} ${r.origin.y} ${r.size.width} ${r.size.height})`;
const printPoint = (r: CGPoint) => `CGPoint(${r.x} ${r.y})`;
const printSize = (r: CGSize) => `CGPoint(${r.width} ${r.height})`;

const DEFAULT_DURATION = 0.35;

export class ModalTransition extends Transition implements TransitionType {
	transitionController: ModalTransitionController;
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
		return null;
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
		// console.log('FullScreenAnimationController animateTransition:', animationType);
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

						const presentedView = presentedSharedElements.find((v) => v.sharedTransitionTag === presentingView.sharedTransitionTag);
						const presentedSharedElement = presentedView.ios;

						const sharedElementSnapshot = UIImageView.alloc().init(); // WithImage(snapshotView(presentedSharedElement));

						// treat images differently...
						if (presentedSharedElement instanceof UIImageView) {
							// in case the image is loaded async, we need to update the snapshot when it changes
							// todo: remove listener on transition end
							presentedView.on('imageSourceChange', () => {
								sharedElementSnapshot.image = snapshotView(presentedSharedElement);
								sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							});

							sharedElementSnapshot.tintColor = presentedSharedElement.tintColor;
							sharedElementSnapshot.contentMode = presentedSharedElement.contentMode;
						}

						// todo: check if this is needed - seems like it's not after refactoring the updateFramePresent to do the snapshotting
						// matchLayerProperties(sharedElementSnapshot, presentingSharedElement);
						sharedElementSnapshot.clipsToBounds = true;
						// console.log('---> snapshot: ', sharedElementSnapshot);

						const startFrame = presentingSharedElement.convertRectToView(presentingSharedElement.bounds, transitionContext.containerView);
						const endFrame = presentedSharedElement.convertRectToView(presentedSharedElement.bounds, transitionContext.containerView);
						sharedElementSnapshot.frame = startFrame;
						console.log('---> ', presentingView.sharedTransitionTag, ' frame:', printRect(sharedElementSnapshot.frame));

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
								SharedTransition.updateState({
									id: owner.id,
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
							matchLayerProperties(presentingMatch.snapshot, presented.view.ios);
							// create a snapshot of the presented view
							presentingMatch.snapshot.image = snapshotView(presented.view.ios);
							// apply correct alpha
							presentingMatch.snapshot.alpha = presentingMatch.endOpacity;

							console.log(`---> ${presentingMatch.view.sharedTransitionTag} animate to: `, printRect(correctedEndFrame));
						}
						console.log('  ');
					};

					// starting page properties
					owner.presented.view.alpha = typeof state.incomingViewStart?.opacity === 'number' ? state.incomingViewStart?.opacity : 0;

					const startX = typeof state.incomingViewStart?.x === 'number' ? state.incomingViewStart?.x : 0;
					const startY = typeof state.incomingViewStart?.y === 'number' ? state.incomingViewStart?.y : Screen.mainScreen.heightDIPs;
					const startWidth = typeof state.incomingViewStart?.width === 'number' ? state.incomingViewStart?.width : Screen.mainScreen.widthDIPs;
					const startHeight = typeof state.incomingViewStart?.height === 'number' ? state.incomingViewStart?.height : Screen.mainScreen.heightDIPs;
					owner.presented.view.frame = CGRectMake(startX, startY, startWidth, startHeight);

					UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
						typeof state.incomingViewStart?.duration === 'number' ? state.incomingViewStart?.duration / 1000 : DEFAULT_DURATION,
						0,
						0.5,
						3,
						UIViewAnimationOptions.CurveEaseInOut,
						() => {
							// animate page properties to the following:
							owner.presented.view.alpha = typeof state.incomingViewEnd?.opacity === 'number' ? state.incomingViewEnd?.opacity : 1;

							const endX = typeof state.incomingViewEnd?.x === 'number' ? state.incomingViewEnd?.x : 0;
							const endY = typeof state.incomingViewEnd?.y === 'number' ? state.incomingViewEnd?.y : 0;
							const endWidth = typeof state.incomingViewEnd?.width === 'number' ? state.incomingViewEnd?.width : Screen.mainScreen.widthDIPs;
							const endHeight = typeof state.incomingViewEnd?.height === 'number' ? state.incomingViewEnd?.height : Screen.mainScreen.heightDIPs;
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
							matchLayerProperties(presenting.snapshot, presenting.view.ios);
							presenting.snapshot.frame = presenting.startFrame;
							presenting.snapshot.alpha = presenting.startOpacity;

							console.log(`---> ${presenting.view.sharedTransitionTag} animate to: `, printRect(presenting.startFrame));
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
							owner.presented.view.alpha = typeof state.dismissViewEnd?.opacity === 'number' ? state.dismissViewEnd?.opacity : 0;

							const endX = typeof state.dismissViewEnd?.x === 'number' ? state.dismissViewEnd?.x : 0;
							const endY = typeof state.dismissViewEnd?.y === 'number' ? state.dismissViewEnd?.y : Screen.mainScreen.heightDIPs;
							const endWidth = typeof state.dismissViewEnd?.width === 'number' ? state.dismissViewEnd?.width : Screen.mainScreen.widthDIPs;
							const endHeight = typeof state.dismissViewEnd?.height === 'number' ? state.dismissViewEnd?.height : Screen.mainScreen.heightDIPs;
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

function snapshotView(view: UIView): UIImage {
	if (view instanceof UIImageView) {
		return view.image;
	}
	// console.log('snapshotView view.frame:', printRect(view.frame));
	UIGraphicsBeginImageContextWithOptions(CGSizeMake(view.frame.size.width, view.frame.size.height), false, Screen.mainScreen.scale);
	view.layer.renderInContext(UIGraphicsGetCurrentContext());
	const image = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();
	return image;
}

// todo: figure out all the properties/layer properties that we want to transition automatically
// note: some need to be done at various stages of the animation and are not in here. (e.g. alpha)
function matchLayerProperties(view: UIView, toView: UIView) {
	const viewPropertiesToMatch: Array<keyof UIView> = ['backgroundColor'];
	const layerPropertiesToMatch: Array<keyof CALayer> = ['cornerRadius', 'borderWidth', 'borderColor'];

	viewPropertiesToMatch.forEach((property) => {
		if (view[property] !== toView[property]) {
			console.log('|    -- matching view property:', property);
			view[property as any] = toView[property];
		}
	});

	layerPropertiesToMatch.forEach((property) => {
		if (view.layer[property] !== toView.layer[property]) {
			console.log('|    -- matching layer property:', property);
			view.layer[property as any] = toView.layer[property];
		}
	});
}
