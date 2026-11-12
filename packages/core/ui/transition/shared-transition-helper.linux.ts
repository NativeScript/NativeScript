import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { SharedTransition, SharedTransitionAnimationType, SharedTransitionState } from './shared-transition';

// TODO(linux): morph shared elements; for now the transition completes immediately.
export class SharedTransitionHelper {
	static animate(state: SharedTransitionState, _context: any, type: TransitionNavigationType): void {
		const present = type === 'page' || type === 'modal' ? true : false;
		SharedTransition.notifyEvent?.(SharedTransition.startedEvent, { id: state?.instance?.id, type, action: present ? 'present' : 'dismiss' } as any);
		try {
			SharedTransition.updateState(state.instance.id, { activeType: SharedTransitionAnimationType.dismiss });
		} catch {}
		SharedTransition.notifyEvent?.(SharedTransition.finishedEvent, { id: state?.instance?.id, type } as any);
	}

	static interactiveStart(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}
	static interactiveUpdate(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType, _percent: number): void {}
	static interactiveCancel(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}
	static interactiveFinish(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void {}
}
