import * as definition from './fps-native';

export class FPSCallback implements definition.FPSCallback {
	private impl: android.view.Choreographer.FrameCallback;
	private onFrame: (currentTimeMillis: number) => void;

	public running: boolean;

	constructor(onFrame: (currentTimeMillis: number) => void) {
		this.running = false;
		this.onFrame = onFrame;

		this.impl = new android.view.Choreographer.FrameCallback({
			doFrame: (nanos: number) => {
				this.handleFrame(nanos);
			},
		});
	}

	public start() {
		if (this.running) {
			return;
		}

		android.view.Choreographer.getInstance().postFrameCallback(this.impl);
		this.running = true;
	}

	public stop() {
		if (!this.running) {
			return;
		}

		android.view.Choreographer.getInstance().removeFrameCallback(this.impl);
		this.running = false;
	}

	private handleFrame(nanos: number) {
		if (!this.running) {
			return;
		}

		// divide by 1 000 000 since the parameter is in nanoseconds
		this.onFrame(nanos / 1000000);
		// add the FrameCallback instance again since it is automatically removed from the Choreographer
		android.view.Choreographer.getInstance().postFrameCallback(this.impl);
	}
}
