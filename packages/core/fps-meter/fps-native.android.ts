import { SDK_VERSION } from '../utils/constants';

export class FPSCallback {
	private impl: android.view.Choreographer.FrameCallback | ((nanos: number) => void);
	private onFrame: (currentTimeMillis: number) => void;

	public running: boolean;
	nativeFramesSupported: boolean;
	constructor(onFrame: (currentTimeMillis: number) => void) {
		this.running = false;
		this.onFrame = onFrame;

		this.nativeFramesSupported = SDK_VERSION >= 24 && this._isNativeFramesSupported();

		if (this.nativeFramesSupported) {
			this.impl = (nanos: number) => {
				this.handleFrame(nanos);
			};
		} else {
			this.impl = new android.view.Choreographer.FrameCallback({
				doFrame: (nanos: number) => {
					this.handleFrame(nanos);
				},
			});
		}
	}

	private _isNativeFramesSupported() {
		return typeof (global as any).__postFrameCallback === 'function' && typeof global.__removeFrameCallback === 'function';
	}

	public start() {
		if (this.running) {
			return;
		}

		if (this.nativeFramesSupported) {
			(global as any).__postFrameCallback(this.impl);
		} else {
			android.view.Choreographer.getInstance().postFrameCallback(this.impl as any);
		}

		this.running = true;
	}

	public stop() {
		if (!this.running) {
			return;
		}

		if (this.nativeFramesSupported) {
			(global as any).__removeFrameCallback(this.impl);
		} else {
			android.view.Choreographer.getInstance().removeFrameCallback(this.impl as any);
		}

		this.running = false;
	}

	private handleFrame(nanos: number) {
		if (!this.running) {
			return;
		}

		// divide by 1 000 000 since the parameter is in nanoseconds
		this.onFrame(nanos / 1000000);
		// add the FrameCallback instance again since it is automatically removed from the Choreographer

		if (this.nativeFramesSupported) {
			(global as any).__postFrameCallback(this.impl);
		} else {
			android.view.Choreographer.getInstance().postFrameCallback(this.impl as any);
		}
	}
}
