import type { View } from '../core/view';
import { SharedElementSettings, TransitionInteractiveState, Transition } from '.';
import { isNumber } from '../../utils/types';
import { CORE_ANIMATION_DEFAULTS, getDurationWithDampingFromSpring } from '../../utils/animation-helpers';
import { PanGestureEventData, GestureStateTypes } from '../gestures';
import { ios as iOSUtils } from '../../utils/native-helper';
import { SharedTransition, SharedTransitionAnimationType } from './shared-transition';
import { SharedTransitionHelper } from './shared-transition-helper';

function _findInnerScroll(view: UIView | undefined | null): UIScrollView | null {
	// Walk the destination's view subtree breadth-first looking for the first
	// UIScrollView. Returned so the dismiss handler can both read its current
	// contentOffset (to tell "was scrolled" from "was at top") and pin it in
	// place while an interactive dismiss is engaged.
	if (!view) return null;
	const queue: UIView[] = [view];
	while (queue.length) {
		const v = queue.shift();
		if (!v) continue;
		if (v instanceof UIScrollView) {
			return v as UIScrollView;
		}
		const subviews = v.subviews;
		if (!subviews) continue;
		for (let i = 0; i < subviews.count; i++) {
			queue.push(subviews.objectAtIndex(i));
		}
	}
	return null;
}

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
	// Tracks the gesture's lifecycle:
	//  - 'idle'    : no active touch.
	//  - 'pending' : touched and might be panning, but we haven't seen enough
	//                motion to know whether it's a dismiss or a scroll.
	//  - 'active'  : confirmed dismiss intent — UIKit interactive transition
	//                is engaged and the morph transform tracks the finger.
	//  - 'ignored' : determined the gesture is a scroll (or upward at the top
	//                of a non-scrolling area); we let the gesture run out
	//                without engaging UIKit.
	private _gesturePhase: 'idle' | 'pending' | 'active' | 'ignored' = 'idle';
	private _gestureScrollY: number = 0;
	// The inner UIScrollView (if any) discovered at gesture-began. Held so we
	// can freeze it (scrollEnabled = false) while the dismiss is active and
	// restore the prior value when the gesture ends.
	private _innerScroll: UIScrollView | null = null;
	private _scrollWasEnabled: boolean | undefined;
	// Captured at engagement: the matching source element's frame expressed in
	// the destination view's coordinate system. Morph progress interpolates
	// from identity toward this frame so the destination shrinks into place.
	private _morphTarget: { scale: number; tx: number; ty: number } | null = null;

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
		if (!args?.ios?.view) return;
		const state = SharedTransition.getState(this.id);
		if (!state) {
			this._teardownGesture();
			return;
		}

		const morph = !!state.interactive?.dismiss?.morph;
		const morphOptions = typeof state.interactive?.dismiss?.morph === 'object' ? state.interactive.dismiss.morph : null;
		const viewW = args.ios.view.bounds.size.width;
		const viewH = args.ios.view.bounds.size.height;
		const dx = args.deltaX;
		const dy = args.deltaY;
		const dist = Math.hypot(dx, dy);
		const morphPercent = dist / viewH;
		const percent = state.interactive?.dismiss?.percentFormula ? state.interactive.dismiss.percentFormula(args) : morph ? morphPercent : dx / viewW;
		if (SharedTransition.DEBUG) {
			console.log('Interactive dismissal percentage:', percent, 'phase:', this._gesturePhase);
		}
		switch (args.state) {
			case GestureStateTypes.began: {
				// Defensive reset: a previous interactive dismiss may have been
				// interrupted before its cleanup ran, leaving a lingering
				// transform on the presented view or alpha=0 on source views.
				// Recover from that here so each gesture starts from a clean
				// slate regardless of prior animation state.
				const presentedView = this.presented?.view;
				if (presentedView) {
					presentedView.transform = CGAffineTransformIdentity;
					presentedView.alpha = 1;
				}
				const sources = state.instance?.sharedElements?._allPresentingViews || [];
				for (const v of sources) {
					if (v?.ios) v.ios.alpha = v.opacity ?? 1;
				}
				// Don't engage UIKit yet — we need a few points of motion to know
				// whether this is a dismiss gesture or a scroll. Cache the inner
				// scrollview and its contentOffset at gesture start so the decision
				// can tell "was scrolled" from "was at top".
				this._gesturePhase = 'pending';
				this._innerScroll = _findInnerScroll(this.presented?.view);
				this._gestureScrollY = this._innerScroll?.contentOffset.y ?? 0;
				break;
			}
			case GestureStateTypes.changed:
				if (this._gesturePhase === 'ignored') return;
				if (this._gesturePhase === 'pending') {
					// Wait for enough motion to make a confident direction call.
					const motionThreshold = 8;
					const absX = Math.abs(dx);
					const absY = Math.abs(dy);
					if (absX < motionThreshold && absY < motionThreshold) return;
					const horizontalDominant = absX > absY;
					const downward = dy > 0;
					const scrollWasAtTop = this._gestureScrollY <= 0;
					// Engagement rule:
					//  - Primarily horizontal motion → always allow (swipe-back).
					//  - Vertical-downward motion → only when the inner scrollview
					//    was at its top at gesture start (sheet-style dismiss).
					//  - Anything else → ignore so the scrollview can take over.
					const shouldEngage = horizontalDominant || (downward && scrollWasAtTop);
					if (!shouldEngage) {
						this._gesturePhase = 'ignored';
						return;
					}
					this._gesturePhase = 'active';
					// Freeze the inner scrollview at its current offset for the
					// duration of the dismiss so the page contents don't scroll
					// along with the dismiss drag (which would shift the morph
					// source mid-flight and make the snap-back look off).
					if (this._innerScroll) {
						this._scrollWasEnabled = this._innerScroll.scrollEnabled;
						this._innerScroll.scrollEnabled = false;
					}
					SharedTransition.updateState(this.id, {
						interactiveBegan: true,
						interactiveCancelled: false,
					});
					if (this._interactiveStartCallback) {
						this._interactiveStartCallback();
					}
					// Compute morph target: the matching source element's frame in
					// the destination view's coordinate system. We capture it once
					// at engagement so subsequent moves interpolate toward a stable
					// anchor, even if the source page is scrolled during the drag.
					this._morphTarget = null;
					const stateNow = SharedTransition.getState(this.id);
					if (morph && stateNow) {
						const presented = stateNow.instance?.sharedElements?.presented?.[0];
						const destTag = presented?.view?.sharedTransitionTag;
						const sources = (stateNow.instance?.sharedElements as any)?._allPresentingViews || [];
						const matchingSource = sources.find?.((v: any) => v?.sharedTransitionTag === destTag) || sources[0];
						const srcIos = matchingSource?.ios;
						const destView = this.presented?.view;
						if (srcIos && destView) {
							const f = srcIos.convertRectToView(srcIos.bounds, destView);
							const bounds = destView.bounds;
							if (bounds.size.width > 0 && bounds.size.height > 0 && f.size.width > 0) {
								const scaleT = f.size.width / bounds.size.width;
								const txT = f.origin.x + f.size.width / 2 - bounds.size.width / 2;
								const tyT = f.origin.y + f.size.height / 2 - bounds.size.height / 2;
								this._morphTarget = { scale: scaleT, tx: txT, ty: tyT };
							}
						}
						// Hide every source-side element so it doesn't show through
						// the morphing destination. Restored on cancel/finish.
						for (const v of sources) {
							if (v?.ios) v.ios.alpha = 0;
						}
					}
				}
				if (this._gesturePhase !== 'active') return;
				if (morph) {
					const presentedView = this.presented?.view;
					if (presentedView) {
						const minScale = morphOptions?.minScale ?? 0.2;
						// Interpolate from identity (t=0) toward the source frame
						// (t=1) as the drag progresses. `t` accelerates the morph so
						// the destination noticeably shrinks within typical drag
						// distances rather than staying near full size.
						const t = Math.min(dist / (viewH * 0.5), 1);
						const target = this._morphTarget;
						let scale: number;
						let tx: number;
						let ty: number;
						if (target) {
							const targetScale = Math.max(target.scale, minScale);
							scale = 1 + (targetScale - 1) * t;
							// Blend finger-follow (1-t weight) with target-attract
							// (t weight) so the view feels grabbed but gravitates
							// toward the source as the user commits.
							tx = dx * (1 - t) + target.tx * t;
							ty = dy * (1 - t) + target.ty * t;
						} else {
							scale = Math.max(minScale, 1 - t * (1 - minScale));
							tx = dx;
							ty = dy;
						}
						presentedView.transform = CGAffineTransformConcat(CGAffineTransformMakeTranslation(tx, ty), CGAffineTransformMakeScale(scale, scale));
					}
				}
				if (percent < 1 && this.interactiveController) {
					this.interactiveController.updateInteractiveTransition(percent);
				}
				break;
			case GestureStateTypes.cancelled:
			case GestureStateTypes.ended: {
				const phase = this._gesturePhase;
				this._gesturePhase = 'idle';
				// Restore the inner scrollview's scrollEnabled regardless of
				// whether the gesture engaged or was ignored.
				if (this._innerScroll && this._scrollWasEnabled !== undefined) {
					this._innerScroll.scrollEnabled = this._scrollWasEnabled;
					this._scrollWasEnabled = undefined;
				}
				this._innerScroll = null;
				if (phase !== 'active') {
					// Either the gesture never crossed the engagement threshold or
					// we explicitly ignored it (a scroll). Nothing to wind down.
					return;
				}
				const finishThreshold = isNumber(state.interactive?.dismiss?.finishThreshold) ? state.interactive.dismiss.finishThreshold : 0.5;
				const shouldFinish = percent > finishThreshold;
				if (this.interactiveController) {
					if (shouldFinish) {
						this._teardownGesture();
						this.interactiveController.finishInteractiveTransition();
					} else {
						SharedTransition.updateState(this.id, {
							interactiveCancelled: true,
						});
						this.interactiveController.cancelInteractiveTransition();
					}
				} else if (morph) {
					// Fallback: UIKit didn't engage. Reset the morph transform so the
					// destination doesn't stay stuck.
					const presentedView = this.presented?.view;
					if (presentedView) {
						iOSUtils.animateWithSpring({
							animations: () => {
								presentedView.transform = CGAffineTransformIdentity;
							},
						});
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
