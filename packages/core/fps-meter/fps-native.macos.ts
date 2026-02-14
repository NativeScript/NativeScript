export class FPSCallback {
	public running = false;
	private readonly onFrame: (currentTimeMillis: number) => void;
	private handle: any;

	constructor(onFrame: (currentTimeMillis: number) => void) {
		this.onFrame = onFrame;
	}

	public start() {
		if (this.running) {
			return;
		}

		this.running = true;
		this.handle = setInterval(() => {
			this.onFrame(Date.now());
		}, 16);
	}

	public stop() {
		if (!this.running) {
			return;
		}

		this.running = false;
		clearInterval(this.handle);
		this.handle = null;
	}
}
