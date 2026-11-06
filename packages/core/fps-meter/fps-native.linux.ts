// ~60 Hz ticks; GTK frame clocks are per widget and FPSCallback has none.
export class FPSCallback {
	public running = false;
	private _timer: ReturnType<typeof setInterval> | null = null;

	constructor(private onFrame: (currentTimeMillis: number) => void) {}

	public start() {
		if (this.running) {
			return;
		}
		this.running = true;
		this._timer = setInterval(() => this.onFrame(Date.now()), 1000 / 60);
	}

	public stop() {
		if (!this.running) {
			return;
		}
		this.running = false;
		clearInterval(this._timer);
		this._timer = null;
	}
}
