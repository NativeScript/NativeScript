import type { SharedTransitionType, SharedInteractiveState } from '.';
import type { SharedTransitionState } from './shared-transition';

export declare class SharedTransitionHelper {
	static animate(state: SharedTransitionState, transitionContext: any /* iOS: UIViewControllerContextTransitioning */, type: SharedTransitionType): void;
	static interactiveStart(state: SharedTransitionState, interactiveState: SharedInteractiveState, type: SharedTransitionType): void;
	static interactiveUpdate(state: SharedTransitionState, interactiveState: SharedInteractiveState, type: SharedTransitionType, percent: number): void;
	static interactiveCancel(state: SharedTransitionState, interactiveState: SharedInteractiveState, type: SharedTransitionType): void;
	static interactiveFinish(state: SharedTransitionState, interactiveState: SharedInteractiveState, type: SharedTransitionType): void;
}
