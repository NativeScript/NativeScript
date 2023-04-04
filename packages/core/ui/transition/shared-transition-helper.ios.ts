import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { getPageStartDefaultsForType, getRectFromProps, getSpringFromProps, SharedTransition, SharedTransitionAnimationType, SharedTransitionEventData, SharedTransitionState } from './shared-transition';
import { isNumber } from '../../utils/types';
import { Screen } from '../../platform';
import { iOSNativeHelper } from '../../utils/native-helper';

interface PlatformTransitionInteractiveState extends TransitionInteractiveState {
	transitionContext?: UIViewControllerContextTransitioning;
	propertyAnimator?: UIViewPropertyAnimator;
}

export class SharedTransitionHelper {
	static animate(state: SharedTransitionState, transitionContext: UIViewControllerContextTransitioning, type: TransitionNavigationType) {
		const transition = state.instance;
		setTimeout(async () => {
			// Run on next tick
			// ensures that existing UI state finishes before snapshotting
			// (eg, button touch up state)
			switch (state.activeType) {
				case SharedTransitionAnimationType.present: {
					// console.log('-- Transition present --');
					SharedTransition.events().notify<SharedTransitionEventData>({
						eventName: SharedTransition.startedEvent,
						data: {
							id: transition.id,
							type,
							action: 'present',
						},
					});

					if (type === 'modal') {
						transitionContext.containerView.addSubview(transition.presented.view);
					} else if (type === 'page') {
						transitionContext.containerView.insertSubviewAboveSubview(transition.presented.view, transition.presenting.view);
					}
					transition.presented.view.layoutIfNeeded();

					const { sharedElements, presented, presenting } = SharedTransition.getSharedElements(state.page, state.toPage);
					const sharedElementTags = sharedElements.map((v) => v.sharedTransitionTag);
					if (!transition.sharedElements) {
						transition.sharedElements = {
							presented: [],
							presenting: [],
							independent: [],
						};
					}

					if (SharedTransition.DEBUG) {
						console.log(`  ${type}: Present`);
						console.log(`1. Found sharedTransitionTags to animate:`, sharedElementTags);

						console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);
					}

					const pageStart = state.pageStart;

					const startFrame = getRectFromProps(pageStart, getPageStartDefaultsForType(type));

					const pageEnd = state.pageEnd;
					const pageEndTags = pageEnd?.sharedTransitionTags || {};
					// console.log('pageEndIndependentTags:', pageEndIndependentTags);

					const positionSharedTags = async () => {
						for (const presentingView of sharedElements) {
							const presentingSharedElement = presentingView.ios;
							// console.log('fromTarget instanceof UIImageView:', fromTarget instanceof UIImageView)

							// TODO: discuss whether we should check if UIImage/UIImageView type to always snapshot images or if other view types could be duped/added vs. snapshotted
							// Note: snapshot may be most efficient/simple
							// console.log('---> ', presentingView.sharedTransitionTag, ': ', presentingSharedElement)

							const presentedView = presented.find((v) => v.sharedTransitionTag === presentingView.sharedTransitionTag);
							const presentedSharedElement = presentedView.ios;
							const pageEndProps = pageEndTags[presentingView.sharedTransitionTag];

							const snapshot = UIImageView.alloc().init();
							if (pageEndProps?.callback) {
								await pageEndProps?.callback(presentedView, 'present');
							}

							// treat images differently...
							if (presentedSharedElement instanceof UIImageView) {
								// in case the image is loaded async, we need to update the snapshot when it changes
								// todo: remove listener on transition end
								presentedView.on('imageSourceChange', () => {
									snapshot.image = iOSNativeHelper.snapshotView(presentedSharedElement, Screen.mainScreen.scale);
									snapshot.tintColor = presentedSharedElement.tintColor;
								});

								snapshot.tintColor = presentedSharedElement.tintColor;
								snapshot.contentMode = presentedSharedElement.contentMode;
							}

							iOSNativeHelper.copyLayerProperties(snapshot, presentingSharedElement, pageEndProps?.propertiesToMatch);
							snapshot.clipsToBounds = true;
							// console.log('---> snapshot: ', snapshot);

							const startFrame = presentingSharedElement.convertRectToView(presentingSharedElement.bounds, transitionContext.containerView);
							const endFrame = presentedSharedElement.convertRectToView(presentedSharedElement.bounds, transitionContext.containerView);
							snapshot.frame = startFrame;
							if (SharedTransition.DEBUG) {
								console.log('---> ', presentingView.sharedTransitionTag, ' frame:', iOSNativeHelper.printCGRect(snapshot.frame));
							}

							transition.sharedElements.presenting.push({
								view: presentingView,
								startFrame,
								endFrame,
								snapshot,
								startOpacity: presentingView.opacity,
								endOpacity: isNumber(pageEndProps?.opacity) ? pageEndProps.opacity : presentedView.opacity,
								propertiesToMatch: pageEndProps?.propertiesToMatch,
								zIndex: isNumber(pageEndProps?.zIndex) ? pageEndProps.zIndex : 0,
							});
							transition.sharedElements.presented.push({
								view: presentedView,
								startFrame: endFrame,
								endFrame: startFrame,
								startOpacity: presentedView.opacity,
								endOpacity: presentingView.opacity,
								propertiesToMatch: pageEndProps?.propertiesToMatch,
							});

							// set initial opacity to match the source view opacity
							snapshot.alpha = presentingView.opacity;
							// hide both while animating within the transition context
							presentingView.opacity = 0;
							presentedView.opacity = 0;
						}
					};

					const positionIndependentTags = async () => {
						// independent tags
						for (const tag in pageEndTags) {
							// only handle if independent (otherwise it's shared between both pages and handled above)
							if (!sharedElementTags.includes(tag)) {
								// only consider start when there's a matching end
								const pageStartIndependentProps = pageStart?.sharedTransitionTags ? pageStart?.sharedTransitionTags[tag] : null;
								// console.log('start:', tag, pageStartIndependentProps);
								const pageEndProps = pageEndTags[tag];
								let independentView = presenting.find((v) => v.sharedTransitionTag === tag);
								let isPresented = false;
								if (!independentView) {
									independentView = presented.find((v) => v.sharedTransitionTag === tag);
									if (!independentView) {
										break;
									}
									isPresented = true;
								}
								const independentSharedElement: UIView = independentView.ios;

								if (pageEndProps?.callback) {
									await pageEndProps?.callback(independentView, 'present');
								}

								let snapshot: UIImageView;
								// if (isPresented) {
								// 	snapshot = UIImageView.alloc().init();
								// } else {
								snapshot = UIImageView.alloc().initWithImage(iOSNativeHelper.snapshotView(independentSharedElement, Screen.mainScreen.scale));
								// }

								if (independentSharedElement instanceof UIImageView) {
									// in case the image is loaded async, we need to update the snapshot when it changes
									// todo: remove listener on transition end
									// if (isPresented) {
									// 	independentView.on('imageSourceChange', () => {
									// 		snapshot.image = iOSNativeHelper.snapshotView(independentSharedElement, Screen.mainScreen.scale);
									// 		snapshot.tintColor = independentSharedElement.tintColor;
									// 	});
									// }

									snapshot.tintColor = independentSharedElement.tintColor;
									snapshot.contentMode = independentSharedElement.contentMode;
								}
								snapshot.clipsToBounds = true;

								const startFrame = independentSharedElement.convertRectToView(independentSharedElement.bounds, transitionContext.containerView);
								const startFrameRect = getRectFromProps(pageStartIndependentProps);
								// adjust for any specified start positions
								const startFrameAdjusted = CGRectMake(startFrame.origin.x + startFrameRect.x, startFrame.origin.y + startFrameRect.y, startFrame.size.width, startFrame.size.height);
								// console.log('startFrameAdjusted:', tag, iOSNativeHelper.printCGRect(startFrameAdjusted));
								// if (pageStartIndependentProps?.scale) {
								// 	snapshot.transform = CGAffineTransformConcat(CGAffineTransformMakeTranslation(startFrameAdjusted.origin.x, startFrameAdjusted.origin.y), CGAffineTransformMakeScale(pageStartIndependentProps.scale.x, pageStartIndependentProps.scale.y))
								// } else {
								snapshot.frame = startFrame; //startFrameAdjusted;
								// }
								if (SharedTransition.DEBUG) {
									console.log('---> ', independentView.sharedTransitionTag, ' frame:', iOSNativeHelper.printCGRect(snapshot.frame));
								}

								const endFrameRect = getRectFromProps(pageEndProps);

								const endFrame = CGRectMake(startFrame.origin.x + endFrameRect.x, startFrame.origin.y + endFrameRect.y, startFrame.size.width, startFrame.size.height);
								// console.log('endFrame:', tag, iOSNativeHelper.printCGRect(endFrame));
								transition.sharedElements.independent.push({
									view: independentView,
									isPresented,
									startFrame,
									snapshot,
									endFrame,
									startTransform: independentSharedElement.transform,
									scale: pageEndProps.scale,
									startOpacity: independentView.opacity,
									endOpacity: isNumber(pageEndProps.opacity) ? pageEndProps.opacity : 0,
									propertiesToMatch: pageEndProps?.propertiesToMatch,
									zIndex: isNumber(pageEndProps?.zIndex) ? pageEndProps.zIndex : 0,
								});

								independentView.opacity = 0;
							}
						}
					};

					// position all sharedTransitionTag elements
					await positionSharedTags();
					await positionIndependentTags();
					// combine to order by zIndex and add to transition context
					const snapshotData = transition.sharedElements.presenting.concat(transition.sharedElements.independent);
					snapshotData.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
					if (SharedTransition.DEBUG) {
						console.log(
							`zIndex settings:`,
							snapshotData.map((s) => {
								return {
									sharedTransitionTag: s.view.sharedTransitionTag,
									zIndex: s.zIndex,
								};
							})
						);
					}
					for (const data of snapshotData) {
						// add snapshot to animate
						transitionContext.containerView.addSubview(data.snapshot);
					}

					// Important: always set after above shared element positions have had their start positions set
					transition.presented.view.alpha = isNumber(pageStart?.opacity) ? pageStart?.opacity : 0;
					transition.presented.view.frame = CGRectMake(startFrame.x, startFrame.y, startFrame.width, startFrame.height);

					const cleanupPresent = () => {
						for (const presented of transition.sharedElements.presented) {
							presented.view.opacity = presented.startOpacity;
						}
						for (const presenting of transition.sharedElements.presenting) {
							presenting.snapshot.removeFromSuperview();
						}
						for (const independent of transition.sharedElements.independent) {
							independent.snapshot.removeFromSuperview();
							if (independent.isPresented) {
								independent.view.opacity = independent.startOpacity;
							}
						}
						SharedTransition.updateState(transition.id, {
							activeType: SharedTransitionAnimationType.dismiss,
						});
						if (type === 'page') {
							transition.presenting.view.removeFromSuperview();
						}
						transitionContext.completeTransition(true);
						SharedTransition.events().notify<SharedTransitionEventData>({
							eventName: SharedTransition.finishedEvent,
							data: {
								id: transition?.id,
								type,
								action: 'present',
							},
						});
					};

					const animateProperties = () => {
						if (SharedTransition.DEBUG) {
							console.log('3. Animating shared elements:');
						}
						transition.presented.view.alpha = isNumber(pageEnd?.opacity) ? pageEnd?.opacity : 1;

						const endFrame = getRectFromProps(pageEnd);
						transition.presented.view.frame = CGRectMake(endFrame.x, endFrame.y, endFrame.width, endFrame.height);

						// animate page properties to the following:
						// https://stackoverflow.com/a/27997678/1418981
						// In order to have proper layout. Seems mostly needed when presenting.
						// For instance during presentation, destination view doesn't account navigation bar height.
						// Not sure if best to leave all the time?
						// owner.presented.view.setNeedsLayout();
						// owner.presented.view.layoutIfNeeded();

						for (const presented of transition.sharedElements.presented) {
							const presentingMatch = transition.sharedElements.presenting.find((v) => v.view.sharedTransitionTag === presented.view.sharedTransitionTag);
							// Workaround wrong origin due ongoing layout process.
							const updatedEndFrame = presented.view.ios.convertRectToView(presented.view.ios.bounds, transitionContext.containerView);
							const correctedEndFrame = CGRectMake(updatedEndFrame.origin.x, updatedEndFrame.origin.y, presentingMatch.endFrame.size.width, presentingMatch.endFrame.size.height);
							presentingMatch.snapshot.frame = correctedEndFrame;

							// apply view and layer properties to the snapshot view to match the source/presented view
							iOSNativeHelper.copyLayerProperties(presentingMatch.snapshot, presented.view.ios, presented.propertiesToMatch);
							// create a snapshot of the presented view
							presentingMatch.snapshot.image = iOSNativeHelper.snapshotView(presented.view.ios, Screen.mainScreen.scale);
							// apply correct alpha
							presentingMatch.snapshot.alpha = presentingMatch.endOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presentingMatch.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(correctedEndFrame));
							}
						}
						for (const independent of transition.sharedElements.independent) {
							let endFrame: CGRect = independent.endFrame;
							// if (independent.isPresented) {
							// 	const updatedEndFrame = independent.view.ios.convertRectToView(independent.view.ios.bounds, transitionContext.containerView);
							// 	endFrame = CGRectMake(updatedEndFrame.origin.x, updatedEndFrame.origin.y, independent.endFrame.size.width, independent.endFrame.size.height);
							// }
							if (independent.scale) {
								independent.snapshot.transform = CGAffineTransformConcat(CGAffineTransformMakeTranslation(endFrame.origin.x, endFrame.origin.y), CGAffineTransformMakeScale(independent.scale.x, independent.scale.y));
							} else {
								independent.snapshot.frame = endFrame;
							}
							independent.snapshot.alpha = independent.endOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${independent.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(independent.endFrame));
							}
						}
					};

					if (isNumber(pageEnd?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationAnimationsCompletion(
							pageEnd?.duration / 1000,
							() => {
								animateProperties();
							},
							() => {
								cleanupPresent();
							}
						);
					} else {
						iOSNativeHelper.animateWithSpring({
							...getSpringFromProps(pageEnd?.spring),
							animations: () => {
								animateProperties();
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
					SharedTransition.events().notify<SharedTransitionEventData>({
						eventName: SharedTransition.startedEvent,
						data: {
							id: transition?.id,
							type,
							action: 'dismiss',
						},
					});
					if (type === 'page') {
						transitionContext.containerView.insertSubviewBelowSubview(transition.presenting.view, transition.presented.view);
					}

					// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

					if (SharedTransition.DEBUG) {
						console.log(`  ${type}: Dismiss`);
						console.log(
							`1. Dismiss sharedTransitionTags to animate:`,
							transition.sharedElements.presented.map((p) => p.view.sharedTransitionTag)
						);

						console.log(`2. Add back previously stored sharedElements to dismiss:`);
					}

					const pageEnd = state.pageEnd;
					const pageEndTags = pageEnd?.sharedTransitionTags || {};

					for (const p of transition.sharedElements.presented) {
						p.view.opacity = 0;
					}

					// combine to order by zIndex and add to transition context
					const snapshotData = transition.sharedElements.presenting.concat(transition.sharedElements.independent);
					snapshotData.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
					if (SharedTransition.DEBUG) {
						console.log(
							`zIndex settings:`,
							snapshotData.map((s) => {
								return {
									sharedTransitionTag: s.view.sharedTransitionTag,
									zIndex: s.zIndex,
								};
							})
						);
					}

					for (const data of snapshotData) {
						const pageEndProps = pageEndTags[data.view.sharedTransitionTag];
						if (pageEndProps?.callback) {
							await pageEndProps?.callback(data.view, 'dismiss');
						}

						const view = data.view.ios;
						// we need to reset the alpha to the start value so the view is visible in the snapshot
						view.alpha = data.startOpacity;

						// take a new snapshot
						data.snapshot.image = iOSNativeHelper.snapshotView(view, Screen.mainScreen.scale);

						const fromView = transition.sharedElements.presented.find((p) => p.view.sharedTransitionTag === data.view.sharedTransitionTag)?.view;
						if (fromView) {
							// match the snapshot frame to the current frame of the fromView
							data.snapshot.frame = fromView.ios.convertRectToView(fromView.ios.bounds, transitionContext.containerView);
						}

						// snapshot has been taken, we can restore the alpha
						view.alpha = data.endOpacity;

						// we recalculate the startFrame because the view might have changed its position in the background
						data.startFrame = view.convertRectToView(view.bounds, transitionContext.containerView);

						// add snapshot to animate
						transitionContext.containerView.addSubview(data.snapshot);
					}

					const pageReturn = state.pageReturn;

					const cleanupDismiss = () => {
						for (const presenting of transition.sharedElements.presenting) {
							presenting.view.opacity = presenting.startOpacity;
							presenting.snapshot.removeFromSuperview();
						}
						for (const independent of transition.sharedElements.independent) {
							independent.view.opacity = independent.startOpacity;
							independent.snapshot.removeFromSuperview();
						}
						SharedTransition.finishState(transition.id);
						transition.sharedElements = null;
						transitionContext.completeTransition(true);
						SharedTransition.events().notify<SharedTransitionEventData>({
							eventName: SharedTransition.finishedEvent,
							data: {
								id: transition?.id,
								type,
								action: 'dismiss',
							},
						});
					};

					const animateProperties = () => {
						if (SharedTransition.DEBUG) {
							console.log('3. Dismissing shared elements:');
						}

						transition.presented.view.alpha = isNumber(pageReturn?.opacity) ? pageReturn?.opacity : 0;

						const endFrame = getRectFromProps(pageReturn, getPageStartDefaultsForType(type));
						transition.presented.view.frame = CGRectMake(endFrame.x, endFrame.y, endFrame.width, endFrame.height);

						for (const presenting of transition.sharedElements.presenting) {
							iOSNativeHelper.copyLayerProperties(presenting.snapshot, presenting.view.ios, presenting.propertiesToMatch);
							presenting.snapshot.frame = presenting.startFrame;
							presenting.snapshot.alpha = presenting.startOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presenting.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(presenting.snapshot.frame));
							}
						}

						for (const independent of transition.sharedElements.independent) {
							independent.snapshot.alpha = independent.startOpacity;
							if (independent.scale) {
								independent.snapshot.transform = independent.startTransform;
							} else {
								independent.snapshot.frame = independent.startFrame;
							}

							if (SharedTransition.DEBUG) {
								console.log(`---> ${independent.view.sharedTransitionTag} animate to: `, iOSNativeHelper.printCGRect(independent.snapshot.frame));
							}
						}
					};

					if (isNumber(pageReturn?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationAnimationsCompletion(
							pageReturn?.duration / 1000,
							() => {
								animateProperties();
							},
							() => {
								cleanupDismiss();
							}
						);
					} else {
						iOSNativeHelper.animateWithSpring({
							...getSpringFromProps(pageReturn?.spring),
							animations: () => {
								animateProperties();
							},
							completion: () => {
								cleanupDismiss();
							},
						});
					}

					break;
				}
			}
		});
	}

	static interactiveStart(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType) {
		SharedTransition.events().notify<SharedTransitionEventData>({
			eventName: SharedTransition.startedEvent,
			data: {
				id: state?.instance?.id,
				type,
				action: 'interactiveStart',
			},
		});
		switch (type) {
			case 'page':
				interactiveState.transitionContext.containerView.insertSubviewBelowSubview(state.instance.presenting.view, state.instance.presented.view);
				break;
		}
	}

	static interactiveUpdate(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType, percent: number) {
		if (!interactiveState?.added) {
			interactiveState.added = true;
			for (const p of state.instance.sharedElements.presented) {
				p.view.opacity = 0;
			}
			for (const p of state.instance.sharedElements.presenting) {
				p.snapshot.alpha = p.endOpacity;
				interactiveState.transitionContext.containerView.addSubview(p.snapshot);
			}

			const pageStart = state.pageStart;

			const startFrame = getRectFromProps(pageStart, getPageStartDefaultsForType(type));
			interactiveState.propertyAnimator = UIViewPropertyAnimator.alloc().initWithDurationDampingRatioAnimations(1, 1, () => {
				for (const p of state.instance.sharedElements.presenting) {
					p.snapshot.frame = p.startFrame;
					iOSNativeHelper.copyLayerProperties(p.snapshot, p.view.ios, p.propertiesToMatch);

					p.snapshot.alpha = 1;
				}
				state.instance.presented.view.alpha = isNumber(state.pageReturn?.opacity) ? state.pageReturn?.opacity : 0;
				state.instance.presented.view.frame = CGRectMake(startFrame.x, startFrame.y, state.instance.presented.view.bounds.size.width, state.instance.presented.view.bounds.size.height);
			});
		}
		interactiveState.propertyAnimator.fractionComplete = percent;
		SharedTransition.events().notify<SharedTransitionEventData>({
			eventName: SharedTransition.interactiveUpdateEvent,
			data: {
				id: state?.instance?.id,
				type,
				percent,
			},
		});
	}

	static interactiveCancel(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType) {
		if (state?.instance && interactiveState?.added && interactiveState?.propertyAnimator) {
			interactiveState.propertyAnimator.reversed = true;
			const duration = isNumber(state.pageEnd?.duration) ? state.pageEnd?.duration / 1000 : 0.35;
			interactiveState.propertyAnimator.continueAnimationWithTimingParametersDurationFactor(null, duration);
			setTimeout(() => {
				for (const p of state.instance.sharedElements.presented) {
					p.view.opacity = 1;
				}
				for (const p of state.instance.sharedElements.presenting) {
					p.snapshot.removeFromSuperview();
				}
				state.instance.presented.view.alpha = 1;
				interactiveState.propertyAnimator = null;
				interactiveState.added = false;
				interactiveState.transitionContext.cancelInteractiveTransition();
				interactiveState.transitionContext.completeTransition(false);
				SharedTransition.events().notify<SharedTransitionEventData>({
					eventName: SharedTransition.interactiveCancelledEvent,
					data: {
						id: state?.instance?.id,
						type,
					},
				});
			}, duration * 1000);
		}
	}

	static interactiveFinish(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType) {
		if (state?.instance && interactiveState?.added && interactiveState?.propertyAnimator) {
			interactiveState.propertyAnimator.reversed = false;

			const duration = isNumber(state.pageReturn?.duration) ? state.pageReturn?.duration / 1000 : 0.35;
			interactiveState.propertyAnimator.continueAnimationWithTimingParametersDurationFactor(null, duration);
			setTimeout(() => {
				for (const presenting of state.instance.sharedElements.presenting) {
					presenting.view.opacity = presenting.startOpacity;
					presenting.snapshot.removeFromSuperview();
				}

				SharedTransition.finishState(state.instance.id);
				interactiveState.propertyAnimator = null;
				interactiveState.added = false;
				interactiveState.transitionContext.finishInteractiveTransition();
				interactiveState.transitionContext.completeTransition(true);
				SharedTransition.events().notify<SharedTransitionEventData>({
					eventName: SharedTransition.finishedEvent,
					data: {
						id: state?.instance?.id,
						type,
						action: 'interactiveFinish',
					},
				});
			}, duration * 1000);
		}
	}
}
