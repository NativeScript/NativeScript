import { getCurrentWindowBounds, getCurrentWindowScale } from '../../application/window-helper.windows';

class MainScreen {
	// Metrics derived from the current window's XamlRoot (WinUI3 has no GetForCurrentView()).
	get widthPixels(): number {
		return Math.round(this.widthDIPs * this.scale);
	}

	get heightPixels(): number {
		return Math.round(this.heightDIPs * this.scale);
	}

	get scale(): number {
		return getCurrentWindowScale();
	}

	get widthDIPs(): number {
		return getCurrentWindowBounds()?.Width ?? 1920;
	}

	get heightDIPs(): number {
		return getCurrentWindowBounds()?.Height ?? 1080;
	}

	public _updateMetrics(): void {}
}

export class Screen {
	static mainScreen = new MainScreen();
}

export const screen = Screen;
