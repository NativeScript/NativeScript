import type { Transition, TransitionNavigationType, SharedTransitionTagPropertiesToMatch } from '.';
import { Observable } from '../../data/observable';
import { Screen } from '../../platform';
import { isNumber } from '../../utils/types';
import { CORE_ANIMATION_DEFAULTS } from '../../utils/common';
import { querySelectorAll, ViewBase } from '../core/view-base';
import type { View } from '../core/view';
import type { PanGestureEventData } from '../gestures';

// always increment when adding new transitions to be able to track their state
export enum SharedTransitionAnimationType {
	present,
	dismiss,
}
type SharedTransitionEventAction = 'present' | 'dismiss' | 'interactiveStart' | 'interactiveFinish';
export type SharedTransitionEventData = { eventName: string; data: { id: number; type: TransitionNavigationType; action?: SharedTransitionEventAction; percent?: number } };
export type SharedRect = { x?: number; y?: number; width?: number; height?: number };
export type SharedProperties = SharedRect & {
	opacity?: number;
	scale?: { x?: number; y?: number };
};
/**
 * Properties which can be set on individual Shared Elements
 */
export type SharedTransitionTagProperties = SharedProperties & {
	/**
	 * The visual stacking order where 0 is at the bottom.
	 * Shared elements are stacked one on top of the other during each transition.
	 * By default they are not ordered in any particular fashion.
	 */
	zIndex?: number;
	/**
	 * Collection of properties to match and animate on each shared element.
	 *
	 * Defaults to: 'backgroundColor', 'cornerRadius', 'borderWidth', 'borderColor'
	 *
	 * Tip: Using an empty array, [], for view or layer will avoid copying any properties if desired.
	 */
	propertiesToMatch?: SharedTransitionTagPropertiesToMatch;
	/**
	 *
	 */
	callback?: (view: View, action: SharedTransitionEventAction) => Promise<void>;
};
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
	 * (iOS Only) Allow "independent" elements found only on one of the screens to take part in the animation.
	 * Note: This feature will be brought to Android in a future release.
	 */
	sharedTransitionTags?: { [key: string]: SharedTransitionTagProperties };
	/**
	 * Spring animation settings.
	 * Defaults to 140 tension with 10 friction.
	 */
	spring?: SharedSpringProperties;
};
type SharedTransitionPageWithDurationProperties = SharedTransitionPageProperties & {
	/**
	 * Linear duration in milliseconds
	 * Note: When this is defined, it will override spring options and use only linear animation.
	 */
	duration?: number | undefined | null;
};
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
	 * View settings to start your transition with.
	 */
	pageStart?: SharedTransitionPageProperties;
	/**
	 * View settings to end your transition with.
	 */
	pageEnd?: SharedTransitionPageWithDurationProperties;
	/**
	 * View settings to return to the original page with.
	 */
	pageReturn?: SharedTransitionPageWithDurationProperties;
}
export interface SharedTransitionState extends SharedTransitionConfig {
	/**
	 * (Internally used) Preconfigured transition or your own custom configured one.
	 */
	instance?: Transition;
	/**
	 * Page which will start the transition.
	 */
	page?: ViewBase;
	activeType?: SharedTransitionAnimationType;
	toPage?: ViewBase;
	/**
	 * Whether interactive transition has began.
	 */
	interactiveBegan?: boolean;
	/**
	 * Whether interactive transition was cancelled.
	 */
	interactiveCancelled?: boolean;
}
class SharedTransitionObservable extends Observable {
	// @ts-ignore
	on(eventNames: string, callback: (data: SharedTransitionEventData) => void, thisArg?: any) {
		super.on(eventNames, <any>callback, thisArg);
	}
}
let sharedTransitionEvents: SharedTransitionObservable;
let currentStack: Array<SharedTransitionState>;
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
		const pageEnd = options?.pageEnd;
		if (isNumber(pageEnd?.duration)) {
			// Android uses milliseconds/iOS uses seconds
			// users pass in milliseconds
			transition.setDuration(global.isIOS ? pageEnd?.duration / 1000 : pageEnd?.duration);
		}
		return { instance: transition };
	}
	/**
	 * Listen to various shared element transition events.
	 * @returns Observable
	 */
	static events(): SharedTransitionObservable {
		if (!sharedTransitionEvents) {
			sharedTransitionEvents = new SharedTransitionObservable();
		}
		return sharedTransitionEvents;
	}
	/**
	 * When the transition starts.
	 */
	static startedEvent = 'SharedTransitionStartedEvent';
	/**
	 * When the transition finishes.
	 */
	static finishedEvent = 'SharedTransitionFinishedEvent';
	/**
	 * When the interactive transition cancels.
	 */
	static interactiveCancelledEvent = 'SharedTransitionInteractiveCancelledEvent';
	/**
	 * When the interactive transition updates with the percent value.
	 */
	static interactiveUpdateEvent = 'SharedTransitionInteractiveUpdateEvent';

	/**
	 * Enable to see various console logging output of Shared Element Transition behavior.
	 */
	static DEBUG = false;
	/**
	 * Update transition state.
	 * @param id Transition instance id
	 * @param state SharedTransitionState
	 */
	static updateState(id: number, state: SharedTransitionState) {
		if (!currentStack) {
			currentStack = [];
		}
		const existingTransition = SharedTransition.getState(id);
		if (existingTransition) {
			// updating existing
			for (const key in state) {
				existingTransition[key] = state[key];
				// console.log(' ... updating state: ', key, state[key])
			}
		} else {
			currentStack.push(state);
		}
	}
	/**
	 * Get current state for any transition.
	 * @param id Transition instance id
	 */
	static getState(id: number) {
		return currentStack?.find((t) => t.instance?.id === id);
	}
	/**
	 * Finish transition state.
	 * @param id Transition instance id
	 */
	static finishState(id: number) {
		const index = currentStack?.findIndex((t) => t.instance?.id === id);
		if (index > -1) {
			currentStack.splice(index, 1);
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
		const presentedSharedElements = <Array<View>>querySelectorAll(toPage, 'sharedTransitionTag').filter((v) => !v.sharedTransitionIgnore && typeof v.sharedTransitionTag === 'string');
		// console.log('presented sharedTransitionTag total:', presentedSharedElements.length);

		// 2. Presenting view: gather all sharedTransitionTag views
		const presentingSharedElements = <Array<View>>querySelectorAll(fromPage, 'sharedTransitionTag').filter((v) => !v.sharedTransitionIgnore && typeof v.sharedTransitionTag === 'string');
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

/**
 * Get dimensional rectangle (x,y,width,height) from properties with fallbacks for any undefined values.
 * @param props combination of properties conformed to SharedTransitionPageProperties
 * @param defaults fallback properties when props doesn't contain a value for it
 * @returns { x,y,width,height }
 */
export function getRectFromProps(props: SharedTransitionPageProperties, defaults?: SharedRect): SharedRect {
	defaults = {
		x: 0,
		y: 0,
		width: getPlatformWidth(),
		height: getPlatformHeight(),
		...(defaults || {}),
	};
	return {
		x: isNumber(props?.x) ? props?.x : defaults.x,
		y: isNumber(props?.y) ? props?.y : defaults.y,
		width: isNumber(props?.width) ? props?.width : defaults.width,
		height: isNumber(props?.height) ? props?.height : defaults.height,
	};
}

/**
 * Get spring properties with default fallbacks for any undefined values.
 * @param props various spring related properties conforming to SharedSpringProperties
 * @returns
 */
export function getSpringFromProps(props: SharedSpringProperties) {
	return {
		tension: isNumber(props?.tension) ? props?.tension : CORE_ANIMATION_DEFAULTS.spring.tension,
		friction: isNumber(props?.friction) ? props?.friction : CORE_ANIMATION_DEFAULTS.spring.friction,
		mass: isNumber(props?.mass) ? props?.mass : CORE_ANIMATION_DEFAULTS.spring.mass,
		velocity: isNumber(props?.velocity) ? props?.velocity : CORE_ANIMATION_DEFAULTS.spring.velocity,
		delay: isNumber(props?.delay) ? props?.delay : 0,
	};
}

/**
 * Page starting defaults for provided type.
 * @param type TransitionNavigationType
 * @returns { x,y,width,height }
 */
export function getPageStartDefaultsForType(type: TransitionNavigationType) {
	return {
		x: type === 'page' ? getPlatformWidth() : 0,
		y: type === 'page' ? 0 : getPlatformHeight(),
		width: getPlatformWidth(),
		height: getPlatformHeight(),
	};
}

function getPlatformWidth() {
	return global.isAndroid ? Screen.mainScreen.widthPixels : Screen.mainScreen.widthDIPs;
}

function getPlatformHeight() {
	return global.isAndroid ? Screen.mainScreen.heightPixels : Screen.mainScreen.heightDIPs;
}
