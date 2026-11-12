export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

import { GesturesObserverBase, GestureTypes, GestureStateTypes, SwipeDirection, toString } from './gestures-common';
import type { GestureEventData, TouchGestureEventData, Pointer } from './gestures-types';
import type { View } from '../core/view';
import type { EventData } from '../../data/observable';
import { connect, SignalArg } from '../../utils/gtk.linux';

export function observe(target: View, type: GestureTypes, callback: (args: GestureEventData) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);
	return observer;
}

export function isHovered(_view: View): boolean {
	return false;
}

// logical pixels a tap may move; px/s for a swipe
const TAP_SLOP = 8;
const SWIPE_VELOCITY = 400;
const LONG_PRESS_MS = 500;

function pointer(x: number, y: number): Pointer {
	return { android: undefined, ios: undefined, getX: () => x, getY: () => y, getXPixels: () => x, getXDIP: () => x, getYPixels: () => y, getYDIP: () => y };
}

/** GTK 4 gesture controllers on the target's widget, one per observed type. */
export class GesturesObserver extends GesturesObserverBase {
	private _controller: any = null;
	private _disconnect: (() => void)[] = [];
	private _onTargetLoaded: (data: EventData) => void;
	private _onTargetUnloaded: (data: EventData) => void;

	public androidOnTouchEvent(_motionEvent: any): void {}

	public observe(type: GestureTypes) {
		this.type = type;
		if (!this.target) {
			return;
		}
		this._onTargetLoaded = () => this._attach(type);
		this._onTargetUnloaded = () => this._detach();
		this.target.on('loaded', this._onTargetLoaded);
		this.target.on('unloaded', this._onTargetUnloaded);
		if (this.target.isLoaded) {
			this._attach(type);
		}
	}

	public disconnect() {
		this._detach();
		if (this.target) {
			this.target.off('loaded', this._onTargetLoaded);
			this.target.off('unloaded', this._onTargetUnloaded);
		}
		super.disconnect();
	}

	private _emit(data: Record<string, any>) {
		const target = this.target;
		if (!target || !this.callback) {
			return;
		}
		const args = { type: this.type, view: target, object: target, eventName: toString(this.type), ios: undefined, android: undefined, ...data } as GestureEventData;
		this.callback.call(this.context, args);
	}

	private _attach(type: GestureTypes) {
		this._detach();
		const widget = this.target?.nativeViewProtected;
		if (!widget) {
			return;
		}
		let controller: any;
		const on = (signal: string, handler: (...args: any[]) => any, types: SignalArg[] = []) => this._disconnect.push(connect(controller, signal, handler, { types }));
		const at = (x: number, y: number) => ({ getPointerCount: () => 1, getX: () => x, getY: () => y });

		switch (type) {
			case GestureTypes.tap:
			case GestureTypes.doubleTap: {
				controller = gtk_gesture_click_new();
				const presses = type === GestureTypes.tap ? 1 : 2;
				let down = [0, 0, 0];
				on('pressed', (_g: any, _n: number, x: number, y: number) => (down = [x, y, Date.now()]), ['int', 'double', 'double']);
				// a press that moved past the drag threshold is a drag, one held down is a long press
				on('released', (_g: any, n: number, x: number, y: number) => n === presses && Math.hypot(x - down[0], y - down[1]) < TAP_SLOP && Date.now() - down[2] < LONG_PRESS_MS && this._emit(at(x, y)), ['int', 'double', 'double']);
				break;
			}
			case GestureTypes.longPress: {
				controller = gtk_gesture_long_press_new();
				let pressed = false;
				on(
					'pressed',
					(_g: any, x: number, y: number) => {
						pressed = true;
						this._emit({ state: GestureStateTypes.began, ...at(x, y) });
					},
					['double', 'double'],
				);
				// GTK cancels every press that ends early; only report recognized ones
				on('cancelled', () => pressed && ((pressed = false), this._emit({ state: GestureStateTypes.cancelled })));
				on('end', () => pressed && ((pressed = false), this._emit({ state: GestureStateTypes.ended })), ['pointer']);
				break;
			}
			case GestureTypes.pan: {
				controller = gtk_gesture_drag_new();
				let start = [0, 0];
				let panning = false;
				const pan = (state: GestureStateTypes, dx: number, dy: number) => this._emit({ state, startX: start[0], startY: start[1], deltaX: dx, deltaY: dy });
				on('drag-begin', (_g: any, x: number, y: number) => (start = [x, y]), ['double', 'double']);
				// a pan starts once the pointer actually moved
				on(
					'drag-update',
					(_g: any, dx: number, dy: number) => {
						if (!panning) {
							if (Math.hypot(dx, dy) < TAP_SLOP) return;
							panning = true;
							pan(GestureStateTypes.began, 0, 0);
						}
						pan(GestureStateTypes.changed, dx, dy);
					},
					['double', 'double'],
				);
				on('drag-end', (_g: any, dx: number, dy: number) => panning && ((panning = false), pan(GestureStateTypes.ended, dx, dy)), ['double', 'double']);
				break;
			}
			case GestureTypes.swipe: {
				controller = gtk_gesture_swipe_new();
				on(
					'swipe',
					(_g: any, vx: number, vy: number) => {
						// GTK reports a swipe for every release, even a still one
						if (Math.hypot(vx, vy) < SWIPE_VELOCITY) return;
						const direction = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? SwipeDirection.right : SwipeDirection.left) : vy > 0 ? SwipeDirection.down : SwipeDirection.up;
						this._emit({ direction });
					},
					['double', 'double'],
				);
				break;
			}
			case GestureTypes.pinch: {
				controller = gtk_gesture_zoom_new();
				const focus = () => {
					const x = new interop.Reference(interop.types.double, 0);
					const y = new interop.Reference(interop.types.double, 0);
					gtk_gesture_get_bounding_box_center(controller, x, y);
					return { getFocusX: () => x.value, getFocusY: () => y.value };
				};
				on('begin', () => this._emit({ state: GestureStateTypes.began, scale: 1, ...focus() }), ['pointer']);
				on('scale-changed', (_g: any, scale: number) => this._emit({ state: GestureStateTypes.changed, scale, ...focus() }), ['double']);
				on('end', () => this._emit({ state: GestureStateTypes.ended, scale: gtk_gesture_zoom_get_scale_delta(controller), ...focus() }), ['pointer']);
				break;
			}
			case GestureTypes.rotation: {
				controller = gtk_gesture_rotate_new();
				const degrees = (radians: number) => (radians * 180) / Math.PI;
				on('begin', () => this._emit({ state: GestureStateTypes.began, rotation: 0 }), ['pointer']);
				on('angle-changed', (_g: any, _angle: number, delta: number) => this._emit({ state: GestureStateTypes.changed, rotation: degrees(delta) }), ['double', 'double']);
				on('end', () => this._emit({ state: GestureStateTypes.ended, rotation: degrees(gtk_gesture_rotate_get_angle_delta(controller)) }), ['pointer']);
				break;
			}
			case GestureTypes.touch: {
				controller = gtk_gesture_drag_new();
				let start = [0, 0];
				const touch = (action: TouchGestureEventData['action'], x: number, y: number) => {
					const p = pointer(x, y);
					this._emit({ action, ...at(x, y), getActivePointers: () => [p], getAllPointers: () => [p] });
				};
				on(
					'drag-begin',
					(_g: any, x: number, y: number) => {
						start = [x, y];
						touch('down', x, y);
					},
					['double', 'double'],
				);
				on('drag-update', (_g: any, dx: number, dy: number) => touch('move', start[0] + dx, start[1] + dy), ['double', 'double']);
				on('drag-end', (_g: any, dx: number, dy: number) => touch('up', start[0] + dx, start[1] + dy), ['double', 'double']);
				on('cancel', () => touch('cancel', start[0], start[1]), ['pointer']);
				break;
			}
			default:
				return;
		}
		gtk_widget_add_controller(widget, controller);
		this._controller = controller;
	}

	private _detach() {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		const widget = this.target?.nativeViewProtected;
		if (this._controller && widget) {
			gtk_widget_remove_controller(widget, this._controller);
		}
		this._controller = null;
	}
}
