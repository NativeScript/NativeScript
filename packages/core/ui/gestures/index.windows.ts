export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

import { GesturesObserverBase, GestureTypes, GestureEvents, GestureStateTypes, toString } from './gestures-common';
import type { View } from '../core/view';
import { layout } from '../../utils/layout-helper';
import * as timer from '../../timer';

const DOUBLE_TAP_TIMEOUT = 300;
const LONG_PRESS_TIMEOUT = 500;
const TAP_SLOP = 20; // pixels

function _executeCallback(observer: GesturesObserver, args: any) {
	if (observer && observer.callback) {
		observer.callback.call(observer.context, args);
	}
}

class WindowsPointer {
	public id: number;
	private event: any;
	constructor(id: number, event: any) {
		this.id = id;
		this.event = event;
	}
	getX(): number {
		try {
			const p = extractPoint(this.event);
			return layout.toDeviceIndependentPixels(p.x || 0);
		} catch (_e) {
			return 0;
		}
	}
	getY(): number {
		try {
			const p = extractPoint(this.event);
			return layout.toDeviceIndependentPixels(p.y || 0);
		} catch (_e) {
			return 0;
		}
	}
}

function extractPoint(e: any, relativeTo?: any) {
	try {
		if (e.getCurrentPoint) {
			const pt = e.getCurrentPoint(relativeTo || null);
			// PointerPoint may expose Position or position
			const pos = pt.Position || pt.position || pt; // fallback
			return { x: pos.X ?? pos.x ?? (pos.Position && pos.Position.X) ?? 0, y: pos.Y ?? pos.y ?? (pos.Position && pos.Position.Y) ?? 0 };
		}
	} catch (_e) {}

	try {
		// some runtimes expose currentPoint
		const cp = e.currentPoint || e.CurrentPoint;
		if (cp) {
			const pos = cp.Position || cp.position || cp;
			return { x: pos.X ?? pos.x ?? 0, y: pos.Y ?? pos.y ?? 0 };
		}
	} catch (_e) {}

	try {
		if (e.clientX !== undefined && e.clientY !== undefined) {
			return { x: e.clientX, y: e.clientY };
		}
	} catch (_e) {}

	return { x: 0, y: 0 };
}

export class GesturesObserver extends GesturesObserverBase {
	private _onTargetLoaded: () => void;
	private _onTargetUnloaded: () => void;

	private _pointerPressedHandler: any;
	private _pointerMovedHandler: any;
	private _pointerReleasedHandler: any;
	private _pointerCanceledHandler: any;

	private _pointerDownMap: Map<number, { x: number; y: number; t: number }> = new Map();
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
			this.target.off('loaded', this._onTargetLoaded);
			this.target.off('unloaded', this._onTargetUnloaded);

			this._onTargetLoaded = null;
			this._onTargetUnloaded = null;
		}

		super.disconnect();
	}

	private _detach() {
		try {
			const native = (this.target && (this.target as any).nativeViewProtected) as any;
			if (native) {
				try { if (native.removeEventListener) native.removeEventListener('pointerpressed', this._pointerPressedHandler); } catch (_e) {}
				try { if (native.removeEventListener) native.removeEventListener('pointermoved', this._pointerMovedHandler); } catch (_e) {}
				try { if (native.removeEventListener) native.removeEventListener('pointerreleased', this._pointerReleasedHandler); } catch (_e) {}
			}
		} catch (_e) {}

		this._pointerPressedHandler = null;
		this._pointerMovedHandler = null;
		this._pointerReleasedHandler = null;
		this._pointerCanceledHandler = null;
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

		try {
			if (native.addEventListener) {
				native.addEventListener('pointerpressed', this._pointerPressedHandler);
				native.addEventListener('pointermoved', this._pointerMovedHandler);
				native.addEventListener('pointerreleased', this._pointerReleasedHandler);
			} else {
				try { native.PointerPressed = this._pointerPressedHandler as any; } catch (_e) {}
				try { native.PointerMoved = this._pointerMovedHandler as any; } catch (_e) {}
				try { native.PointerReleased = this._pointerReleasedHandler as any; } catch (_e) {}
			}
		} catch (_e) {}

		target.notify({
			eventName: GestureEvents.gestureAttached,
			object: target,
			type: type,
			view: target,
			windows: native,
		});
	}

	// Required by GesturesObserverDefinition (Android compatibility).
	public androidOnTouchEvent(_motionEvent: any): void {}

	private _onPointerPressed(e: any) {
		try {
			const id = (e && (e.pointerId || (e.getCurrentPoint && e.getCurrentPoint(null)?.PointerId))) || 0;
			const pt = extractPoint(e);
			this._pointerDownMap.set(id, { x: pt.x, y: pt.y, t: Date.now() });

			// schedule long press
			if (this.type === GestureTypes.longPress) {
				const timeoutId = timer.setTimeout(() => {
					const args = {
						type: GestureTypes.longPress,
						view: this.target,
						windows: e,
						ios: undefined,
						android: undefined,
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
					getActivePointers: () => [new WindowsPointer(id, e)],
					getAllPointers: () => [new WindowsPointer(id, e)],
					getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
					getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
				};

				_executeCallback(this, args);
			}
		} catch (_e) {}
	}

	private _onPointerMoved(e: any) {
		try {
			const id = (e && (e.pointerId || (e.getCurrentPoint && e.getCurrentPoint(null)?.PointerId))) || 0;
			const pt = extractPoint(e);
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
					getActivePointers: () => [new WindowsPointer(id, e)],
					getAllPointers: () => [new WindowsPointer(id, e)],
					getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
					getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
				};

				_executeCallback(this, args);
			}
		} catch (_e) {}
	}

	private _onPointerReleased(e: any) {
		try {
			const id = (e && (e.pointerId || (e.getCurrentPoint && e.getCurrentPoint(null)?.PointerId))) || 0;
			const pt = extractPoint(e);
			const start = this._pointerDownMap.get(id);
			const now = Date.now();

			// clear long press timeout
			const lp = this._longPressTimeouts.get(id);
			if (lp) {
				timer.clearTimeout(lp);
				this._longPressTimeouts.delete(id);
			}

			if (this.type === GestureTypes.touch) {
				const args: any = {
					type: GestureTypes.touch,
					view: this.target,
					ios: undefined,
					android: undefined,
					object: this.target,
					eventName: toString(GestureTypes.touch),
					action: 'up',
					getPointerCount: () => 1,
					getActivePointers: () => [new WindowsPointer(id, e)],
					getAllPointers: () => [new WindowsPointer(id, e)],
					getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
					getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
				};

				_executeCallback(this, args);
			}

			// Try detect tap / doubleTap
			if (start) {
				const dt = now - start.t;
				const dx = pt.x - start.x;
				const dy = pt.y - start.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dt < DOUBLE_TAP_TIMEOUT && dist < TAP_SLOP) {
					// Possible tap
					if (this.target.getGestureObservers && this.target.getGestureObservers(GestureTypes.doubleTap) && this.target.getGestureObservers(GestureTypes.doubleTap).length) {
						// wait for double-tap
						this._tapTimeoutId = timer.setTimeout(() => {
							const args = {
								type: GestureTypes.tap,
								view: this.target,
								ios: undefined,
								android: undefined,
								object: this.target,
								eventName: toString(GestureTypes.tap),
								getPointerCount: () => 1,
								getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
								getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
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
							getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
							getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
						};
						_executeCallback(this, args);
					}

					// Double tap detection
					if (this.target.getGestureObservers && this.target.getGestureObservers(GestureTypes.doubleTap) && this.target.getGestureObservers(GestureTypes.doubleTap).length) {
						const nowUp = Date.now();
						if (this._lastUpTime && nowUp - this._lastUpTime <= DOUBLE_TAP_TIMEOUT) {
							// emit doubleTap
							const args = {
								type: GestureTypes.doubleTap,
								view: this.target,
								ios: undefined,
								android: undefined,
								object: this.target,
								eventName: toString(GestureTypes.doubleTap),
								getPointerCount: () => 1,
								getX: () => layout.toDeviceIndependentPixels(pt.x || 0),
								getY: () => layout.toDeviceIndependentPixels(pt.y || 0),
							};
							_executeCallback(this, args);
						}
						this._lastUpTime = nowUp;
					}
				}
			}

			this._pointerDownMap.delete(id);
		} catch (_e) {}
	}
}

export function observe(target: View, type: GestureTypes, callback: (args: any) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);
	return observer;
}
