export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

import { GesturesObserverBase, GestureTypes, GestureEvents, GestureStateTypes, toString } from './gestures-common';
import type { View } from '../core/view';
import * as timer from '../../timer';

// Per-view hover tracking to enable CSS :hover pseudo-class.
const _hoverViews = new WeakSet<View>();

function _attachHoverHandlers(view: View): void {
	const native = (view as any).nativeViewProtected as any;
	if (!native || native.__ns_hover_attached) return;

	const onEnter = () => {
		if (_hoverViews.has(view)) return;
		_hoverViews.add(view);
		try { (view as any)._addVisualState?.('hover'); } catch (_e) { }
		try { (view as any).notify?.({ eventName: 'mouseEnter', object: view }); } catch (_e) { }
	};
	const onLeave = () => {
		if (!_hoverViews.has(view)) return;
		_hoverViews.delete(view);
		try { (view as any)._removeVisualState?.('hover'); } catch (_e) { }
		try { (view as any).notify?.({ eventName: 'mouseLeave', object: view }); } catch (_e) { }
	};

	const enterDelegate = _wrapPointerHandler(onEnter);
	const leaveDelegate = _wrapPointerHandler(onLeave);

	let usingAddHandler = false;
	try {
		const UIElement = Microsoft.UI.Xaml.UIElement;
		const pee = UIElement?.PointerEnteredEvent ?? native.PointerEnteredEvent;
		const pxe = UIElement?.PointerExitedEvent ?? native.PointerExitedEvent;
		if (!pee || !pxe) throw new Error('RoutedEvent statics unavailable');
		native.AddHandler(pee, enterDelegate, true);
		native.AddHandler(pxe, leaveDelegate, true);
		usingAddHandler = true;
	} catch (_e) {
		try {
			_assignPointerHandler(native, 'PointerEntered', enterDelegate);
			_assignPointerHandler(native, 'PointerExited', leaveDelegate);
		} catch (_e2) { }
	}

	native.__ns_hover_attached = true;
	native.__ns_hover_using_add_handler = usingAddHandler;
	native.__ns_hover_enter_fn = onEnter;
	native.__ns_hover_leave_fn = onLeave;
	native.__ns_hover_enter_delegate = enterDelegate;
	native.__ns_hover_leave_delegate = leaveDelegate;
}

function _detachHoverHandlers(view: View): void {
	const native = (view as any).nativeViewProtected as any;
	if (!native || !native.__ns_hover_attached) return;

	if (native.__ns_hover_using_add_handler) {
		try {
			if (native.__ns_hover_enter_delegate) native.RemoveHandler(native.PointerEnteredEvent, native.__ns_hover_enter_delegate);
			if (native.__ns_hover_leave_delegate) native.RemoveHandler(native.PointerExitedEvent, native.__ns_hover_leave_delegate);
		} catch (_e) { }
	}

	native.__ns_hover_attached = false;
	native.__ns_hover_using_add_handler = false;
	native.__ns_hover_enter_fn = null;
	native.__ns_hover_leave_fn = null;
	native.__ns_hover_enter_delegate = null;
	native.__ns_hover_leave_delegate = null;
	_hoverViews.delete(view);
}

/** Returns true if the view is currently in a hover state (mouse over). */
export function isHovered(view: View): boolean {
	return _hoverViews.has(view);
}

const DOUBLE_TAP_TIMEOUT = 300;
const LONG_PRESS_TIMEOUT = 500;
const TAP_SLOP = 20; // pixels

function _wrapPointerHandler(fn: (s: any, e: any) => void): any {
	return NSWinRT.asDelegate('Microsoft.UI.Xaml.Input.PointerEventHandler', fn);
}

function _wrapRightTappedHandler(fn: (s: any, e: any) => void): any {
	return NSWinRT.asDelegate('Microsoft.UI.Xaml.Input.RightTappedEventHandler', fn);
}

function _assignPointerHandler(native: any, prop: string, del: any): void {
	native[prop] = del as never;
}

function _assignRightTappedHandler(native: any, del: any): void {
	native.RightTapped = del as never;
}

function _executeCallback(observer: GesturesObserver, args: any) {
	if (observer && observer.callback) {
		observer.callback.call(observer.context, args);
	}
}

class WindowsPointer {
	public id: number;
	private event: any;
	private relativeTo: any;
	constructor(id: number, event: any, relativeTo?: any) {
		this.id = id;
		this.event = event;
		this.relativeTo = relativeTo;
	}
	getX(): number {
		return extractPoint(this.event, this.relativeTo).x;
	}
	getY(): number {
		return extractPoint(this.event, this.relativeTo).y;
	}
}

// PointerRoutedEventArgs.GetCurrentPoint(relativeTo) → PointerPoint whose .Position (a Point in DIPs)
// is relative to `relativeTo` (the native view), matching iOS/Android view-relative getX/getY.
function extractPoint(e: any, relativeTo?: any): { x: number; y: number } {
	try {
		if (e?.GetCurrentPoint) {
			const pt = e.GetCurrentPoint(relativeTo ?? null);
			const pos = pt?.Position ?? pt?.position;
			const x = pos?.X ?? pos?.x;
			const y = pos?.Y ?? pos?.y;
			if (typeof x === 'number' && typeof y === 'number') {
				return { x, y };
			}
		}
	} catch (_e) { }

	return { x: 0, y: 0 };
}

// PointerRoutedEventArgs.Pointer.PointerId identifies the contact across down/move/up.
function extractPointerId(e: any): number {
	try {
		const pointer = e?.Pointer;
		const id = pointer?.PointerId ?? pointer?.pointerId;
		if (typeof id === 'number') {
			return id;
		}
	} catch (_e) { }
	return 0;
}

export class GesturesObserver extends GesturesObserverBase {
	private _onTargetLoaded: (() => void) | null = null;
	private _onTargetUnloaded: (() => void) | null = null;

	private _pointerPressedHandler: any;
	private _pointerMovedHandler: any;
	private _pointerReleasedHandler: any;
	private _pointerCanceledHandler: any;
	private _rightTappedHandler: any;

	private _pointerPressedDelegate: any;
	private _pointerMovedDelegate: any;
	private _pointerReleasedDelegate: any;
	private _rightTappedDelegate: any;
	private _usingAddHandler = false;

	private _pointerDownMap: Map<number, { x: number; y: number; t: number; nativeTs: number | null }> = new Map();
	private _lastUpTime = 0;
	private _tapTimeoutId: any;
	private _longPressTimeouts: Map<number, any> = new Map();

	public observe(type: GestureTypes) {
		this.type = type;

		if (!this.target) {
			return;
		}

		this._onTargetLoaded = () => this._attach(this.target, type);
		this._onTargetUnloaded = () => this._detach();

		this.target.on('loaded', this._onTargetLoaded);
		this.target.on('unloaded', this._onTargetUnloaded);

		if (this.target.isLoaded) {
			this._attach(this.target, type);
		}
	}

	public disconnect() {
		this._detach();

		if (this.target) {
			if (this._onTargetLoaded) {
				this.target.off('loaded', this._onTargetLoaded);
			}
			if (this._onTargetUnloaded) {
				this.target.off('unloaded', this._onTargetUnloaded);
			}

			this._onTargetLoaded = null;
			this._onTargetUnloaded = null;
		}

		super.disconnect();
	}

	private _detach() {
		try {
			const native = (this.target && (this.target as any).nativeViewProtected) as any;
			if (native) {
				if (this._usingAddHandler) {
					try {
						if (this._pointerPressedDelegate) native.RemoveHandler(native.PointerPressedEvent, this._pointerPressedDelegate);
						if (this._pointerMovedDelegate) native.RemoveHandler(native.PointerMovedEvent, this._pointerMovedDelegate);
						if (this._pointerReleasedDelegate) native.RemoveHandler(native.PointerReleasedEvent, this._pointerReleasedDelegate);
						if (this._rightTappedDelegate) native.RemoveHandler(native.RightTappedEvent, this._rightTappedDelegate);
					} catch (_e) { }
				} else {
					native.PointerPressed = null as never;
					native.PointerMoved = null as never;
					native.PointerReleased = null as never;
					native.RightTapped = null as never;
				}
			}
		} catch (_e) { }

		if (this.target) {
			_detachHoverHandlers(this.target);
		}

		this._pointerPressedHandler = null;
		this._pointerMovedHandler = null;
		this._pointerReleasedHandler = null;
		this._pointerCanceledHandler = null;
		this._rightTappedHandler = null;
		this._pointerPressedDelegate = null;
		this._pointerMovedDelegate = null;
		this._pointerReleasedDelegate = null;
		this._rightTappedDelegate = null;
		this._usingAddHandler = false;
		this._pointerDownMap.clear();
		this._longPressTimeouts.forEach((id) => timer.clearTimeout(id));
		this._longPressTimeouts.clear();
		if (this._tapTimeoutId) {
			timer.clearTimeout(this._tapTimeoutId);
			this._tapTimeoutId = null;
		}
	}

	private _attach(target: View, type: GestureTypes) {
		this._detach();

		const native = (target as any).nativeViewProtected as any;
		if (!native) {
			return;
		}

		this._pointerPressedHandler = (s: any, e: any) => this._onPointerPressed(e || s);
		this._pointerMovedHandler = (s: any, e: any) => this._onPointerMoved(e || s);
		this._pointerReleasedHandler = (s: any, e: any) => this._onPointerReleased(e || s);

		this._pointerPressedDelegate = _wrapPointerHandler(this._pointerPressedHandler);
		this._pointerMovedDelegate = _wrapPointerHandler(this._pointerMovedHandler);
		this._pointerReleasedDelegate = _wrapPointerHandler(this._pointerReleasedHandler);

		// Use AddHandler with handledEventsToo=true so events fire even when Button (and other
		// controls) mark pointer events as handled internally.
		this._usingAddHandler = false;
		try {
			const UIElement = Microsoft.UI.Xaml.UIElement;
			const ppe = UIElement?.PointerPressedEvent ?? native.PointerPressedEvent;
			const pme = UIElement?.PointerMovedEvent ?? native.PointerMovedEvent;
			const pre = UIElement?.PointerReleasedEvent ?? native.PointerReleasedEvent;
			if (!ppe || !pme || !pre) throw new Error('RoutedEvent statics unavailable');
			native.AddHandler(ppe, this._pointerPressedDelegate, true);
			native.AddHandler(pme, this._pointerMovedDelegate, true);
			native.AddHandler(pre, this._pointerReleasedDelegate, true);
			this._usingAddHandler = true;
		} catch (_e) {
			// Fallback: plain property assignment (only one handler per event, can be overwritten).
			_assignPointerHandler(native, 'PointerPressed', this._pointerPressedDelegate);
			_assignPointerHandler(native, 'PointerMoved', this._pointerMovedDelegate);
			_assignPointerHandler(native, 'PointerReleased', this._pointerReleasedDelegate);
		}

		// RightTapped (mouse right-click) fires longPress for mouse/touchpad users.
		if (type === GestureTypes.longPress) {
			this._rightTappedHandler = (s: any, e: any) => this._onRightTapped(e || s);
			this._rightTappedDelegate = _wrapRightTappedHandler(this._rightTappedHandler);
			try {
				if (this._usingAddHandler) {
					const rte = native.RightTappedEvent;
					if (!rte) throw new Error('RightTappedEvent unavailable');
					native.AddHandler(rte, this._rightTappedDelegate, true);
				} else {
					_assignRightTappedHandler(native, this._rightTappedDelegate);
				}
			} catch (_e) { }
		}

		// Always attach hover handlers for CSS :hover and mouseEnter/mouseLeave events.
		_attachHoverHandlers(target);

		target.notify({
			eventName: GestureEvents.gestureAttached,
			object: target,
			type: type,
			view: target,
			windows: native,
		});
	}

	public androidOnTouchEvent(_motionEvent: any): void { }

	private _onPointerPressed(e: any) {
		try {
			const relativeTo = (this.target as any)?.nativeViewProtected ?? null;
			const id = extractPointerId(e);
			const pt = extractPoint(e, relativeTo);
			// Capture WinRT hardware timestamp (µs since device boot) alongside JS time.
			// If V8 is busy when PointerReleased arrives, Date.now() will be inflated by the
			// scheduling delay — the WinRT timestamp is immune to this and gives the real gesture duration.
			const nativeTs: number | null = typeof e?.Timestamp === 'number' ? e.Timestamp : null;
			this._pointerDownMap.set(id, { x: pt.x, y: pt.y, t: Date.now(), nativeTs });

			if (this.type === GestureTypes.longPress) {
				const timeoutId = timer.setTimeout(() => {
					const args = {
						type: GestureTypes.longPress,
						view: this.target,
						windows: e,
						object: this.target,
						eventName: toString(GestureTypes.longPress),
						state: GestureStateTypes.began,
					};
					_executeCallback(this, args);
				}, LONG_PRESS_TIMEOUT);
				this._longPressTimeouts.set(id, timeoutId);
			}

			if (this.type === GestureTypes.touch) {
				const args: any = {
					type: GestureTypes.touch,
					view: this.target,
					ios: undefined,
					android: undefined,
					object: this.target,
					eventName: toString(GestureTypes.touch),
					action: 'down',
					getPointerCount: () => 1,
					getActivePointers: () => [new WindowsPointer(id, e, relativeTo)],
					getAllPointers: () => [new WindowsPointer(id, e, relativeTo)],
					getX: () => pt.x,
					getY: () => pt.y,
				};

				_executeCallback(this, args);
			}
		} catch (_e) { }
	}

	private _onPointerMoved(e: any) {
		try {
			const relativeTo = (this.target as any)?.nativeViewProtected ?? null;
			const id = extractPointerId(e);
			const pt = extractPoint(e, relativeTo);
			if (this.type === GestureTypes.touch) {
				const args: any = {
					type: GestureTypes.touch,
					view: this.target,
					ios: undefined,
					android: undefined,
					object: this.target,
					eventName: toString(GestureTypes.touch),
					action: 'move',
					getPointerCount: () => 1,
					getActivePointers: () => [new WindowsPointer(id, e, relativeTo)],
					getAllPointers: () => [new WindowsPointer(id, e, relativeTo)],
					getX: () => pt.x,
					getY: () => pt.y,
				};

				_executeCallback(this, args);
			}
		} catch (_e) { }
	}

	private _onPointerReleased(e: any) {
		try {
			const relativeTo = (this.target as any)?.nativeViewProtected ?? null;
			const id = extractPointerId(e);
			const pt = extractPoint(e, relativeTo);
			const start = this._pointerDownMap.get(id);
			const now = Date.now();
			// Use WinRT hardware timestamps when available so the tap-duration check reflects the actual
			// gesture time, not V8 scheduling latency. When JS is busy (e.g. processing a navigation),
			// Date.now() at release can be 300ms+ later than the real release time, causing valid fast
			// taps to be silently dropped by the dt < DOUBLE_TAP_TIMEOUT guard below.
			const upNativeTs: number | null = typeof e?.Timestamp === 'number' ? e.Timestamp : null;
			const dt = (upNativeTs !== null && start?.nativeTs !== null && start?.nativeTs !== undefined)
				? (upNativeTs - start.nativeTs) / 1000 // µs → ms, V8-latency-free
				: now - (start?.t ?? now);

			const lp = this._longPressTimeouts.get(id);
			if (lp) {
				timer.clearTimeout(lp);
				this._longPressTimeouts.delete(id);
			}

			if (this.type === GestureTypes.touch) {
				const args: any = {
					type: GestureTypes.touch,
					view: this.target,
					windows: e,
					object: this.target,
					eventName: toString(GestureTypes.touch),
					action: 'up',
					getPointerCount: () => 1,
					getActivePointers: () => [new WindowsPointer(id, e, relativeTo)],
					getAllPointers: () => [new WindowsPointer(id, e, relativeTo)],
					getX: () => pt.x,
					getY: () => pt.y,
				};

				_executeCallback(this, args);
			}

			if (start) {
				const dx = pt.x - start.x;
				const dy = pt.y - start.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dt < DOUBLE_TAP_TIMEOUT && dist < TAP_SLOP) {
						if (this.target.getGestureObservers && this.target.getGestureObservers(GestureTypes.doubleTap) && this.target.getGestureObservers(GestureTypes.doubleTap).length) {
							this._tapTimeoutId = timer.setTimeout(() => {
							const args = {
								type: GestureTypes.tap,
								view: this.target,
								windows: e,
								object: this.target,
								eventName: toString(GestureTypes.tap),
								getPointerCount: () => 1,
								getX: () => pt.x ?? 0,
								getY: () => pt.y ?? 0,
							};
							_executeCallback(this, args);
						}, DOUBLE_TAP_TIMEOUT);
					} else {
						const args = {
							type: GestureTypes.tap,
							view: this.target,
							ios: undefined,
							android: undefined,
							object: this.target,
							eventName: toString(GestureTypes.tap),
							getPointerCount: () => 1,
							getX: () => pt.x ?? 0,
							getY: () => pt.y ?? 0,
						};
						_executeCallback(this, args);
					}

						if (this.target.getGestureObservers && this.target.getGestureObservers(GestureTypes.doubleTap) && this.target.getGestureObservers(GestureTypes.doubleTap).length) {
						const nowUp = Date.now();
						if (this._lastUpTime && nowUp - this._lastUpTime <= DOUBLE_TAP_TIMEOUT) {
								const args = {
								type: GestureTypes.doubleTap,
								view: this.target,
								windows: e,
								object: this.target,
								eventName: toString(GestureTypes.doubleTap),
								getPointerCount: () => 1,
								getX: () => pt.x ?? 0,
								getY: () => pt.y ?? 0,
							};
							_executeCallback(this, args);
						}
						this._lastUpTime = nowUp;
					}
				}
			}

			this._pointerDownMap.delete(id);
		} catch (_e) { }
	}

	private _onRightTapped(e: any) {
		try {
			const relativeTo = (this.target as any)?.nativeViewProtected ?? null;
			const pt = extractPoint(e, relativeTo);
			const args: any = {
				type: GestureTypes.longPress,
				view: this.target,
				windows: e,
				object: this.target,
				eventName: toString(GestureTypes.longPress),
				state: GestureStateTypes.ended,
				getX: () => pt.x,
				getY: () => pt.y,
			};
			_executeCallback(this, args);
		} catch (_e) { }
	}
}

export function observe(target: View, type: GestureTypes, callback: (args: any) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);
	return observer;
}
