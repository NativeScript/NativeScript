import { getWindow } from '../../utils/native-helper';

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
		return this.currentScreen.bounds.size.width;
	}
	get heightDIPs(): number {
		return this.currentScreen.bounds.size.height;
	}

	// A window can move to a screen of another size, e.g. between the outer and inner displays of
	// iPhone Duo, so bounds come from the screen it is on now. Scale is the one metric that holds
	// across screens (layout-helper caches it too), so it keeps using the screen resolved first.
	private get currentScreen(): UIScreen {
		const window = getWindow() as UIWindow;
		return window ? window.screen : this.screen;
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
