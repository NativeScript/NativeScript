import { Application, EventData, Utils, View, isUserInteractionEnabledProperty } from '@nativescript/core';

/**
 * @nativescript/canvas in a compiled Android app: the plugin's view over its NSCCanvas and its contexts over
 * the kit's CanvasModule binding (kotlin/CanvasModule.kt), which script reaches untyped as it reaches the
 * plugin's own engine module. Contexts and GPU objects are the binding's host objects.
 */
export type CanvasRenderingContext2D = any;
export type GPUCanvasContext = any;
export type GPUDevice = any;
export type GPUBuffer = any;
export type GPUBindGroup = any;
export type GPURenderPipeline = any;

const module = (): any => (global as any).CanvasModule;
const TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

interface TouchPoint {
	identifier: number;
	clientX: number;
	clientY: number;
}

export class Canvas extends View {
	static useSurface = false;
	private _canvas: org.nativescript.canvas.NSCCanvas;
	private _context2d: any = null;
	private _gpuContext: any = null;
	private _ready = false;
	private _touchListeners = new Map<string, ((data: EventData) => void)[]>();
	private _down = new Map<number, TouchPoint>();

	constructor() {
		super();
		const activity = (Application.android.foregroundActivity || Application.android.startActivity || Utils.android.getApplicationContext()) as android.content.Context;
		this._canvas = Canvas.useSurface ? new org.nativescript.canvas.NSCCanvas(activity, org.nativescript.canvas.NSCCanvas.SurfaceType.Surface) : new org.nativescript.canvas.NSCCanvas(activity);
		const owner = this;
		this._canvas.setTouchEventListener(
			new org.nativescript.canvas.NSCCanvas.TouchEvents({
				onEvent(event: string, nativeEvent: android.view.MotionEvent) {
					owner._touch(event);
				},
			}),
		);
	}

	createNativeView(): any {
		return this._canvas;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = this;
		this._canvas.setListener(
			new org.nativescript.canvas.NSCCanvas.Listener({
				contextReady() {
					if (!owner._ready) {
						owner._ready = true;
						owner.notify({ eventName: 'ready', object: owner });
					}
				},
				surfaceResize(width: number, height: number) {
					owner.notify({ eventName: 'surfaceResize', object: owner, width, height } as EventData);
				},
				surfaceDestroyed() {
					owner.notify({ eventName: 'surfaceDestroyed', object: owner });
				},
				surfaceCreated() {
					owner.notify({ eventName: 'surfaceCreated', object: owner });
				},
			}),
		);
	}

	disposeNativeView(): void {
		this._canvas.setListener(null);
		this._context2d?.__stopRaf();
		this._context2d = null;
		this._gpuContext = null;
		super.disposeNativeView();
	}

	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		this._canvas.setIgnoreTouchEvents(!value);
	}

	// @ts-ignore: the drawing buffer's size in pixels, as the plugin's canvas has it (its layout size is the style's).
	get width(): any {
		return this._canvas.getSurfaceWidth();
	}

	set width(value: any) {
		this._canvas.setSurfaceWidth(Math.floor(value));
	}

	// @ts-ignore
	get height(): any {
		return this._canvas.getSurfaceHeight();
	}

	set height(value: any) {
		this._canvas.setSurfaceHeight(Math.floor(value));
	}

	getContext(type: string): any {
		if (type === '2d') {
			if (!this._context2d) {
				this._context2d = module().__create2DContext(this._canvas, true, true, false, false, 0, true, false, false, false, false, false, 0);
			}
			return this._context2d;
		}
		if (type === 'webgpu') {
			if (!this._gpuContext) {
				this._gpuContext = module().__createWebGPUContext?.(this._canvas) ?? null;
			}
			return this._gpuContext;
		}
		return null;
	}

	/** The plugin's canvas raises its touch events to these listeners, and every other event as a view does. */
	addEventListener(name: string, handler: (data: EventData) => void, thisArg?: any): void {
		if (!TOUCH_EVENTS.includes(name)) {
			super.addEventListener(name, handler, thisArg);
			return;
		}
		const list = this._touchListeners.get(name) ?? [];
		list.push(handler);
		this._touchListeners.set(name, list);
	}

	removeEventListener(name: string, handler?: (data: EventData) => void, thisArg?: any): void {
		if (!TOUCH_EVENTS.includes(name)) {
			super.removeEventListener(name, handler, thisArg);
			return;
		}
		const list = this._touchListeners.get(name);
		if (list) {
			this._touchListeners.set(
				name,
				list.filter((h) => h !== handler),
			);
		}
	}

	/** NSCTouchHandler's JSON (`down`, `move`, `up`, `cancel`) as the touch events the plugin's canvas raises. */
	_touch(json: string): void {
		const data = JSON.parse(json);
		const point = (p: any): TouchPoint => ({ identifier: p.ptrId, clientX: p.x, clientY: p.y });
		switch (data.event) {
			case 'down': {
				const touch = point(data);
				this._down.set(touch.identifier, touch);
				this._raise('touchstart', [touch]);
				break;
			}
			case 'move': {
				const moved: TouchPoint[] = [];
				for (const p of data.pointers ?? []) {
					const touch = point(p);
					this._down.set(touch.identifier, touch);
					moved.push(touch);
				}
				if (moved.length) {
					this._raise('touchmove', moved);
				}
				break;
			}
			case 'up':
			case 'cancel': {
				const touch = point(data);
				this._down.delete(touch.identifier);
				this._raise(data.event === 'up' ? 'touchend' : 'touchcancel', [touch]);
				break;
			}
		}
	}

	private _raise(name: string, changed: TouchPoint[]): void {
		const handlers = this._touchListeners.get(name);
		if (!handlers?.length) {
			return;
		}
		const event: any = { eventName: name, object: this, type: name, changedTouches: changed, touches: [...this._down.values()], target: this };
		for (const handler of handlers) {
			handler(event);
		}
	}
}

/** `navigator.gpu`: WebGPU's entry point, over the binding. */
export class GPU {
	requestAdapter(options?: any): Promise<any> {
		const gpu = module().__gpu;
		return gpu ? gpu.requestAdapter(options) : Promise.resolve(null);
	}

	getPreferredCanvasFormat(): string {
		return module().__gpu?.getPreferredCanvasFormat() ?? 'rgba8unorm';
	}
}

export const GPUBufferUsage = { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
export const GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
export const GPUTextureUsage = { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
