import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { SharedTransitionState } from './shared-transition';

export class SharedTransitionHelper {
	static animate(_state: SharedTransitionState, _transitionContext: any, _type: TransitionNavigationType): void {}

	static interactiveStart(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}

	static interactiveUpdate(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType, _percent: number): void {}

	static interactiveCancel(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}

	static interactiveFinish(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}
}
