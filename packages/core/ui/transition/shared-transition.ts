import type { Transition } from '.';
// import type { View } from '../../core/view';
import type { Page } from '../page';

export const DEFAULT_DURATION = 0.35;
// always increment when adding new transitions to be able to track their state
export enum SharedTransitionAnimationType {
	present,
	dismiss,
}
export interface SharedTransitionConfig {
	/**
	 * Page which will start the transition
	 */
	page?: Page;
	/**
	 * Preconfigured transition or your own custom configured one
	 */
	instance?: Transition;
	/**
	 * View settings to start your transition from.
	 */
	incomingViewStart?: SharedTransitionPageProperties;
	/**
	 * View settings to animate your page to.
	 */
	incomingViewEnd?: SharedTransitionPageProperties;
	/**
	 * View settings to animate your page to when dismissed.
	 */
	dismissViewEnd?: SharedTransitionPageProperties;
}
export interface SharedTransitionState extends SharedTransitionConfig {
	id?: number;
	activeType?: SharedTransitionAnimationType;
	toPage?: Page;
}
type SharedTransitionPageProperties = {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	opacity?: number;
	/**
	 * Duration in milliseconds
	 */
	duration?: number;
};
export class SharedTransition {
	static configure(options: SharedTransitionConfig): Transition {
		SharedTransition.updateState({
			...options,
			id: options.instance.id,
			activeType: SharedTransitionAnimationType.present,
		});
		return options.instance;
	}

	static currentStack: Array<SharedTransitionState>;
	static updateState(state: SharedTransitionState) {
		if (!SharedTransition.currentStack) {
			SharedTransition.currentStack = [];
		}
		const existingTransition = SharedTransition.getState(state.id);
		if (existingTransition) {
			// updating existing
			for (const key in state) {
				existingTransition[key] = state[key];
				// console.log(' ... updating state: ', key, state[key])
			}
		} else {
			SharedTransition.currentStack.push(state);
		}
	}
	static addPageToTop(page: Page) {
		if (SharedTransition.currentStack?.length) {
			const top = SharedTransition.currentStack.slice(-1)[0];
			if (top) {
				SharedTransition.updateState({
					id: top.id,
					toPage: page,
				});
			}
		}
	}
	static getState(id: number) {
		return SharedTransition.currentStack.find((t) => t.id === id);
	}
	static finishState(id: number) {
		const index = SharedTransition.currentStack.findIndex((t) => t.id === id);
		if (index > -1) {
			SharedTransition.currentStack.splice(index, 1);
		}
	}
}
