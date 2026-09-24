export class FPSCallback {
	public running: boolean = false;
	private onFrame: (currentTimeMillis: number) => void;
	private _delegate: any = null;

	constructor(onFrame: (currentTimeMillis: number) => void) {
		this.onFrame = onFrame;
	}

	public start() {
		if (this.running) {
			return;
		}
		this.running = true;

		try {
			// CompositionTarget.Rendering fires once per compositor frame at the display's
			// native refresh rate (60/120/144/240 Hz), unlike a fixed-interval DispatcherTimer
			// which caps at ~62 fps regardless of display refresh rate.
			this._delegate = NSWinRT.asDelegate('Windows.Foundation.EventHandler`1<Object>', () => {
				if (this.running) {
					this.onFrame(Date.now());
				}
			});
			Microsoft.UI.Xaml.Media.CompositionTarget.Rendering = this._delegate;
		} catch {
		}
	}

	public stop() {
		if (!this.running) {
			return;
		}
		this.running = false;
		if (this._delegate) {
			try {
				Microsoft.UI.Xaml.Media.CompositionTarget.Rendering = null;
			} catch {}
			this._delegate = null;
		}
	}
}
