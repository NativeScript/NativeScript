class MainScreen {
	get widthPixels(): number {
		try {
			return Windows.Graphics.Display.DisplayInformation.GetForCurrentView().ScreenWidthInRawPixels;
		} catch {
			return 1920;
		}
	}

	get heightPixels(): number {
		try {
			return Windows.Graphics.Display.DisplayInformation.GetForCurrentView().ScreenHeightInRawPixels;
		} catch {
			return 1080;
		}
	}

	get scale(): number {
		try {
			return Windows.Graphics.Display.DisplayInformation.GetForCurrentView().RawPixelsPerViewPixel || 1;
		} catch {
			return 1;
		}
	}

	get widthDIPs(): number {
		return this.widthPixels / this.scale;
	}

	get heightDIPs(): number {
		return this.heightPixels / this.scale;
	}

	public _updateMetrics(): void {}
}

export class Screen {
	static mainScreen = new MainScreen();
}

export const screen = Screen;
