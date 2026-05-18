export class FPSCallback {
	public running: boolean = false;
	private onFrame: (currentTimeMillis: number) => void;
	private _timer: any = null;

	constructor(onFrame: (currentTimeMillis: number) => void) {
		this.onFrame = onFrame;
	}

	public start() {
		if (this.running) {
			return;
		}
		this.running = true;

		try {
			const timer = new Windows.UI.Xaml.DispatcherTimer();
			const interval = { Duration: 160000 }; // 16ms in 100-nanosecond ticks
			timer.Interval = interval as any;
			timer.Tick = NSWinRT.asDelegate(() => {
				if (this.running) {
					this.onFrame(Date.now());
				}
			});
			timer.Start();
			this._timer = timer;
		} catch {
			// Fallback: no-op if WinRT not available
		}
	}

	public stop() {
		if (!this.running) {
			return;
		}
		this.running = false;
		if (this._timer) {
			try {
				this._timer.Stop();
			} catch {}
			this._timer = null;
		}
	}
}
