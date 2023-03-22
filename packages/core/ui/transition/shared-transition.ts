import type { Transition } from '.';
import { Observable } from '../../data/observable';
import { Screen } from '../../platform';
import { isNumber } from '../../utils/types';
import { querySelectorAll, ViewBase } from '../core/view-base';
import type { View } from '../core/view';
import type { PanGestureEventData } from '../gestures';

export const DEFAULT_DURATION = 0.35;
export const DEFAULT_SPRING = {
	tension: 140,
	friction: 10,
	mass: 1,
	velocity: 0,
	delay: 0,
};
// always increment when adding new transitions to be able to track their state
export enum SharedTransitionAnimationType {
	present,
	dismiss,
}
export interface SharedTransitionInteractiveOptions {
	/**
	 * When the pan exceeds this percentage and you let go, finish the transition.
	 * Default 0.5
	 */
	finishThreshold?: number;
	/**
	 * You can create your own percent formula used for determing the interactive value.
	 * By default, we handle this via a formula like this for an interactive page back transition:
	 * - return eventData.deltaX / (eventData.ios.view.bounds.size.width / 2);
	 * @param eventData PanGestureEventData
	 * @returns The percentage value to be used as the finish/cancel threshold
	 */
	percentFormula?: (eventData: PanGestureEventData) => number;
}
export interface SharedTransitionConfig {
	/**
	 * Preconfigured transition or your own custom configured one.
	 */
	instance?: Transition;
	/**
	 * Interactive transition settings. (iOS only at the moment)
	 */
	interactive?: {
		/**
		 * Whether you want to allow interactive dismissal.
		 * Defaults to using 'pan' gesture for dismissal however you can customize your own.
		 */
		dismiss?: SharedTransitionInteractiveOptions;
	};
	/**
	 * View settings to start your transition.
	 */
	pageStart?: SharedTransitionPageProperties;
	/**
	 * View settings to end your transition.
	 */
	pageEnd?: SharedTransitionPageProperties;
	/**
	 * View settings to end your transition for the 'from' (aka outgoing or dismissed) page.
	 */
	pageReturn?: SharedTransitionPageProperties;
}
export interface SharedTransitionState extends SharedTransitionConfig {
	/**
	 * Page which will start the transition.
	 */
	page?: ViewBase;
	activeType?: SharedTransitionAnimationType;
	toPage?: ViewBase;
	// used internally for determining interactive gesture state of the transition
	interactiveBegan?: boolean;
	interactiveCancelled?: boolean;
}
export type SharedRect = { x?: number; y?: number; width?: number; height?: number };
export type SharedProperties = SharedRect & { opacity?: number; scale?: { x?: number; y?: number } };
export type SharedSpringProperties = {
	tension?: number;
	friction?: number;
	mass?: number;
	delay?: number;
	velocity?: number;
	animateOptions?: any /* ios only: UIViewAnimationOptions */;
};
type SharedTransitionPageProperties = SharedProperties & {
	/**
	 * Linear duration in milliseconds
	 * Note: When this is defined, it will override spring options and use only linear animation.
	 */
	duration?: number;
	sharedTransitionTags?: { [key: string]: SharedProperties };
	/**
	 * Spring animation settings.
	 * Defaults to 140 tension with 10 friction.
	 */
	spring?: SharedSpringProperties;
};
let sharedTransitionEvents: Observable;
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
	static custom(transition: Transition, options?: SharedTransitionConfig): { instance: Transition } {
		SharedTransition.updateState(transition.id, {
			...(options || {}),
			instance: transition,
			activeType: SharedTransitionAnimationType.present,
		});
		return { instance: transition };
	}
	static events() {
		if (!sharedTransitionEvents) {
			sharedTransitionEvents = new Observable();
		}
		return sharedTransitionEvents;
	}
	static startedEvent = 'SharedTransitionStartedEvent';
	static finishedEvent = 'SharedTransitionFinishedEvent';
	static cancelledEvent = 'SharedTransitionCancelledEvent';

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
		return SharedTransition.currentStack?.find((t) => t.instance.id === id);
	}
	/**
	 * @private
	 */
	static finishState(id: number) {
		const index = SharedTransition.currentStack?.findIndex((t) => t.instance.id === id);
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
		// console.log(
		// 	'presenting sharedTransitionTags:',
		// 	presentingSharedElements.map((v) => v.sharedTransitionTag)
		// );

		// 3. only handle sharedTransitionTag on presenting which match presented
		const presentedTags = presentedSharedElements.map((v) => v.sharedTransitionTag);
		return {
			sharedElements: presentingSharedElements.filter((v) => presentedTags.includes(v.sharedTransitionTag)),
			presented: presentedSharedElements,
			presenting: presentingSharedElements,
		};
	}
}

export function getRectFromProps(props: SharedTransitionPageProperties, defaults?: SharedRect): SharedRect {
	defaults = {
		x: 0,
		y: 0,
		width: Screen.mainScreen.widthDIPs,
		height: Screen.mainScreen.heightDIPs,
		...(defaults || {}),
	};
	return {
		x: isNumber(props?.x) ? props?.x : defaults.x,
		y: isNumber(props?.y) ? props?.y : defaults.y,
		width: isNumber(props?.width) ? props?.width : defaults.width,
		height: isNumber(props?.height) ? props?.height : defaults.height,
	};
}

export function getSpringFromProps(props: SharedSpringProperties) {
	return {
		tension: isNumber(props?.tension) ? props?.tension : DEFAULT_SPRING.tension,
		friction: isNumber(props?.friction) ? props?.friction : DEFAULT_SPRING.friction,
		mass: isNumber(props?.mass) ? props?.mass : DEFAULT_SPRING.mass,
		velocity: isNumber(props?.velocity) ? props?.velocity : DEFAULT_SPRING.velocity,
		delay: isNumber(props?.delay) ? props?.delay : DEFAULT_SPRING.delay,
	};
}

export function getPageStartDefaultsForType(type: 'page' | 'modal') {
	return {
		x: type === 'page' ? Screen.mainScreen.widthDIPs : 0,
		y: type === 'page' ? 0 : Screen.mainScreen.heightDIPs,
		width: Screen.mainScreen.widthDIPs,
		height: Screen.mainScreen.heightDIPs,
	};
}
