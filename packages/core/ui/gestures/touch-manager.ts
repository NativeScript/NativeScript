/**
 * Provides various helpers for adding easy touch handling animations.
 * Use when needing to implement more interactivity with your UI regarding touch down/up behavior.
 */
import { GestureEventData, GestureEventDataWithState, TouchGestureEventData } from '.';
import { Animation } from '../animation';
import { AnimationDefinition } from '../animation/animation-interfaces';
import { View } from '../core/view';
import { isObject, isFunction } from '../../utils/types';
import { GestureEvents, GestureStateTypes, GestureTypes } from './gestures-common';

export type TouchAnimationFn = (view: View) => void;
export type TouchAnimationOptions = {
	up?: TouchAnimationFn | AnimationDefinition;
	down?: TouchAnimationFn | AnimationDefinition;
};
export enum TouchAnimationTypes {
	up = 'up',
	down = 'down',
}
export type VisionHoverEffect = 'automatic' | 'highlight' | 'lift';
export type VisionHoverShape = 'circle' | 'rect';
export type VisionHoverOptions = {
	effect: VisionHoverEffect;
	shape?: VisionHoverShape;
	shapeCornerRadius?: number;
};

/**
 * Manage interactivity in your apps easily with TouchManager.
 * Store reusable down/up animation settings for touches as well as optionally enable automatic tap (down/up) animations for your app.
 */
export class TouchManager {
	/**
	 * Enable animations for all tap bindings in the UI.
	 */
	static enableGlobalTapAnimations: boolean;
	/**
	 * (visionOS Only) Enable hoverStyle for all tap bindings in the UI.
	 */
	static enableGlobalHoverWhereTap: boolean;
	/**
	 * Define reusable hover styles keyed by name to use throughout your UI.
	 */
	static visionHoverOptions: { [key: string]: VisionHoverOptions };
	/**
	 * Used internally - defines reusable UIHoverStyle's
	 */
	static visionHoverStyleCache: { [key: string]: UIHoverStyle };
	/**
	 * Define reusable touch animations to use on views with touchAnimation defined or with enableGlobalTapAnimations on.
	 */
	// Note: In the future, we may expand this to allow an Array of "named" animations to collect an entire suite of custom app animations. Combined with a new 'touch-action' CSS property which could indicate them by name, for example:
	// .touch-grow {
	//   touch-action: down-grow up-grow
	// }
	// TouchManager.animations = {
	//   down: [
	//      { name: grow, (view: View) => { /* animations */ } },
	//      { name: pop, (view: View) => { /* animations */ } }
	//   ],
	//   up: [
	//      { name: grow, (view: View) => { /* animations */ } },
	//      { name: pop, (view: View) => { /* animations */ } }
	//   ]
	// }
	static animations: TouchAnimationOptions;
	/**
	 * Native Touch handlers (iOS only) registered with the view through the TouchManager.
	 * The TouchManager uses this internally but makes public for other versatility if needed.
	 */
	static touchHandlers: Array<{ view: View; handler: any /* UIGestureRecognizer */ }>;
	/**
	 * When using NativeScript AnimationDefinition's for touch animations this will contain any instances for finer grain control of starting/stopping under various circumstances.
	 * The TouchManager uses this internally but makes public for other versatility if needed.
	 */
	static touchAnimationDefinitions: Array<{ view: View; animation: Animation; type: TouchAnimationTypes }>;
	/**
	 * The TouchManager uses this internally.
	 * Adds touch animations to view based upon it's touchAnimation property or TouchManager.animations.
	 * @param view NativeScript view instance
	 */
	static addAnimations(view: View) {
		const handleDown = (view?.touchAnimation && (<TouchAnimationOptions>view?.touchAnimation).down) || (TouchManager.animations && TouchManager.animations.down);
		const handleUp = (view?.touchAnimation && (<TouchAnimationOptions>view?.touchAnimation).up) || (TouchManager.animations && TouchManager.animations.up);

		if (__APPLE__) {
			if (view?.ios?.addTargetActionForControlEvents) {
				// can use UIControlEvents
				if (!TouchManager.touchHandlers) {
					TouchManager.touchHandlers = [];
				}
				TouchManager.touchHandlers.push({
					view,
					handler: TouchControlHandler.initWithOwner(new WeakRef(view)),
				});

				if (handleDown) {
					(<UIControl>view.ios).addTargetActionForControlEvents(TouchManager.touchHandlers[TouchManager.touchHandlers.length - 1].handler, GestureEvents.touchDown, UIControlEvents.TouchDown | UIControlEvents.TouchDragEnter);
					view.on(GestureEvents.touchDown, (args) => {
						TouchManager.startAnimationForType(view, TouchAnimationTypes.down);
					});
				}
				if (handleUp) {
					(<UIControl>view.ios).addTargetActionForControlEvents(TouchManager.touchHandlers[TouchManager.touchHandlers.length - 1].handler, GestureEvents.touchUp, UIControlEvents.TouchDragExit | UIControlEvents.TouchCancel | UIControlEvents.TouchUpInside | UIControlEvents.TouchUpOutside);
					view.on(GestureEvents.touchUp, (args) => {
						TouchManager.startAnimationForType(view, TouchAnimationTypes.up);
					});
				}
			} else {
				if (handleDown || handleUp) {
					view.on(GestureEvents.gestureAttached, (args: GestureEventData) => {
						if (args.type === GestureTypes.longPress) {
							(<UILongPressGestureRecognizer>args.ios).minimumPressDuration = (<View>args.object)?.touchDelay || 0;
						}
					});
					view.on(GestureTypes[GestureTypes.longPress], (args: GestureEventDataWithState) => {
						switch (args.state) {
							case GestureStateTypes.began:
								if (handleDown) {
									TouchManager.startAnimationForType(<View>args.view, TouchAnimationTypes.down);
								}
								break;
							case GestureStateTypes.cancelled:
							case GestureStateTypes.ended:
								if (handleUp) {
									TouchManager.startAnimationForType(<View>args.view, TouchAnimationTypes.up);
								}
								break;
						}
					});
				}
			}
		} else {
			if (handleDown || handleUp) {
				view.on(GestureTypes[GestureTypes.touch], (args: TouchGestureEventData) => {
					switch (args.action) {
						case 'down':
							if (handleDown) {
								view.notify({
									eventName: GestureEvents.touchDown,
									object: view,
									data: args.android,
								});
							}
							break;
						case 'up':
						case 'cancel':
							if (handleUp) {
								view.notify({
									eventName: GestureEvents.touchUp,
									object: view,
									data: args.android,
								});
							}
							break;
					}
				});
				if (handleDown) {
					view.on(GestureEvents.touchDown, (args) => {
						TouchManager.startAnimationForType(view, TouchAnimationTypes.down);
					});
				}
				if (handleUp) {
					view.on(GestureEvents.touchUp, (args) => {
						TouchManager.startAnimationForType(view, TouchAnimationTypes.up);
					});
				}
			}
		}

		view.on(View.disposeNativeViewEvent, (args) => {
			const index = TouchManager.touchHandlers?.findIndex((handler) => handler.view === args.object);
			if (index > -1) {
				TouchManager.touchHandlers.splice(index, 1);
			}
			TouchManager.touchAnimationDefinitions = TouchManager.touchAnimationDefinitions?.filter((d) => d.view !== args.object);
		});
	}

	static startAnimationForType(view: View, type: TouchAnimationTypes) {
		if (view) {
			const animate = function (definition: AnimationDefinition | TouchAnimationFn) {
				if (definition) {
					if (isFunction(definition)) {
						(<TouchAnimationFn>definition)(view);
					} else {
						if (!TouchManager.touchAnimationDefinitions) {
							TouchManager.touchAnimationDefinitions = [];
						}
						// reuse animations for each type
						let touchAnimation: Animation;
						// triggering animations should always cancel other animations which may be in progress
						for (const d of TouchManager.touchAnimationDefinitions) {
							if (d.view === view && d.animation) {
								d.animation.cancel();
								if (d.type === type) {
									touchAnimation = d.animation;
								}
							}
						}

						if (!touchAnimation) {
							touchAnimation = new Animation([
								{
									target: view,
									...(<AnimationDefinition>definition),
								},
							]);
							TouchManager.touchAnimationDefinitions.push({
								view,
								type,
								animation: touchAnimation,
							});
						}
						touchAnimation.play().catch(() => {});
					}
				}
			};
			// always use instance defined animation over global
			if (isObject(view.touchAnimation) && view.touchAnimation[type]) {
				animate(view.touchAnimation[type]);
			} else if (TouchManager.animations?.[type]) {
				// fallback to globally defined
				animate(TouchManager.animations?.[type]);
			}
		}
	}

	/**
	 * The TouchManager uses this internally.
	 * Adds visionOS hover styles to views based upon it's visionHoverStyle property
	 * @param view NativeScript view instance
	 */
	static addHoverStyle(view: View) {
		if (__VISIONOS__ && view?.ios) {
			if (!TouchManager.visionHoverOptions) {
				TouchManager.visionHoverOptions = {};
			}
			if (!TouchManager.visionHoverOptions['default']) {
				// Add default hoverStyle to apply everywhere (no custom hover style being defined on this view)
				TouchManager.visionHoverOptions['default'] = {
					effect: 'automatic',
				};
			}
			if (!TouchManager.visionHoverStyleCache) {
				TouchManager.visionHoverStyleCache = {};
			}
			const createHoverStyleFromOptions = function (options: VisionHoverOptions) {
				let effect: UIHoverEffect;
				switch (options.effect) {
					case 'automatic':
						effect = UIHoverAutomaticEffect.effect();
						break;
					case 'highlight':
						effect = UIHoverHighlightEffect.effect();
						break;
					case 'lift':
						effect = UIHoverLiftEffect.effect();
						break;
				}
				let shape: UIShape;
				switch (options.shape) {
					case 'circle':
						shape = UIShape.circleShape;
						break;
					case 'rect':
						if (options.shapeCornerRadius) {
							shape = UIShape.rectShapeWithCornerRadius(options.shapeCornerRadius);
						} else {
							shape = UIShape.rectShape;
						}
						break;
				}
				return UIHoverStyle.styleWithEffectShape(effect, shape);
			};
			if (!TouchManager.visionHoverStyleCache['default']) {
				const defaultOptions = TouchManager.visionHoverOptions['default'];

				TouchManager.visionHoverStyleCache['default'] = createHoverStyleFromOptions(
					defaultOptions || {
						effect: 'automatic',
					},
				);
			}

			if (view.visionHoverStyle) {
				if (typeof view.visionHoverStyle === 'string') {
					(view.ios as UIView).hoverStyle = TouchManager.visionHoverStyleCache[view.visionHoverStyle] || TouchManager.visionHoverStyleCache['default'];
				}
			} else {
				(view.ios as UIView).hoverStyle = TouchManager.visionHoverStyleCache['default'];
			}
		}
	}
}

export let TouchControlHandler: {
	initWithOwner: (owner: WeakRef<View>) => any;
};
ensureTouchControlHandlers();

function ensureTouchControlHandlers() {
	if (__APPLE__) {
		@NativeClass
		class TouchHandlerImpl extends NSObject {
			private _owner: WeakRef<View>;
			static ObjCExposedMethods = {
				touchDown: { returns: interop.types.void, params: [interop.types.id] },
				touchUp: { returns: interop.types.void, params: [interop.types.id] },
			};

			static initWithOwner(owner: WeakRef<View>): TouchHandlerImpl {
				const handler = <TouchHandlerImpl>TouchHandlerImpl.new();
				handler._owner = owner;
				return handler;
			}

			touchDown(args) {
				this._owner?.deref?.().notify({
					eventName: GestureEvents.touchDown,
					object: this._owner?.deref?.(),
					data: args,
				});
			}

			touchUp(args) {
				this._owner?.deref?.().notify({
					eventName: GestureEvents.touchUp,
					object: this._owner?.deref?.(),
					data: args,
				});
			}
		}

		TouchControlHandler = TouchHandlerImpl;
	}
}
