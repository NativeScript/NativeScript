import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { getPageStartDefaultsForType, getRectFromProps, getSpringFromProps, SharedTransition, SharedTransitionAnimationType, SharedTransitionState } from './shared-transition';
import { isNumber } from '../../utils/types';
import { Screen } from '../../platform';
import { CORE_ANIMATION_DEFAULTS } from '../../utils/animation-helpers';
import { ios as iOSUtils } from '../../utils/native-helper';

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
					SharedTransition.notifyEvent(SharedTransition.startedEvent, {
						id: transition.id,
						type,
						action: 'present',
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
					// Track every matched source view so cleanup can restore alpha,
					// including duplicates (same album surfacing in multiple lists)
					// that we hide but don't create a snapshot for.
					(transition.sharedElements as any)._allPresentingViews = sharedElements.slice();

					if (SharedTransition.DEBUG) {
						console.log(`  ${type}: Present`);
						console.log(`1. Found sharedTransitionTags to animate:`, sharedElementTags);

						console.log(`2. Take snapshots of shared elements and position them based on presenting view:`);
					}

					const pageOut = state.pageOut;
					const pageStart = state.pageStart;

					const startFrame = getRectFromProps(pageStart, getPageStartDefaultsForType(type));

					const pageEnd = state.pageEnd;
					const pageEndTags = pageEnd?.sharedTransitionTags || {};
					// console.log('pageEndIndependentTags:', pageEndIndependentTags);

					const positionSharedTags = async () => {
						const processedTags = new Set<string>();
						for (const presentingView of sharedElements) {
							const presentingSharedElement = presentingView.ios;
							const tag = presentingView.sharedTransitionTag;
							if (processedTags.has(tag)) {
								// The same item can appear in multiple lists on the source page
								// (e.g., a featured album also surfacing in "Recently Played").
								// Each instance has the same sharedTransitionTag. Only the first
								// one becomes the snapshot origin; the rest must still be hidden
								// so they don't show through behind the animating snapshot.
								if (presentingSharedElement) {
									presentingSharedElement.alpha = 0;
								}
								continue;
							}
							processedTags.add(tag);

							const presentedView = presented.find((v) => v.sharedTransitionTag === presentingView.sharedTransitionTag);
							const presentedSharedElement = presentedView.ios;
							const pageEndProps = pageEndTags[presentingView.sharedTransitionTag];

							const snapshot = UIImageView.alloc().init();
							if (pageEndProps?.callback) {
								await pageEndProps?.callback(presentedView, 'present');
							}

							// treat images differently...
							let imageSourceChangeListener: ((args: any) => void) | undefined;
							if (presentedSharedElement instanceof UIImageView) {
								// In case the image is loaded async, keep the snapshot's image in sync with
								// the destination view's image. We hold a ref so we can detach the listener
								// on cleanup (the View would otherwise hold a strong ref via the observers
								// map and the snapshot closure would leak).
								imageSourceChangeListener = () => {
									snapshot.image = iOSUtils.snapshotView(presentedSharedElement, Screen.mainScreen.scale);
									snapshot.tintColor = presentedSharedElement.tintColor;
								};
								presentedView.on('imageSourceChange', imageSourceChangeListener);

								snapshot.tintColor = presentedSharedElement.tintColor;
								snapshot.contentMode = presentedSharedElement.contentMode;
								// Seed the snapshot with the source's already-loaded image so the very
								// first frame of the animation isn't blank if the destination image is
								// still loading.
								if (presentingSharedElement instanceof UIImageView) {
									snapshot.image = presentingSharedElement.image;
								}
							}

							iOSUtils.copyLayerProperties(snapshot, presentingSharedElement, pageEndProps?.propertiesToMatch as any);
							snapshot.clipsToBounds = true;
							// console.log('---> snapshot: ', snapshot);

							const startFrame = presentingSharedElement.convertRectToView(presentingSharedElement.bounds, transitionContext.containerView);
							const endFrame = presentedSharedElement.convertRectToView(presentedSharedElement.bounds, transitionContext.containerView);
							snapshot.frame = startFrame;
							if (SharedTransition.DEBUG) {
								console.log('---> ', presentingView.sharedTransitionTag, ' frame:', iOSUtils.printCGRect(snapshot.frame));
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
								imageSourceChangeListener,
							});

							// set initial opacity to match the source view opacity
							snapshot.alpha = presentingView.opacity;
							// Hide both while animating in the transition context.
							//
							// We mutate native alpha directly rather than NS `opacity` so the NS-side
							// style remains the user's intended value (typically 1). If we instead set
							// `view.opacity = 0` and then a transition was interrupted before cleanup
							// (or the page was reused), `startOpacity` here could capture 0 from a prior
							// run and the cleanup below would leave the destination invisible.
							presentingSharedElement.alpha = 0;
							presentedSharedElement.alpha = 0;
						}
					};

					const positionIndependentTags = async () => {
						// "Independent" tags appear on only one of the two pages (or were
						// explicitly enumerated in pageEnd.sharedTransitionTags). We auto-discover
						// them so authors don't have to enumerate every tag manually:
						//   - source-only (orphan on presenting): fade *out* on present, fade
						//     back in on dismiss. e.g., a "FEATURED ALBUM" label on a hero card
						//     that has no counterpart on the destination page.
						//   - destination-only (orphan on presented): fade *in* on present, fade
						//     back out on dismiss. e.g., metadata that only exists on the detail
						//     page.
						// Authors can override per-tag via pageStart / pageEnd `sharedTransitionTags`
						// (e.g. add `y: -20` to slide while fading), or opt a view out entirely
						// with `sharedTransitionIgnore`.
						const orphanTags: Array<string> = [];
						const seenOrphan = new Set<string>();
						const addOrphan = (tag: string) => {
							if (!tag || seenOrphan.has(tag) || sharedElementTags.includes(tag)) return;
							seenOrphan.add(tag);
							orphanTags.push(tag);
						};
						for (const v of presenting) addOrphan(v.sharedTransitionTag);
						for (const v of presented) addOrphan(v.sharedTransitionTag);
						// Tags the user listed in pageEnd.sharedTransitionTags but that don't
						// match a real view are silently skipped further down — keep them in
						// the iteration so per-tag config still applies to existing orphans.
						for (const tag in pageEndTags) addOrphan(tag);

						for (const tag of orphanTags) {
							const pageStartIndependentProps = pageStart?.sharedTransitionTags ? pageStart?.sharedTransitionTags[tag] : null;
							const pageEndProps = pageEndTags[tag];
							let independentView = presenting.find((v) => v.sharedTransitionTag === tag);
							let isPresented = false;
							if (!independentView) {
								independentView = presented.find((v) => v.sharedTransitionTag === tag);
								if (!independentView) {
									// Tag declared in config but no matching view; skip (don't
									// break — later tags might still resolve).
									continue;
								}
								isPresented = true;
							}
							const independentSharedElement: UIView = independentView.ios;

							if (pageEndProps?.callback) {
								await pageEndProps?.callback(independentView, 'present');
							}

							const snapshot = UIImageView.alloc().initWithImage(iOSUtils.snapshotView(independentSharedElement, Screen.mainScreen.scale));

							if (independentSharedElement instanceof UIImageView) {
								snapshot.tintColor = independentSharedElement.tintColor;
								snapshot.contentMode = independentSharedElement.contentMode;
							}
							snapshot.clipsToBounds = true;

							const startFrame = independentSharedElement.convertRectToView(independentSharedElement.bounds, transitionContext.containerView);
							snapshot.frame = startFrame;
							if (SharedTransition.DEBUG) {
								console.log('---> ', independentView.sharedTransitionTag, ' frame:', iOSUtils.printCGRect(snapshot.frame));
							}

							const endFrameRect = getRectFromProps(pageEndProps);
							const endFrame = CGRectMake(startFrame.origin.x + (endFrameRect.x || 0), startFrame.origin.y + (endFrameRect.y || 0), startFrame.size.width, startFrame.size.height);

							// Opacity defaults are side-aware: source-only orphans fade out (1 → 0),
							// destination-only orphans fade in (0 → 1). The values are read back
							// during dismiss as `endOpacity → startOpacity` so the return phase is
							// automatically symmetric. Author-supplied opacity always wins.
							const startOpacity = isNumber(pageStartIndependentProps?.opacity) ? pageStartIndependentProps.opacity : isPresented ? 0 : independentView.opacity;
							const endOpacity = isNumber(pageEndProps?.opacity) ? pageEndProps.opacity : isPresented ? independentView.opacity : 0;

							// Snapshot's initial visible alpha. Default UIImageView alpha is 1;
							// destination-only orphans need to start at 0 so the fade-in is
							// visible, hence we always set it explicitly.
							snapshot.alpha = startOpacity;

							transition.sharedElements.independent.push({
								view: independentView,
								isPresented,
								startFrame,
								snapshot,
								endFrame,
								startTransform: independentSharedElement.transform,
								scale: pageEndProps?.scale,
								startOpacity,
								endOpacity,
								propertiesToMatch: pageEndProps?.propertiesToMatch,
								zIndex: isNumber(pageEndProps?.zIndex) ? pageEndProps.zIndex : 0,
							});

							// Native alpha; see comment in positionSharedTags.
							independentSharedElement.alpha = 0;
						}
					};

					// position all sharedTransitionTag elements
					await positionSharedTags();
					await positionIndependentTags();
					// combine to order by zIndex and add to transition context
					const snapshotData = transition.sharedElements.presenting.concat(transition.sharedElements.independent);
					snapshotData.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
					if (SharedTransition.DEBUG) {
						console.log(
							`zIndex settings:`,
							snapshotData.map((s) => {
								return {
									sharedTransitionTag: s.view.sharedTransitionTag,
									zIndex: s.zIndex,
								};
							}),
						);
					}

					for (const data of snapshotData) {
						// add snapshot to animate
						transitionContext.containerView.addSubview(data.snapshot);
					}

					// Important: always set after above shared element positions have had their start positions set
					transition.presented.view.alpha = isNumber(pageStart?.opacity) ? pageStart?.opacity : 0;
					transition.presented.view.frame = CGRectMake(startFrame.x, startFrame.y, startFrame.width, startFrame.height);
					// Optional top-corner rounding for sheet-style transitions (e.g.
					// a modal that's rounded at the bottom of the screen and flattens
					// as it slides up). Setting maskedCorners and masksToBounds here
					// (before the animation) so they're stable during the animated
					// cornerRadius change.
					if (isNumber((pageStart as any)?.cornerRadius) || isNumber((pageEnd as any)?.cornerRadius)) {
						const layer = transition.presented.view.layer;
						// top-left | top-right | bottom-left | bottom-right (CACornerMask bits)
						layer.maskedCorners = 15;
						layer.masksToBounds = true;
						if (isNumber((pageStart as any)?.cornerRadius)) {
							layer.cornerRadius = (pageStart as any).cornerRadius;
						}
					}

					const cleanupPresent = () => {
						for (const presented of transition.sharedElements.presented) {
							// Detach the per-transition imageSourceChange listener registered
							// during positionSharedTags so it doesn't leak (the snapshot is gone).
							if (presented.imageSourceChangeListener) {
								presented.view.off('imageSourceChange', presented.imageSourceChangeListener);
								presented.imageSourceChangeListener = null;
							}
							// Restore the destination native alpha from the NS opacity (the source
							// of truth). NS opacity wasn't modified during the transition, so this
							// reflects the user's intended visibility (typically 1).
							presented.view.ios.alpha = presented.view.opacity;
						}
						// Restore native alpha on every source view we touched — including
						// duplicates that share a sharedTransitionTag and were hidden without
						// a snapshot. Even though the source page is being removed, the View
						// instances may be reused on subsequent navigations.
						for (const sourceView of (transition.sharedElements as any)._allPresentingViews || []) {
							if (sourceView?.ios) {
								sourceView.ios.alpha = sourceView.opacity;
							}
						}
						for (const presenting of transition.sharedElements.presenting) {
							presenting.snapshot.removeFromSuperview();
						}
						for (const independent of transition.sharedElements.independent) {
							independent.snapshot.removeFromSuperview();
							if (independent.isPresented) {
								independent.view.ios.alpha = independent.view.opacity;
							}
						}
						SharedTransition.updateState(transition.id, {
							activeType: SharedTransitionAnimationType.dismiss,
						});
						if (type === 'page') {
							transition.presenting.view.removeFromSuperview();
						}
						transitionContext.completeTransition(true);
						SharedTransition.notifyEvent(SharedTransition.finishedEvent, {
							id: transition.id,
							type,
							action: 'present',
						});
					};

					const animateProperties = () => {
						if (SharedTransition.DEBUG) {
							console.log('3. Animating shared elements:');
						}
						transition.presented.view.alpha = isNumber(pageEnd?.opacity) ? pageEnd?.opacity : 1;

						const endFrame = getRectFromProps(pageEnd);
						transition.presented.view.frame = CGRectMake(endFrame.x, endFrame.y, endFrame.width, endFrame.height);
						// Animate cornerRadius alongside the page frame. Implicit animation
						// of cornerRadius is supported on iOS 11+, both inside
						// UIView.animateWith… and UIViewPropertyAnimator's animations block.
						if (isNumber((pageEnd as any)?.cornerRadius)) {
							transition.presented.view.layer.cornerRadius = (pageEnd as any).cornerRadius;
						}

						if (pageOut) {
							if (isNumber(pageOut.opacity)) {
								transition.presenting.view.alpha = pageOut?.opacity;
							}

							const outFrame = getRectFromProps(pageOut);
							transition.presenting.view.frame = CGRectMake(outFrame.x, outFrame.y, outFrame.width, outFrame.height);
						}
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
							iOSUtils.copyLayerProperties(presentingMatch.snapshot, presented.view.ios, presented.propertiesToMatch as any);
							// create a snapshot of the presented view
							presentingMatch.snapshot.image = iOSUtils.snapshotView(presented.view.ios, Screen.mainScreen.scale);
							// apply correct alpha
							presentingMatch.snapshot.alpha = presentingMatch.endOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presentingMatch.view.sharedTransitionTag} animate to: `, iOSUtils.printCGRect(correctedEndFrame));
							}
						}
						for (const independent of transition.sharedElements.independent) {
							const endFrame: CGRect = independent.endFrame;
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
								console.log(`---> ${independent.view.sharedTransitionTag} animate to: `, iOSUtils.printCGRect(independent.endFrame));
							}
						}
					};

					if (isNumber(pageEnd?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationDelayOptionsAnimationsCompletion(
							pageEnd?.duration / 1000,
							0,
							UIViewAnimationOptions.CurveEaseInOut,
							() => {
								animateProperties();
							},
							() => {
								cleanupPresent();
							},
						);
					} else {
						iOSUtils.animateWithSpring({
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
					SharedTransition.notifyEvent(SharedTransition.startedEvent, {
						id: transition.id,
						type,
						action: 'dismiss',
					});
					if (type === 'page') {
						transitionContext.containerView.insertSubviewBelowSubview(transition.presenting.view, transition.presented.view);
						// UIKit's standard pop places the incoming source view off to the
						// left so it can slide into position; for custom shared transitions
						// (where the destination either slides down or morphs to source) we
						// don't want that lateral slide. Pin the source to its fullscreen
						// frame so it stays put underneath the animating destination.
						// Users can still opt into a custom source animation via `pageOut`.
						const sourceDefaults = getRectFromProps(null);
						transition.presenting.view.frame = CGRectMake(0, 0, sourceDefaults.width, sourceDefaults.height);
					}
					// Morph + interactive dismiss: the gesture handler drives the
					// animation via transforms and finalizes by calling cancel/finish
					// on the transitionContext. Running the standard snapshot + spring
					// rig here would race that and frequently call completeTransition(true)
					// *before* the user's gesture ended — causing the dismiss to commit
					// even on a cancel. Skip the rest of the dismiss setup entirely.
					if (state.interactive?.dismiss?.morph && state.interactiveBegan) {
						return;
					}

					// console.log('transitionContext.containerView.subviews.count:', transitionContext.containerView.subviews.count);

					if (SharedTransition.DEBUG) {
						console.log(`  ${type}: Dismiss`);
						console.log(
							`1. Dismiss sharedTransitionTags to animate:`,
							transition.sharedElements.presented.map((p) => p.view.sharedTransitionTag),
						);

						console.log(`2. Add back previously stored sharedElements to dismiss:`);
					}

					const pageOut = state.pageOut;
					const pageEnd = state.pageEnd;
					const pageEndTags = pageEnd?.sharedTransitionTags || {};
					const pageReturn = state.pageReturn;

					for (const p of transition.sharedElements.presented) {
						// Use native alpha (not NS opacity) so we don't pollute the NS-side
						// value if the dismiss is interrupted; cleanup restores from NS opacity.
						p.view.ios.alpha = 0;
					}
					// Ensure top-corner masking + clipping is in place before we animate
					// cornerRadius back toward the start value. If the present pass already
					// set these, this is a harmless no-op.
					if (isNumber((pageReturn as any)?.cornerRadius)) {
						const layer = transition.presented.view.layer;
						layer.maskedCorners = 15; // top-left | top-right | bottom-left | bottom-right
						layer.masksToBounds = true;
					}

					// combine to order by zIndex and add to transition context
					const snapshotData = transition.sharedElements.presenting.concat(transition.sharedElements.independent);
					snapshotData.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
					if (SharedTransition.DEBUG) {
						console.log(
							`zIndex settings:`,
							snapshotData.map((s) => {
								return {
									sharedTransitionTag: s.view.sharedTransitionTag,
									zIndex: s.zIndex,
								};
							}),
						);
					}

					// first loop through all the shared elements and fire the callback
					for (const data of snapshotData) {
						const pageEndProps = pageEndTags[data.view.sharedTransitionTag];
						if (pageEndProps?.callback) {
							await pageEndProps?.callback(data.view, 'dismiss');
						}
					}

					// now that all the callbacks had their chance to run, we can take the snapshots
					for (const data of snapshotData) {
						const view = data.view.ios;
						const currentAlpha = view.alpha;
						if (pageReturn?.useStartOpacity) {
							// when desired, reset the alpha to the start value so the view is visible in the snapshot
							view.alpha = data.startOpacity;
						}

						// take a new snapshot
						data.snapshot.image = iOSUtils.snapshotView(view, Screen.mainScreen.scale);

						// find the currently visible view with the same sharedTransitionTag
						const fromView = transition.sharedElements.presented.find((p) => p.view.sharedTransitionTag === data.view.sharedTransitionTag)?.view;
						if (fromView) {
							// match the snapshot frame to the current frame of the fromView
							data.snapshot.frame = fromView.ios.convertRectToView(fromView.ios.bounds, transitionContext.containerView);
						}

						// snapshot has been taken, we can restore the alpha
						view.alpha = currentAlpha;

						// we recalculate the startFrame because the view might have changed its position in the background
						data.startFrame = view.convertRectToView(view.bounds, transitionContext.containerView);

						// add snapshot to animate
						transitionContext.containerView.addSubview(data.snapshot);
					}

					// Hide every source-side shared element now that snapshots have been
					// captured. The animating snapshot covers them; without this, the user
					// sees a "double image" — the real source element AND the snapshot
					// animating over it back to its position. Use the full list (not just
					// the deduped `presenting`) so duplicates from sister lists are hidden
					// too. Restored in cleanupDismiss below.
					for (const sourceView of (transition.sharedElements as any)._allPresentingViews || []) {
						if (sourceView?.ios) {
							sourceView.ios.alpha = 0;
						}
					}

					const cleanupDismiss = () => {
						// Restore alpha on every source view we hid — including duplicate
						// sources with the same sharedTransitionTag — using NS opacity as
						// the source of truth.
						for (const sourceView of (transition.sharedElements as any)._allPresentingViews || []) {
							if (sourceView?.ios) {
								sourceView.ios.alpha = sourceView.opacity;
							}
						}
						for (const presenting of transition.sharedElements.presenting) {
							presenting.snapshot.removeFromSuperview();
						}
						for (const presented of transition.sharedElements.presented) {
							// Detach the imageSourceChange listener and restore alpha. Even though
							// the destination page is being torn down, NS Views can outlive their
							// nativeView and we shouldn't leak observers.
							if (presented.imageSourceChangeListener) {
								presented.view.off('imageSourceChange', presented.imageSourceChangeListener);
								presented.imageSourceChangeListener = null;
							}
							if (presented.view.ios) {
								presented.view.ios.alpha = presented.view.opacity;
							}
						}
						for (const independent of transition.sharedElements.independent) {
							independent.view.ios.alpha = independent.view.opacity;
							independent.snapshot.removeFromSuperview();
						}
						SharedTransition.finishState(transition.id);
						transition.sharedElements = null;
						transitionContext.completeTransition(true);
						SharedTransition.notifyEvent(SharedTransition.finishedEvent, {
							id: transition.id,
							type,
							action: 'dismiss',
						});
					};

					const animateProperties = () => {
						if (SharedTransition.DEBUG) {
							console.log('3. Dismissing shared elements:');
						}

						transition.presented.view.alpha = isNumber(pageReturn?.opacity) ? pageReturn?.opacity : 0;

						const endFrame = getRectFromProps(pageReturn, getPageStartDefaultsForType(type));
						transition.presented.view.frame = CGRectMake(endFrame.x, endFrame.y, endFrame.width, endFrame.height);
						// Animate cornerRadius back toward the start value (e.g. a sheet
						// re-rounds as it slides offscreen).
						if (isNumber((pageReturn as any)?.cornerRadius)) {
							transition.presented.view.layer.cornerRadius = (pageReturn as any).cornerRadius;
						}

						if (pageOut) {
							// always return to defaults if pageOut had been used
							transition.presenting.view.alpha = 1;

							const outFrame = getRectFromProps(null);
							transition.presenting.view.frame = CGRectMake(0, 0, outFrame.width, outFrame.height);
						}

						for (const presenting of transition.sharedElements.presenting) {
							iOSUtils.copyLayerProperties(presenting.snapshot, presenting.view.ios, presenting.propertiesToMatch as any);
							presenting.snapshot.frame = presenting.startFrame;
							presenting.snapshot.alpha = presenting.startOpacity;

							if (SharedTransition.DEBUG) {
								console.log(`---> ${presenting.view.sharedTransitionTag} animate to: `, iOSUtils.printCGRect(presenting.snapshot.frame));
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
								console.log(`---> ${independent.view.sharedTransitionTag} animate to: `, iOSUtils.printCGRect(independent.snapshot.frame));
							}
						}
					};

					if (isNumber(pageReturn?.duration)) {
						// override spring and use only linear animation
						UIView.animateWithDurationDelayOptionsAnimationsCompletion(
							pageReturn?.duration / 1000,
							0,
							UIViewAnimationOptions.CurveEaseInOut,
							() => {
								animateProperties();
							},
							() => {
								cleanupDismiss();
							},
						);
					} else {
						iOSUtils.animateWithSpring({
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
		SharedTransition.notifyEvent(SharedTransition.startedEvent, {
			id: state.instance.id,
			type,
			action: 'interactiveStart',
		});
		switch (type) {
			case 'page':
				interactiveState.transitionContext.containerView.insertSubviewBelowSubview(state.instance.presenting.view, state.instance.presented.view);
				// Pin the source view to its fullscreen frame so it doesn't slide
				// in from off-left as the user drags. The default UIKit pop expects
				// to animate the source from off-left; for shared-element / morph
				// transitions we want the source to stay put underneath the
				// animating destination so the visuals feel connected.
				{
					const sourceDefaults = getRectFromProps(null);
					state.instance.presenting.view.frame = CGRectMake(0, 0, sourceDefaults.width, sourceDefaults.height);
				}
				break;
		}
	}

	static interactiveUpdate(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType, percent: number) {
		if (interactiveState) {
			if (state.interactive?.dismiss?.morph) {
				// Morph mode: the gesture handler drives the destination view's
				// transform directly. We only forward the event so observers can
				// react to the gesture's percentage.
				SharedTransition.notifyEvent(SharedTransition.interactiveUpdateEvent, {
					id: state?.instance?.id,
					type,
					percent,
				});
				return;
			}
			if (!interactiveState.added) {
				// Defer setup until the gesture has clearly committed to a horizontal
				// dismiss motion. A vertical scroll on a descendant scroll view also
				// triggers the page-level pan gesture (NS pan recognizers don't yield
				// to scroll-view pans by default), producing near-zero percent values.
				// Without this guard we'd mount the dismiss snapshots and hide the
				// destination during a scroll, making the image look "stuck" until the
				// cancel animation runs.
				if (Math.abs(percent) < 0.05) {
					return;
				}
				interactiveState.added = true;
				for (const p of state.instance.sharedElements.presented) {
					// Native alpha (not NS opacity) for the same reason as the dismiss path:
					// if the user lets go without crossing the threshold, cancel uses NS
					// opacity as source of truth to restore.
					p.view.ios.alpha = 0;
				}
				for (const p of state.instance.sharedElements.presenting) {
					p.snapshot.alpha = p.endOpacity;
					interactiveState.transitionContext.containerView.addSubview(p.snapshot);
				}
				// Re-mount independent (orphan) snapshots so they're available to
				// animate alongside the gesture. They were removed in present cleanup
				// but the records (including their snapshots) live on transition.sharedElements.
				// Source-only orphans were left at alpha 0 since present; their snapshots
				// pick up where the present animation left off (endOpacity).
				for (const ind of state.instance.sharedElements.independent) {
					ind.snapshot.alpha = ind.endOpacity;
					interactiveState.transitionContext.containerView.addSubview(ind.snapshot);
				}
				// Hide every source-side shared element (including duplicates that share
				// a sharedTransitionTag in sister lists) so the user only sees the
				// animating snapshot — not the snapshot AND the real source element
				// simultaneously ("double image" during interactive dismissal).
				for (const sourceView of (state.instance.sharedElements as any)._allPresentingViews || []) {
					if (sourceView?.ios) {
						sourceView.ios.alpha = 0;
					}
				}

				const pageStart = state.pageStart;

				const startFrame = getRectFromProps(pageStart, getPageStartDefaultsForType(type));
				interactiveState.propertyAnimator = UIViewPropertyAnimator.alloc().initWithDurationDampingRatioAnimations(1, 1, () => {
					for (const p of state.instance.sharedElements.presenting) {
						p.snapshot.frame = p.startFrame;
						iOSUtils.copyLayerProperties(p.snapshot, p.view.ios, p.propertiesToMatch as any);

						p.snapshot.alpha = 1;
					}
					// Animate orphan snapshots back toward their start state alongside
					// the rest of the dismiss. For source-only orphans this is the
					// fade-back-in that mirrors the fade-out of present.
					for (const ind of state.instance.sharedElements.independent) {
						ind.snapshot.alpha = ind.startOpacity;
						if (ind.scale) {
							ind.snapshot.transform = ind.startTransform;
						} else {
							ind.snapshot.frame = ind.startFrame;
						}
					}
					state.instance.presented.view.alpha = isNumber(state.pageReturn?.opacity) ? state.pageReturn?.opacity : 0;
					state.instance.presented.view.frame = CGRectMake(startFrame.x, startFrame.y, state.instance.presented.view.bounds.size.width, state.instance.presented.view.bounds.size.height);
					// Drive cornerRadius via the same percent the user controls — round
					// the page back up as they pan it offscreen.
					if (isNumber((state.pageReturn as any)?.cornerRadius)) {
						state.instance.presented.view.layer.cornerRadius = (state.pageReturn as any).cornerRadius;
					}
				});
			}

			interactiveState.propertyAnimator.fractionComplete = percent;
			SharedTransition.notifyEvent(SharedTransition.interactiveUpdateEvent, {
				id: state?.instance?.id,
				type,
				percent,
			});
		}
	}

	static interactiveCancel(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType) {
		if (state?.instance && interactiveState && state.interactive?.dismiss?.morph) {
			// Morph mode cancel — spring the destination view back to identity.
			const view = state.instance.presented?.view;
			let didFinalize = false;
			const finalize = () => {
				if (didFinalize) return;
				didFinalize = true;
				if (view) view.transform = CGAffineTransformIdentity;
				// Restore the source-side element alphas that the gesture hid on
				// engagement so the source page is correct when shown again.
				for (const v of (state.instance.sharedElements as any)?._allPresentingViews || []) {
					if (v?.ios) v.ios.alpha = v.opacity;
				}
				if (interactiveState.transitionContext) {
					interactiveState.transitionContext.cancelInteractiveTransition();
					interactiveState.transitionContext.completeTransition(false);
				}
				SharedTransition.updateState(state?.instance?.id, {
					interactiveBegan: false,
					interactiveCancelled: true,
				});
				SharedTransition.notifyEvent(SharedTransition.interactiveCancelledEvent, {
					id: state?.instance?.id,
					type,
				});
			};
			if (view) {
				iOSUtils.animateWithSpring({
					animations: () => {
						view.transform = CGAffineTransformIdentity;
						// Cross-fade sources back IN PARALLEL with the spring so
						// they're visible from frame one of the snap-back. This
						// also makes the source restoration robust to a new
						// gesture interrupting our completion callback.
						for (const v of (state.instance.sharedElements as any)?._allPresentingViews || []) {
							if (v?.ios) v.ios.alpha = v.opacity;
						}
					},
					completion: () => finalize(),
				});
				// Safety: ensure finalize runs even if the animation completion
				// is dropped (e.g. interrupted by another gesture).
				setTimeout(finalize, 800);
			} else {
				finalize();
			}
			return;
		}
		if (state?.instance && interactiveState && !interactiveState.added) {
			// The gesture engaged the interactive transition but never crossed the
			// motion threshold in interactiveUpdate (e.g., the user was scrolling
			// vertically). Nothing was visually set up — just tell UIKit we're
			// cancelling and clear the flags.
			if (interactiveState.transitionContext) {
				interactiveState.transitionContext.cancelInteractiveTransition();
				interactiveState.transitionContext.completeTransition(false);
			}
			SharedTransition.updateState(state?.instance?.id, {
				interactiveBegan: false,
				interactiveCancelled: true,
			});
			SharedTransition.notifyEvent(SharedTransition.interactiveCancelledEvent, {
				id: state?.instance?.id,
				type,
			});
			return;
		}
		if (state?.instance && interactiveState?.added && interactiveState?.propertyAnimator) {
			interactiveState.propertyAnimator.reversed = true;
			const duration = isNumber(state.pageEnd?.duration) ? state.pageEnd?.duration / 1000 : CORE_ANIMATION_DEFAULTS.duration;
			interactiveState.propertyAnimator.continueAnimationWithTimingParametersDurationFactor(null, duration);
			setTimeout(() => {
				for (const p of state.instance.sharedElements.presented) {
					// Restore native alpha from NS opacity (the user-intended value).
					p.view.ios.alpha = p.view.opacity;
				}
				// Restore alpha on every source view we hid during interactiveUpdate
				// (including duplicates from sister lists).
				for (const sourceView of (state.instance.sharedElements as any)._allPresentingViews || []) {
					if (sourceView?.ios) {
						sourceView.ios.alpha = sourceView.opacity;
					}
				}
				for (const p of state.instance.sharedElements.presenting) {
					p.snapshot.removeFromSuperview();
				}
				// Tear down orphan snapshots that interactiveUpdate re-mounted. The
				// source-only orphans' view.alpha stays at 0 — we're returning to the
				// presented (modal-on-top) state, so they should remain hidden until
				// a real dismiss completes. Cancel/finish for the next dismiss owns
				// the eventual restore.
				for (const ind of state.instance.sharedElements.independent) {
					ind.snapshot.removeFromSuperview();
					// Reset snapshot alpha to its post-present end state so a subsequent
					// interactiveUpdate picks up from the right place.
					ind.snapshot.alpha = ind.endOpacity;
				}
				state.instance.presented.view.alpha = 1;
				interactiveState.propertyAnimator = null;
				interactiveState.added = false;
				interactiveState.transitionContext.cancelInteractiveTransition();
				interactiveState.transitionContext.completeTransition(false);
				SharedTransition.updateState(state?.instance?.id, {
					interactiveBegan: false,
					interactiveCancelled: true,
				});
				SharedTransition.notifyEvent(SharedTransition.interactiveCancelledEvent, {
					id: state?.instance?.id,
					type,
				});
			}, duration * 1000);
		}
	}

	static interactiveFinish(state: SharedTransitionState, interactiveState: PlatformTransitionInteractiveState, type: TransitionNavigationType) {
		if (state?.instance && interactiveState && state.interactive?.dismiss?.morph) {
			// Morph mode finish — animate the destination view to the matching
			// source element's frame and fade it out, then complete.
			const view = state.instance.presented?.view;
			const destTag = state.instance.sharedElements?.presented?.[0]?.view?.sharedTransitionTag;
			const matchingSource = state.instance.sharedElements?.presenting?.find?.((p) => p.view.sharedTransitionTag === destTag);
			const srcIos = matchingSource?.view?.ios;
			const containerView = interactiveState.transitionContext?.containerView;
			let targetTransform: any = null;
			if (view && srcIos && containerView) {
				const frameInContainer = srcIos.convertRectToView(srcIos.bounds, containerView);
				const bounds = view.bounds;
				if (bounds.size.width > 0 && bounds.size.height > 0 && frameInContainer.size.width > 0 && frameInContainer.size.height > 0) {
					// Uniform scale that fits the modal inside the source's frame
					// (matches the gesture-handler's morph target). Width-only
					// scaling left the modal taller than the source, so the
					// release-spring landed past the source position and the
					// modal appeared to just fade in place.
					const targetScale = Math.min(frameInContainer.size.width / bounds.size.width, frameInContainer.size.height / bounds.size.height);
					const targetCx = frameInContainer.origin.x + frameInContainer.size.width / 2;
					const targetCy = frameInContainer.origin.y + frameInContainer.size.height / 2;
					const currentCx = bounds.size.width / 2;
					const currentCy = bounds.size.height / 2;
					const tx = targetCx - currentCx;
					const ty = targetCy - currentCy;
					targetTransform = CGAffineTransformConcat(CGAffineTransformMakeTranslation(tx, ty), CGAffineTransformMakeScale(targetScale, targetScale));
				}
			}
			// Build a snapshot fly-back for each shared element so the album
			// art (etc.) does a real shared-element transition to its source
			// frame in parallel with the destination view's shrink+fade.
			// Without this, the image rides along with the morphing view and
			// lands at a visually offset position rather than precisely back
			// at the source thumbnail.
			const sharedSnapshots: Array<{ snap: UIImageView; endFrame: CGRect; endCornerRadius: number }> = [];
			if (containerView) {
				for (const presented of state.instance.sharedElements?.presented || []) {
					const destSharedView = presented.view?.ios as UIView | undefined;
					const tag = presented.view?.sharedTransitionTag;
					if (!destSharedView || !tag) continue;
					const sourceShared = state.instance.sharedElements?.presenting?.find?.((p) => p.view.sharedTransitionTag === tag);
					const srcSharedView = sourceShared?.view?.ios as UIView | undefined;
					if (!srcSharedView) continue;
					const startFrame = destSharedView.convertRectToView(destSharedView.bounds, containerView);
					const endFrame = srcSharedView.convertRectToView(srcSharedView.bounds, containerView);
					if (startFrame.size.width <= 0 || endFrame.size.width <= 0) continue;
					const snap = UIImageView.alloc().init();
					if (destSharedView instanceof UIImageView && destSharedView.image) {
						snap.image = destSharedView.image;
						snap.contentMode = destSharedView.contentMode;
						snap.tintColor = destSharedView.tintColor;
					} else {
						try {
							snap.image = iOSUtils.snapshotView(presented.view.ios, Screen.mainScreen.scale);
						} catch (e) {
							continue;
						}
					}
					snap.clipsToBounds = true;
					snap.layer.cornerRadius = destSharedView.layer?.cornerRadius || 0;
					snap.frame = startFrame;
					containerView.addSubview(snap);
					// Hide the destination shared element so we don't see it
					// shrinking inside the morphing view at the same time the
					// snapshot is flying back to source — that would double up.
					destSharedView.alpha = 0;
					sharedSnapshots.push({
						snap,
						endFrame,
						endCornerRadius: srcSharedView.layer?.cornerRadius || 0,
						srcSharedView,
					} as any);
				}
			}
			// Identify which source NS views have a matching fly-back snapshot.
			// Those sources stay at alpha 0 through the spring and are restored
			// inside finalize(), so the snapshot doesn't overlay an already-
			// visible source mid-flight (which looks like two images for a beat).
			const snapshottedSources = new Set<UIView>();
			for (const entry of sharedSnapshots as any[]) {
				if (entry.srcSharedView) snapshottedSources.add(entry.srcSharedView);
			}
			// Source-only orphan views (album thumbnails, badges, etc.) were
			// already restored to their opacity by the gesture handler at morph
			// engagement, so we don't need fade-in snapshots here — they're
			// already visible behind the morphing modal.
			let didFinalize = false;
			const finalize = () => {
				if (didFinalize) return;
				didFinalize = true;
				// Detach the imageSourceChange listeners that were attached during
				// PRESENT — the destination View is about to be torn down.
				for (const presented of state.instance.sharedElements?.presented || []) {
					if ((presented as any).imageSourceChangeListener) {
						presented.view.off('imageSourceChange', (presented as any).imageSourceChangeListener);
						(presented as any).imageSourceChangeListener = null;
					}
				}
				// Restore the snapshotted sources (held at alpha 0 through the
				// spring) immediately before removing the snapshot, so the
				// snapshot's last frame and the source's first visible frame
				// coincide exactly — no double-image, no gap.
				for (const entry of sharedSnapshots as any[]) {
					const srcSharedView: UIView | undefined = entry.srcSharedView;
					if (srcSharedView) {
						const nsView = state.instance.sharedElements?.presenting?.find?.((p) => p.view?.ios === srcSharedView)?.view;
						srcSharedView.alpha = nsView ? nsView.opacity : 1;
					}
				}
				for (const { snap } of sharedSnapshots) {
					snap.removeFromSuperview();
				}
				// Independent (orphan) views were restored at gesture engagement,
				// so they're already visible. Just tear down any leftover present-
				// phase snapshots that weren't removed in present cleanup, and
				// ensure alpha is set from NS opacity for safety in case the
				// engagement code path was bypassed.
				for (const independent of state.instance?.sharedElements?.independent || []) {
					if (independent.view?.ios) {
						independent.view.ios.alpha = independent.view.opacity;
					}
					independent.snapshot?.removeFromSuperview();
				}
				if (view) {
					view.transform = CGAffineTransformIdentity;
					view.alpha = 1;
				}
				SharedTransition.finishState(state.instance.id);
				if (interactiveState.transitionContext) {
					interactiveState.transitionContext.finishInteractiveTransition();
					interactiveState.transitionContext.completeTransition(true);
				}
				SharedTransition.notifyEvent(SharedTransition.finishedEvent, {
					id: state?.instance?.id,
					type,
					action: 'interactiveFinish',
				});
			};
			if (view && targetTransform) {
				iOSUtils.animateWithSpring({
					animations: () => {
						view.transform = targetTransform;
						view.alpha = 0;
						// Restore source-side element alphas IN PARALLEL with the
						// destination's morph + fade — but skip sources that have
						// a flying snapshot. Those are held at alpha 0 and
						// revealed by finalize() right before the snapshot is
						// removed, so the user never sees both the snapshot AND
						// the source visible at the same time.
						for (const v of (state.instance.sharedElements as any)?._allPresentingViews || []) {
							if (v?.ios && !snapshottedSources.has(v.ios)) {
								v.ios.alpha = v.opacity;
							}
						}
						// Source-only orphan views were already restored at
						// engagement; nothing more to do for them here.
						// Fly each shared-element snapshot to its source frame.
						// Rides the same spring so the image lands precisely back
						// at the source position as the destination view fades.
						for (const { snap, endFrame, endCornerRadius } of sharedSnapshots) {
							snap.frame = endFrame;
							snap.layer.cornerRadius = endCornerRadius;
						}
					},
					completion: () => finalize(),
				});
				// Safety: ensure finalize runs even if the animation completion
				// is dropped (e.g. interrupted by another gesture).
				setTimeout(finalize, 800);
			} else {
				// No target transform; ensure sources are still restored.
				for (const v of (state.instance.sharedElements as any)?._allPresentingViews || []) {
					if (v?.ios) v.ios.alpha = v.opacity;
				}
				finalize();
			}
			return;
		}
		if (state?.instance && interactiveState?.added && interactiveState?.propertyAnimator) {
			interactiveState.propertyAnimator.reversed = false;

			const duration = isNumber(state.pageReturn?.duration) ? state.pageReturn?.duration / 1000 : CORE_ANIMATION_DEFAULTS.duration;
			interactiveState.propertyAnimator.continueAnimationWithTimingParametersDurationFactor(null, duration);
			setTimeout(() => {
				// Restore alpha on every source view we hid (including duplicates) so
				// the source page is visible if shown again.
				for (const sourceView of (state.instance.sharedElements as any)._allPresentingViews || []) {
					if (sourceView?.ios) {
						sourceView.ios.alpha = sourceView.opacity;
					}
				}
				for (const presenting of state.instance.sharedElements.presenting) {
					presenting.snapshot.removeFromSuperview();
				}
				for (const presented of state.instance.sharedElements.presented) {
					if ((presented as any).imageSourceChangeListener) {
						presented.view.off('imageSourceChange', (presented as any).imageSourceChangeListener);
						(presented as any).imageSourceChangeListener = null;
					}
				}
				// Restore alpha on independent (orphan) source views and tear down
				// their snapshots. Without this, source-only orphans (any non-matched
				// sharedTransitionTag on the source page) stay at alpha 0 forever,
				// leaving the page visibly blank where they used to be. The non-morph
				// interactive path drives a propertyAnimator instead of running the
				// dismiss snapshot/animation rig, so the standard cleanup doesn't run.
				for (const ind of state.instance.sharedElements.independent) {
					if (ind.view?.ios) {
						ind.view.ios.alpha = ind.view.opacity;
					}
					ind.snapshot?.removeFromSuperview();
				}

				SharedTransition.finishState(state.instance.id);
				interactiveState.propertyAnimator = null;
				interactiveState.added = false;
				interactiveState.transitionContext.finishInteractiveTransition();
				interactiveState.transitionContext.completeTransition(true);
				SharedTransition.notifyEvent(SharedTransition.finishedEvent, {
					id: state?.instance?.id,
					type,
					action: 'interactiveFinish',
				});
			}, duration * 1000);
		}
	}
}
