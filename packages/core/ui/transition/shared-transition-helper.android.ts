import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { SharedTransitionState } from './shared-transition';

export class SharedTransitionHelper {
	static animate(state: SharedTransitionState, transitionContext: any, type: TransitionNavigationType) {
		// may be able to consolidate android handling here in future
	}
	static interactiveStart(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void {}
	static interactiveUpdate(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType, percent: number): void {}
	static interactiveCancel(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void {}
	static interactiveFinish(state: SharedTransitionState, interactiveState: TransitionInteractiveState, type: TransitionNavigationType): void {}
}
