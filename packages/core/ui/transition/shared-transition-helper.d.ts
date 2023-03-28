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
