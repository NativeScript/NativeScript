import { getPrimaryWindow } from '../application/window-helper.linux';
import { addressOf, connect } from '../utils/gtk.linux';

/**
 * Frames from the window's GDK frame clock, at the display's refresh rate (like CADisplayLink or
 * Choreographer). Before a window exists it falls back to a ~60 Hz timer.
 *
 * Requests one frame at a time instead of begin/end_updating: GTK 4.6 restarts its frame-time
 * smoothing whenever updating starts, and starting and stopping it for short animations stalls
 * GTK's own CSS animations (a GtkSpinner stops turning).
 */
export class FPSCallback {
	public running = false;
	private _clock = 0;
	private _disconnect: (() => void) | null = null;
	private _timer: ReturnType<typeof setInterval> | null = null;

	constructor(private onFrame: (currentTimeMillis: number) => void) {}

	public start() {
		if (this.running) {
			return;
		}
		this.running = true;
		const window = getPrimaryWindow();
		const clock = window && gtk_widget_get_frame_clock(window);
		if (!clock) {
			this._timer = setInterval(() => this.onFrame(Number(g_get_monotonic_time()) / 1000), 1000 / 60);
			return;
		}
		if (this._clock !== addressOf(clock)) {
			this._disconnect?.();
			this._clock = addressOf(clock);
			this._disconnect = connect(clock, 'update', () => {
				if (!this.running) {
					return;
				}
				gdk_frame_clock_request_phase(clock, GdkFrameClockPhase.UPDATE);
				// frame time is monotonic microseconds, the base getTimeInFrameBase uses
				this.onFrame(Number(gdk_frame_clock_get_frame_time(clock)) / 1000);
			});
		}
		gdk_frame_clock_request_phase(clock, GdkFrameClockPhase.UPDATE);
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
	}
}
