import { getPrimaryWindow } from '../application/window-helper.linux';

const pointer: interop.Type<any> = (interop.types as any).pointer;

/**
 * Frames from the window's GDK frame clock, at the display's refresh rate (like CADisplayLink or
 * Choreographer). Before a window exists it falls back to a ~60 Hz timer.
 */
export class FPSCallback {
	public running = false;
	private _window: any = null;
	private _tickId = 0;
	private _timer: ReturnType<typeof setInterval> | null = null;
	private _tick: interop.Pointer | null = null;

	constructor(private onFrame: (currentTimeMillis: number) => void) {}

	public start() {
		if (this.running) {
			return;
		}
		this.running = true;
		const window = getPrimaryWindow();
		if (!window) {
			this._timer = setInterval(() => this.onFrame(Number(g_get_monotonic_time()) / 1000), 1000 / 60);
			return;
		}
		this._tick ??= interop.callback(
			(_widget: any, clock: any) => {
				if (this.running) {
					// frame time is monotonic microseconds, the base getTimeInFrameBase uses
					this.onFrame(Number(gdk_frame_clock_get_frame_time(clock)) / 1000);
				}
				return 1; // G_SOURCE_CONTINUE
			},
			{ returns: interop.types.int32, args: [pointer, pointer, pointer] },
		);
		this._window = window;
		this._tickId = gtk_widget_add_tick_callback(window, this._tick as any, null, null);
	}

	public stop() {
		if (!this.running) {
			return;
		}
		this.running = false;
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
		if (this._tickId) {
			gtk_widget_remove_tick_callback(this._window, this._tickId);
			this._tickId = 0;
			this._window = null;
		}
	}
}
