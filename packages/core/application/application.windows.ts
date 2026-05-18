import { ApplicationCommon } from './application-common';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { setAppMainEntry, setToggleApplicationEventListenersCallback, setApplicationPropertiesCallback, setA11yUpdatePropertiesCallback } from './helpers-common';
import type { View } from '../ui/core/view';
import { setRootView } from './helpers-common';
import { CoreTypes } from 'index';

export class WindowsApplication extends ApplicationCommon {

	private _rootView: View;

	getRootView(): View {
		return this._rootView;
	}

	run(entry?: string | NavigationEntry): void {
		if (this.started) {
			throw new Error('Application is already started.');
		}

		this.setupLifecycleEvents();

		this.started = true;
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		this.setWindowContent();
	}


	private setWindowContent(view?: View): void {
		if (this._rootView) {
			this._rootView._onRootViewReset();
		}
		const rootView = this.createRootView(view, true);
		if (!rootView) return;

		this._rootView = rootView;
		setRootView(rootView);

		rootView._setupAsRootView({});

		const win = Windows.UI.Xaml.Window.Current;
		win.Content = rootView.nativeViewProtected;
		win.Activate();

		this.initRootView(rootView);
		rootView.callLoaded();
	}

	getNativeApplication() {
		return Windows?.UI?.Xaml?.Application?.Current ?? Windows?.ApplicationModel?.Core?.CoreApplication;
	}

	protected getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		try {
			const displayInfo = Windows.Graphics.Display.DisplayInformation.GetForCurrentView();
			const orientation = displayInfo?.CurrentOrientation;
			const DisplayOrientations = Windows.Graphics.Display.DisplayOrientations;

			if (orientation === DisplayOrientations.Portrait || orientation === DisplayOrientations.PortraitFlipped) {
				return 'portrait';
			}

			if (orientation === DisplayOrientations.Landscape || orientation === DisplayOrientations.LandscapeFlipped) {
				return 'landscape';
			}
		} catch (e) { }

		return 'unknown';
	}

	protected getSystemAppearance(): 'dark' | 'light' | null {
		try {
			const content: any = Windows.UI.Xaml.Window.Current.Content;

			const actualTheme = content?.ActualTheme;
			const ElementTheme = Windows.UI.Xaml.ElementTheme;
			if (typeof actualTheme === 'number' && ElementTheme) {
				if (actualTheme === ElementTheme.Dark) return 'dark';
				if (actualTheme === ElementTheme.Light) return 'light';
			}

			const appTheme = Windows.UI.Xaml.Application.Current.RequestedTheme;
			const ApplicationTheme = Windows.UI.Xaml.ApplicationTheme;
			if (appTheme === ApplicationTheme.Dark) return 'dark';
			if (appTheme === ApplicationTheme.Light) return 'light';

			const UISettings = Windows.UI.ViewManagement.UISettings;
			const ui = new UISettings();
			const foreground = ui.GetColorValue(Windows.UI.ViewManagement.UIColorType.Foreground);
			if (!foreground) {
				return null;
			}

			// In dark mode Windows uses a light (near-white) foreground color
			return foreground.R > 128 ? 'dark' : 'light';
		} catch (e) { }

		return null;
	}

	protected getLayoutDirection(): CoreTypes.LayoutDirectionType {
		const content = Windows.UI.Xaml.Window.Current.Content as Windows.UI.Xaml.FrameworkElement | null;
		if (!content) {
			return null as never;
		}


		const direction = content.FlowDirection;

		if (direction === Windows.UI.Xaml.FlowDirection.RightToLeft) {
			return 'rtl';
		}
		return 'ltr';
	}

	private setupLifecycleEvents(): void {
		const coreApp = Windows.ApplicationModel.Core.CoreApplication;

		if (coreApp) {
			coreApp.Suspending = (_sender: any, args: any) => this.setSuspended(true, { win: args });
			coreApp.Resuming = (_sender: any, args: any) => this.setSuspended(false, { win: args });
			coreApp.EnteredBackground = (_sender: any, args: any) => this.setInBackground(true, { win: args });
			coreApp.LeavingBackground = (_sender: any, args: any) => this.setInBackground(false, { win: args });
			coreApp.Exiting = (_sender: any, args: any) => this.notify({ eventName: this.exitEvent, object: this, win: args });
			coreApp.UnhandledErrorDetected = (_sender: any, args: any) => this.notify({ eventName: this.uncaughtErrorEvent, object: this, win: args });
		}

		const displayInfo = Windows.Graphics.Display.DisplayInformation.GetForCurrentView();
		const onOrientationChanged = () => {
			const newValue = this.getOrientation();
			this.setOrientation(newValue);
		};

		if (displayInfo && displayInfo.OrientationChanged !== undefined) {
			displayInfo.OrientationChanged = () => onOrientationChanged();
		}

		const ui = new Windows.UI.ViewManagement.UISettings();
		const onColorValuesChanged = () => {
			const newSys = this.getSystemAppearance();
			if (newSys !== null) {
				this.setSystemAppearance(newSys);
			}
		};

		if (ui && ui.ColorValuesChanged !== undefined) {
			ui.ColorValuesChanged = () => onColorValuesChanged();
		}
	}
}

export const Application: WindowsApplication = new WindowsApplication();

function updateAccessibilityProperties(view: any): void {
	if (!view || !view.nativeViewProtected) {
		return;
	}

	// todo
}

setA11yUpdatePropertiesCallback(updateAccessibilityProperties);

const applicationEvents: string[] = [Application.orientationChangedEvent, Application.systemAppearanceChangedEvent];
function toggleApplicationEventListeners(toAdd: boolean, callback: (args: any) => void) {
	for (const eventName of applicationEvents) {
		if (toAdd) {
			Application.on(eventName, callback);
		} else {
			Application.off(eventName, callback);
		}
	}
}
setToggleApplicationEventListenersCallback(toggleApplicationEventListeners);

setApplicationPropertiesCallback(() => {
	return {
		orientation: Application.orientation(),
		systemAppearance: Application.systemAppearance(),
	};
});
