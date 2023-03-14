import type { Transition } from '.';
import { querySelectorAll, ViewBase } from '../core/view-base';
import type { View } from '../core/view';

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
	page?: ViewBase;
	/**
	 * Preconfigured transition or your own custom configured one
	 */
	instance?: Transition;
	/**
	 * View settings to start your transition.
	 */
	toPageStart?: SharedTransitionPageProperties;
	/**
	 * View settings to end your transition.
	 */
	toPageEnd?: SharedTransitionPageProperties;
	/**
	 * View settings to end your transition for the 'from' (aka outgoing or dismissed) page.
	 */
	fromPageEnd?: SharedTransitionPageProperties;
}
export interface SharedTransitionState extends SharedTransitionConfig {
	activeType?: SharedTransitionAnimationType;
	toPage?: ViewBase;
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
/**
 * Shared Element Transitions (experimental)
 *
 * Note: some APIs may change in future releases
 */
export class SharedTransition {
	static custom(instance: Transition, options: SharedTransitionConfig): { instance: Transition } {
		SharedTransition.updateState(instance.id, {
			...options,
			instance,
			activeType: SharedTransitionAnimationType.present,
		});
		return { instance };
	}

	static currentStack: Array<SharedTransitionState>;
	static updateState(id: number, state: SharedTransitionState) {
		if (!SharedTransition.currentStack) {
			SharedTransition.currentStack = [];
		}
		const existingTransition = SharedTransition.getState(id);
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
	static getState(id: number) {
		return SharedTransition.currentStack.find((t) => t.instance.id === id);
	}
	static finishState(id: number) {
		const index = SharedTransition.currentStack.findIndex((t) => t.instance.id === id);
		if (index > -1) {
			SharedTransition.currentStack.splice(index, 1);
		}
	}
	static getSharedElements(
		fromPage: ViewBase,
		toPage: ViewBase
	): {
		sharedElements: Array<View>;
		presented: Array<View>;
		presenting: Array<View>;
	} {
		// 1. Presented view: gather all sharedTransitionTag views
		const presentedSharedElements = <Array<View>>querySelectorAll(toPage, 'sharedTransitionTag');
		// console.log('presented sharedTransitionTag total:', presentedSharedElements.length);

		// 2. Presenting view: gather all sharedTransitionTag views
		const presentingSharedElements = <Array<View>>querySelectorAll(fromPage, 'sharedTransitionTag');
		// console.log('presenting sharedTransitionTag total:', presentingSharedElements.length);

		// 3. only handle sharedTransitionTag on presenting which match presented
		const presentedTags = presentedSharedElements.map((v) => v.sharedTransitionTag);
		return {
			sharedElements: presentingSharedElements.filter((v) => presentedTags.includes(v.sharedTransitionTag)),
			presented: presentedSharedElements,
			presenting: presentingSharedElements,
		};
	}
}
