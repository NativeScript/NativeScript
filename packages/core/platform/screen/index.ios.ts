import { getWindow } from '../../utils/ios-helper';

class MainScreen {
	private _screen: UIScreen;

	private get screen(): UIScreen {
		if (!this._screen) {
			// NOTE: may not want to cache this value with SwiftUI app lifecycle based apps (using NativeScriptViewFactory) given the potential of multiple scenes
			const window = getWindow() as UIWindow;
			this._screen = window ? window.screen : UIScreen.mainScreen;
		}

		return this._screen;
	}

	get widthPixels(): number {
		return this.widthDIPs * this.scale;
	}
	get heightPixels(): number {
		return this.heightDIPs * this.scale;
	}
	get scale(): number {
		return this.screen.scale;
	}
	get widthDIPs(): number {
		return this.screen.bounds.size.width;
	}
	get heightDIPs(): number {
		return this.screen.bounds.size.height;
	}

	public _updateMetrics(): void {
		// UIScreen handles the update on iOS
	}
}

export class Screen {
	static mainScreen = new MainScreen();
}

// This retains compatibility with NS6
export const screen = Screen;
