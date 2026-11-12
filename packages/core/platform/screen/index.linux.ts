import { getMonitorSize, getPrimaryWindow, getWindowScale, getWindowSize } from '../../application/window-helper.linux';

// Metrics follow the primary window (the app's "screen" on the desktop).
class MainScreen {
	private size() {
		return getWindowSize(getPrimaryWindow()) ?? getMonitorSize();
	}

	get widthPixels(): number {
		return this.widthDIPs;
	}

	get heightPixels(): number {
		return this.heightDIPs;
	}

	// GTK scales logical pixels itself
	get scale(): number {
		return 1;
	}

	/** Device scale of the primary window's monitor. */
	get nativeScale(): number {
		return getWindowScale(getPrimaryWindow());
	}

	get widthDIPs(): number {
		return this.size().width;
	}

	get heightDIPs(): number {
		return this.size().height;
	}

	public _updateMetrics(): void {}
}

export class Screen {
	static mainScreen = new MainScreen();
}

export const screen = Screen;
