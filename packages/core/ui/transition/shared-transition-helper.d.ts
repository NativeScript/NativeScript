import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import type { SharedTransitionState } from './shared-transition';

/**
 * Platform helper to aid in creating your own custom Shared Element Transition classes.
 * (iOS Only)
 */
export declare class SharedTransitionHelper {
	static animate(state: SharedTransitionState, transitionContext: any /* iOS: UIViewControllerContextTransitioning */, type: TransitionNavigationType): void;
	static interactiveStart(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void;
	static interactiveUpdate(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType, percent: number): void;
	static interactiveCancel(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void;
	static interactiveFinish(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void;
}

/** (iOS only) Insert a sibling shadow view behind `presentedView` for the duration of an interactive dismiss. No-op when `shadow` is falsy. */
export declare function applyInteractiveDismissShadow(presentedView: any, shadow: any): void;
/** (iOS only) Mirror the modal's current transform onto the shadow view so they morph together. Safe to call when no shadow was applied. */
export declare function syncInteractiveDismissShadow(presentedView: any): void;
/** (iOS only) Remove the sibling shadow view inserted by `applyInteractiveDismissShadow`. Safe to call when no shadow was applied. */
export declare function removeInteractiveDismissShadow(presentedView: any): void;
