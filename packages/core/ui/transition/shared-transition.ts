import type { Transition } from '.';
import { querySelectorAll, ViewBase } from '../core/view-base';
import type { View } from '../core/view';

export const DEFAULT_DURATION = 0.35;
export const DEFAULT_SPRING = {
	tension: 140,
	friction: 10,
};
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
	 * Whether you want to allow interactive dismissal
	 */
	interactiveDismissal?: boolean;
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
	 * Linear duration in milliseconds
	 * Note: When this is defined, it will override spring options and use only linear animation.
	 */
	duration?: number;
	/**
	 * Spring animation settings.
	 * Defaults to 140 tension with 10 friction.
	 */
	spring?: {
		tension?: number;
		friction?: number;
		mass?: number;
		delay?: number;
		velocity?: number;
		animateOptions?: any /* ios only: UIViewAnimationOptions */;
	};
};
/**
 * Shared Element Transitions (preview)
 * Allows you to auto animate between shared elements on two different screesn to create smooth navigational experiences.
 * View components can define sharedTransitionTag="name" alone with a transition through this API.
 */
export class SharedTransition {
	/**
	 * Configure a custom transition with presentation/dismissal options.
	 * @param transition The custom Transition instance.
	 * @param options
	 * @returns a configured SharedTransition instance for use with navigational APIs.
	 */
	static custom(transition: Transition, options: SharedTransitionConfig): { instance: Transition } {
		SharedTransition.updateState(transition.id, {
			...options,
			instance: transition,
			activeType: SharedTransitionAnimationType.present,
		});
		return { instance: transition };
	}

	/**
	 * Enable to see various console logging output of Shared Element Transition behavior.
	 */
	static DEBUG = false;
	/**
	 * @private
	 */
	static currentStack: Array<SharedTransitionState>;
	/**
	 * @private
	 */
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
	/**
	 * @private
	 */
	static getState(id: number) {
		return SharedTransition.currentStack.find((t) => t.instance.id === id);
	}
	/**
	 * @private
	 */
	static finishState(id: number) {
		const index = SharedTransition.currentStack.findIndex((t) => t.instance.id === id);
		if (index > -1) {
			SharedTransition.currentStack.splice(index, 1);
		}
	}
	/**
	 * Gather view collections based on sharedTransitionTag details.
	 * @param fromPage Page moving away from
	 * @param toPage Page moving to
	 * @returns Collections of views pertaining to shared elements or particular pages
	 */
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
