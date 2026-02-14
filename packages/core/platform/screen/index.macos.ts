class MainScreen {
	private get screen(): NSScreen {
		if (NSScreen.mainScreen) {
			return NSScreen.mainScreen;
		}
		const screens = NSScreen.screens;
		return screens && screens.count > 0 ? screens.objectAtIndex(0) : null;
	}

	get widthPixels(): number {
		return this.widthDIPs * this.scale;
	}

	get heightPixels(): number {
		return this.heightDIPs * this.scale;
	}

	get scale(): number {
		return this.screen ? this.screen.backingScaleFactor : 1;
	}

	get widthDIPs(): number {
		return this.screen ? this.screen.frame.size.width : 0;
	}

	get heightDIPs(): number {
		return this.screen ? this.screen.frame.size.height : 0;
	}

	public _updateMetrics(): void {}
}

export class Screen {
	static mainScreen = new MainScreen();
}

export const screen = Screen;
