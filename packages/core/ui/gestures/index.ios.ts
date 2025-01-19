// Definitions.

import { GestureEventData, TapGestureEventData, GestureEventDataWithState, SwipeGestureEventData, PanGestureEventData, RotationGestureEventData, PinchGestureEventData } from '.';
import type { View } from '../core/view';
import { EventData } from '../../data/observable';

// Types.
import { GesturesObserverBase, toString, TouchAction, GestureStateTypes, GestureTypes, SwipeDirection, GestureEvents } from './gestures-common';

// Import layout from utils directly to avoid circular references
import { layout } from '../../utils';

export * from './gestures-common';

export function observe(target: View, type: GestureTypes, callback: (args: GestureEventData) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);

	return observer;
}

@NativeClass
class UIGestureRecognizerDelegateImpl extends NSObject implements UIGestureRecognizerDelegate {
	public static ObjCProtocols = [UIGestureRecognizerDelegate];

	public gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean {
		return true;
	}

	public gestureRecognizerShouldRequireFailureOfGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean {
		// If both gesture recognizers are of type UITapGestureRecognizer & one of them is a doubleTap,
		// we must require a failure.
		if (gestureRecognizer instanceof UITapGestureRecognizer && otherGestureRecognizer instanceof UITapGestureRecognizer && otherGestureRecognizer.numberOfTapsRequired === 2) {
			return true;
		}

		return false;
	}
}
const recognizerDelegateInstance: UIGestureRecognizerDelegateImpl = <UIGestureRecognizerDelegateImpl>UIGestureRecognizerDelegateImpl.new();

@NativeClass
class UIGestureRecognizerImpl extends NSObject {
	public static ObjCExposedMethods = {
		recognize: {
			returns: interop.types.void,
			params: [UIGestureRecognizer],
		},
	};

	private _owner: WeakRef<GesturesObserver>;
	private _type: any;
	private _callback: Function;
	private _context: any;

	public static initWithOwnerTypeCallback(owner: WeakRef<GesturesObserver>, type: any, callback?: Function, thisArg?: any): UIGestureRecognizerImpl {
		const handler = <UIGestureRecognizerImpl>UIGestureRecognizerImpl.new();
		handler._owner = owner;
		handler._type = type;

		if (callback) {
			handler._callback = callback;
		}

		if (thisArg) {
			handler._context = thisArg;
		}

		return handler;
	}

	public recognize(recognizer: UIGestureRecognizer): void {
		const owner = this._owner?.deref();
		const callback = this._callback ? this._callback : owner ? owner.callback : null;
		const typeParam = this._type;
		const target = owner ? owner.target : undefined;

		const args = {
			type: typeParam,
			view: target,
			ios: recognizer,
			android: undefined,
			object: target,
			eventName: toString(typeParam),
		};

		if (callback) {
			callback.call(this._context, args);
		}
	}
}

export class GesturesObserver extends GesturesObserverBase {
	private readonly _recognizers: { [type: string]: RecognizerCache } = {};

	private _onTargetLoaded: (data: EventData) => void;
	private _onTargetUnloaded: (data: EventData) => void;

	public androidOnTouchEvent(motionEvent: android.view.MotionEvent): void {
		//
	}

	/**
	 * Observes a singular GestureTypes value (e.g. GestureTypes.tap).
	 *
	 * Does not support observing plural GestureTypes values, e.g.
	 * GestureTypes.tap & GestureTypes.doubleTap.
	 */
	public observe(type: GestureTypes) {
		this.type = type;

		if (!this.target) {
			return;
		}

		this._onTargetLoaded = () => {
			this._attach(this.target, type);
		};
		this._onTargetUnloaded = () => {
			this._detach();
		};

		this.target.on('loaded', this._onTargetLoaded);
		this.target.on('unloaded', this._onTargetUnloaded);

		if (this.target.isLoaded) {
			this._attach(this.target, type);
		}
	}

	/**
	 * Given a singular GestureTypes value (e.g. GestureTypes.tap), adds a
	 * UIGestureRecognizer for it and populates a RecognizerCache entry in
	 * this._recognizers.
	 *
	 * Does not support attaching plural GestureTypes values, e.g.
	 * GestureTypes.tap & GestureTypes.doubleTap.
	 */
	private _attach(target: View, type: GestureTypes) {
		this._detach();

		const nativeView = target?.nativeViewProtected as UIView | undefined;
		if (!nativeView?.addGestureRecognizer) {
			return;
		}

		switch (type) {
			case GestureTypes.tap: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.tap, (args) => {
						if (args.view) {
							this._executeCallback(_getTapData(args));
						}
					}),
				);
				break;
			}

			case GestureTypes.doubleTap: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.doubleTap, (args) => {
						if (args.view) {
							this._executeCallback(_getTapData(args));
						}
					}),
				);
				break;
			}

			case GestureTypes.pinch: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.pinch, (args) => {
						if (args.view) {
							this._executeCallback(_getPinchData(args));
						}
					}),
				);
				break;
			}

			case GestureTypes.pan: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.pan, (args) => {
						if (args.view) {
							this._executeCallback(_getPanData(args, target.nativeViewProtected));
						}
					}),
				);
				break;
			}

			case GestureTypes.swipe: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(
						GestureTypes.swipe,
						(args) => {
							if (args.view) {
								this._executeCallback(_getSwipeData(args));
							}
						},
						UISwipeGestureRecognizerDirection.Down,
					),
				);

				nativeView.addGestureRecognizer(
					this._createRecognizer(
						GestureTypes.swipe,
						(args) => {
							if (args.view) {
								this._executeCallback(_getSwipeData(args));
							}
						},
						UISwipeGestureRecognizerDirection.Left,
					),
				);

				nativeView.addGestureRecognizer(
					this._createRecognizer(
						GestureTypes.swipe,
						(args) => {
							if (args.view) {
								this._executeCallback(_getSwipeData(args));
							}
						},
						UISwipeGestureRecognizerDirection.Right,
					),
				);

				nativeView.addGestureRecognizer(
					this._createRecognizer(
						GestureTypes.swipe,
						(args) => {
							if (args.view) {
								this._executeCallback(_getSwipeData(args));
							}
						},
						UISwipeGestureRecognizerDirection.Up,
					),
				);
				break;
			}

			case GestureTypes.rotation: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.rotation, (args) => {
						if (args.view) {
							this._executeCallback(_getRotationData(args));
						}
					}),
				);
				break;
			}

			case GestureTypes.longPress: {
				nativeView.addGestureRecognizer(
					this._createRecognizer(GestureTypes.longPress, (args) => {
						if (args.view) {
							this._executeCallback(_getLongPressData(args));
						}
					}),
				);
				break;
			}

			case GestureTypes.touch: {
				nativeView.addGestureRecognizer(this._createRecognizer(GestureTypes.touch));
				break;
			}
		}
	}

	private _detach() {
		for (const type in this._recognizers) {
			const item = this._recognizers[type];
			this.target?.nativeViewProtected?.removeGestureRecognizer(item.recognizer);

			item.recognizer = null;
			item.target = null;
			delete this._recognizers[type];
		}
	}

	public disconnect() {
		this._detach();

		if (this.target) {
			this.target.off('loaded', this._onTargetLoaded);
			this.target.off('unloaded', this._onTargetUnloaded);

			this._onTargetLoaded = null;
			this._onTargetUnloaded = null;
		}

		// clears target, context and callback references
		super.disconnect();
	}

	public _executeCallback(args: GestureEventData) {
		if (this.callback) {
			this.callback.call(this.context, args);
		}
	}

	/**
	 * Creates a UIGestureRecognizer (and populates a RecognizerCache entry in
	 * this._recognizers) corresponding to the singular GestureTypes value passed
	 * in.
	 */
	private _createRecognizer(type: GestureTypes, callback?: (args: GestureEventData) => void, swipeDirection?: UISwipeGestureRecognizerDirection): UIGestureRecognizer | undefined {
		let recognizer: UIGestureRecognizer | undefined;
		let typeString = toString(type);
		const target = _createUIGestureRecognizerTarget(this, type, callback, this.context);
		const recognizerType = _getUIGestureRecognizerType(type);

		if (recognizerType) {
			recognizer = recognizerType.alloc().initWithTargetAction(target, 'recognize');

			if (type === GestureTypes.swipe && swipeDirection) {
				// e.g. "swipe1"
				typeString += swipeDirection.toString();
				(<UISwipeGestureRecognizer>recognizer).direction = swipeDirection;
			} else if (type === GestureTypes.touch) {
				(<TouchGestureRecognizer>recognizer).observer = this;
			} else if (type === GestureTypes.doubleTap) {
				(<UITapGestureRecognizer>recognizer).numberOfTapsRequired = 2;
			}

			if (recognizer) {
				recognizer.delegate = recognizerDelegateInstance;
				this._recognizers[typeString] = {
					recognizer,
					target,
				};
			}

			this.target.notify({
				eventName: GestureEvents.gestureAttached,
				object: this.target,
				type: type,
				view: this.target,
				ios: recognizer,
			});
		}

		return recognizer;
	}
}

function _createUIGestureRecognizerTarget(owner: GesturesObserver, type: GestureTypes, callback?: (args: GestureEventData) => void, context?: any): any {
	return UIGestureRecognizerImpl.initWithOwnerTypeCallback(new WeakRef(owner), type, callback, context);
}

interface RecognizerCache {
	recognizer: UIGestureRecognizer;
	target: any;
}

function _getUIGestureRecognizerType(type: GestureTypes): typeof UIGestureRecognizer | null {
	switch (type) {
		case GestureTypes.tap:
			return UITapGestureRecognizer;
		case GestureTypes.doubleTap:
			return UITapGestureRecognizer;
		case GestureTypes.pinch:
			return UIPinchGestureRecognizer;
		case GestureTypes.pan:
			return UIPanGestureRecognizer;
		case GestureTypes.swipe:
			return UISwipeGestureRecognizer;
		case GestureTypes.rotation:
			return UIRotationGestureRecognizer;
		case GestureTypes.longPress:
			return UILongPressGestureRecognizer;
		case GestureTypes.touch:
			return TouchGestureRecognizer;
		default:
			return null;
	}
}

function getState(recognizer: UIGestureRecognizer) {
	if (recognizer.state === UIGestureRecognizerState.Began) {
		return GestureStateTypes.began;
	} else if (recognizer.state === UIGestureRecognizerState.Cancelled || recognizer.state === UIGestureRecognizerState.Failed) {
		return GestureStateTypes.cancelled;
	} else if (recognizer.state === UIGestureRecognizerState.Changed) {
		return GestureStateTypes.changed;
	} else if (recognizer.state === UIGestureRecognizerState.Ended) {
		return GestureStateTypes.ended;
	}
}

function _getSwipeDirection(direction: UISwipeGestureRecognizerDirection): SwipeDirection {
	if (direction === UISwipeGestureRecognizerDirection.Down) {
		return SwipeDirection.down;
	} else if (direction === UISwipeGestureRecognizerDirection.Left) {
		return SwipeDirection.left;
	} else if (direction === UISwipeGestureRecognizerDirection.Right) {
		return SwipeDirection.right;
	} else if (direction === UISwipeGestureRecognizerDirection.Up) {
		return SwipeDirection.up;
	}
}

function _getTapData(args: GestureEventData): TapGestureEventData {
	const recognizer = <UITapGestureRecognizer>args.ios;
	const center = recognizer.locationInView(args.view.nativeViewProtected);

	return <TapGestureEventData>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		eventName: args.eventName,
		object: args.object,
		getPointerCount: () => recognizer.numberOfTouches,
		getX: () => center.x,
		getY: () => center.y,
	};
}

function _getPinchData(args: GestureEventData): PinchGestureEventData {
	const recognizer = <UIPinchGestureRecognizer>args.ios;
	const center = recognizer.locationInView(args.view.nativeViewProtected);

	return <PinchGestureEventData>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		scale: recognizer.scale,
		getFocusX: () => center.x,
		getFocusY: () => center.y,
		object: args.view,
		eventName: toString(args.type),
		state: getState(recognizer),
	};
}

function _getSwipeData(args: GestureEventData): SwipeGestureEventData {
	const recognizer = <UISwipeGestureRecognizer>args.ios;

	return <SwipeGestureEventData>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		direction: _getSwipeDirection(recognizer.direction),
		object: args.view,
		eventName: toString(args.type),
	};
}

function _getPanData(args: GestureEventData, view: UIView): PanGestureEventData {
	const recognizer = <UIPanGestureRecognizer>args.ios;

	return <PanGestureEventData>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		deltaX: recognizer.translationInView(view).x,
		deltaY: recognizer.translationInView(view).y,
		object: args.view,
		eventName: toString(args.type),
		state: getState(recognizer),
	};
}

function _getRotationData(args: GestureEventData): RotationGestureEventData {
	const recognizer = <UIRotationGestureRecognizer>args.ios;

	return <RotationGestureEventData>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		rotation: recognizer.rotation * (180.0 / Math.PI),
		object: args.view,
		eventName: toString(args.type),
		state: getState(recognizer),
	};
}

function _getLongPressData(args: GestureEventData): GestureEventDataWithState {
	const recognizer = <UILongPressGestureRecognizer>args.ios;

	return <GestureEventDataWithState>{
		type: args.type,
		view: args.view,
		ios: args.ios,
		android: undefined,
		object: args.view,
		eventName: toString(args.type),
		state: getState(recognizer),
	};
}

@NativeClass
class TouchGestureRecognizer extends UIGestureRecognizer {
	public observer: GesturesObserver;
	private _eventData: TouchGestureEventData;

	touchesBeganWithEvent(touches: NSSet<any>, event: any): void {
		this.executeCallback(TouchAction.down, touches, event);
		if (this.view) {
			this.view.touchesBeganWithEvent(touches, event);
		}
	}

	touchesMovedWithEvent(touches: NSSet<any>, event: any): void {
		this.executeCallback(TouchAction.move, touches, event);
		if (this.view) {
			this.view.touchesMovedWithEvent(touches, event);
		}
	}

	touchesEndedWithEvent(touches: NSSet<any>, event: any): void {
		this.executeCallback(TouchAction.up, touches, event);
		if (this.view) {
			this.view.touchesEndedWithEvent(touches, event);
		}
	}

	touchesCancelledWithEvent(touches: NSSet<any>, event: any): void {
		this.executeCallback(TouchAction.cancel, touches, event);
		if (this.view) {
			this.view.touchesCancelledWithEvent(touches, event);
		}
	}

	private executeCallback(action: string, touches: NSSet<any>, event: any): void {
		if (!this._eventData) {
			this._eventData = new TouchGestureEventData();
		}

		this._eventData.prepare(this.observer.target, action, touches, event);
		this.observer._executeCallback(this._eventData);
	}
}

class Pointer implements Pointer {
	public android: any = undefined;
	public ios: UITouch = undefined;

	private _view: View;

	private _location: CGPoint;

	private get location(): CGPoint {
		if (!this._location) {
			this._location = this.ios.locationInView(this._view.nativeViewProtected);
		}

		return this._location;
	}

	constructor(touch: UITouch, targetView: View) {
		this.ios = touch;
		this._view = targetView;
	}

	getX(): number {
		return this.location.x;
	}

	getY(): number {
		return this.location.y;
	}
}

class TouchGestureEventData implements TouchGestureEventData {
	eventName: string = toString(GestureTypes.touch);
	type: GestureTypes = GestureTypes.touch;
	android: any = undefined;
	action: string;
	view: View;
	ios: { touches: NSSet<any>; event: _UIEvent };
	object: any;

	private _activePointers: Array<Pointer>;
	private _allPointers: Array<Pointer>;
	private _mainPointer: UITouch;

	public prepare(view: View, action: string, touches: NSSet<any>, event: _UIEvent) {
		this.action = action;
		this.view = view;
		this.object = view;
		this.ios = {
			touches: touches,
			event: event,
		};

		this._mainPointer = undefined;
		this._activePointers = undefined;
		this._allPointers = undefined;
	}

	getPointerCount(): number {
		return this.ios.event.allTouches.count;
	}

	private getMainPointer(): UITouch {
		if (this._mainPointer === undefined) {
			this._mainPointer = this.ios.touches.anyObject();
		}

		return this._mainPointer;
	}

	getActivePointers(): Array<Pointer> {
		if (!this._activePointers) {
			this._activePointers = [];

			for (let i = 0, nsArr = this.ios.touches.allObjects; i < nsArr.count; i++) {
				this._activePointers.push(new Pointer(nsArr.objectAtIndex(i), this.view));
			}
		}

		return this._activePointers;
	}

	getAllPointers(): Array<Pointer> {
		if (!this._allPointers) {
			this._allPointers = [];

			const nsArr = this.ios.event.allTouches.allObjects;
			for (let i = 0; i < nsArr.count; i++) {
				this._allPointers.push(new Pointer(nsArr.objectAtIndex(i), this.view));
			}
		}

		return this._allPointers;
	}

	getX(): number {
		const offset = this.view.nativeViewProtected.contentOffset;
		const offsetX = offset ? offset.x : 0;
		return this.getMainPointer().locationInView(this.view.nativeViewProtected).x - offsetX;
	}

	getY(): number {
		const offset = this.view.nativeViewProtected.contentOffset;
		const offsetY = offset ? offset.y : 0;
		return this.getMainPointer().locationInView(this.view.nativeViewProtected).y - offsetY;
	}
}
