import { ApplicationCommon } from './application-common';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { setAppMainEntry, setToggleApplicationEventListenersCallback, setApplicationPropertiesCallback, setA11yUpdatePropertiesCallback } from './helpers-common';
import type { View } from '../ui/core/view';
import { setRootView } from './helpers-common';
import { CoreTypes } from 'index';
import { activateCurrentWindow, getCurrentWindowContent, setCurrentWindowContent, getCurrentWindowBounds, setCurrentWindowTitle } from './window-helper.windows';


enum AppEventKind {
	Activated = 1,
	Deactivated = 2,
	Shown = 3,
	Hidden = 4,
	UncaughtError = 5,
	Exit = 6
}

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

		if (!setCurrentWindowContent(rootView.nativeViewProtected)) {
			throw new Error('Unable to resolve the current Windows window.');
		}
		this.setupOrientationTracking(rootView.nativeViewProtected);
		activateCurrentWindow();
		this._applyWindowTitle();

		this.initRootView(rootView);
		rootView.callLoaded();
	}

	// Give the window a sensible title. A code-created WinUI3 Window starts with an empty Title and
	// does NOT inherit the package DisplayName, so the caption otherwise shows the host exe name.
	private _applyWindowTitle(): void {
		try {
			let title = '';
			try {
				title = Windows.ApplicationModel.Package.Current.DisplayName || '';
			} catch (_e) { /* Package projection unavailable (e.g. unpackaged) — fall through */ }
			if (title) {
				setCurrentWindowTitle(title);
			}
		} catch (_e) { /* never let window titling break app startup */ }
	}

	getNativeApplication() {
		return Microsoft.UI.Xaml.Application.Current;
	}

	protected getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		const bounds = getCurrentWindowBounds();
		if (!bounds) {
			return 'unknown';
		}

		const width = bounds.Width;
		const height = bounds.Height;

		if (width === height) {
			return 'unknown';
		}

		return width >= height ? 'landscape' : 'portrait';
	}

	protected getSystemAppearance(): 'dark' | 'light' | null {
		try {
			const content: any = getCurrentWindowContent();

			const actualTheme = content?.ActualTheme;
			const ElementTheme = Microsoft.UI.Xaml.ElementTheme;
			if (typeof actualTheme === 'number' && ElementTheme) {
				if (actualTheme === ElementTheme.Dark) return 'dark';
				if (actualTheme === ElementTheme.Light) return 'light';
			}

			const appTheme = Microsoft.UI.Xaml.Application.Current.RequestedTheme;
			const ApplicationTheme = Microsoft.UI.Xaml.ApplicationTheme;
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
		const content = getCurrentWindowContent<Microsoft.UI.Xaml.FrameworkElement>();
		if (!content) {
			return null as never;
		}


		const direction = content.FlowDirection;

		if (direction === Microsoft.UI.Xaml.FlowDirection.RightToLeft) {
			return 'rtl';
		}
		return 'ltr';
	}

	private setupLifecycleEvents(): void {
		(globalThis as any).__nsOnAppEvent = (kind: number, message: string | undefined) => {

			switch (kind) {
				case AppEventKind.Shown:
					this.setInBackground(false);
					this.setSuspended(false);
					break;
				case AppEventKind.Deactivated:
					this.setInBackground(true);
					break;
				case AppEventKind.Hidden:
					this.setInBackground(true);
					this.setSuspended(true);
					break;
				case AppEventKind.Exit:
					this.notify({ eventName: this.exitEvent, object: this });
					break;
				case AppEventKind.UncaughtError:
					this.notify({ eventName: this.uncaughtErrorEvent, object: this, error: new Error(message ?? 'Unhandled exception') } as any);
					break;
			}
		};

		try {
			const ui = new Windows.UI.ViewManagement.UISettings();
			if (ui && ui.ColorValuesChanged !== undefined) {
				ui.ColorValuesChanged = () => {
					const newSys = this.getSystemAppearance();
					if (newSys !== null) {
						this.setSystemAppearance(newSys);
					}
				};
			}
		} catch (_e) { }
	}

	// Orientation derives from window size, so re-evaluate when the root content resizes.
	private _orientationDelegate: any = null; // held so the handler isn't GC'd
	private setupOrientationTracking(content: Microsoft.UI.Xaml.UIElement): void {
			const element = content as Microsoft.UI.Xaml.FrameworkElement;
			if (element && element.SizeChanged !== undefined) {
				// Wire via asDelegate (a raw-fn assignment does not reliably subscribe in this host) + hold it.
				this._orientationDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.SizeChangedEventHandler', () => this.setOrientation(this.getOrientation()));
				(element as any).SizeChanged = this._orientationDelegate;
			}
	}
}

export const Application: WindowsApplication = new WindowsApplication();

function updateAccessibilityProperties(view: any): void {
	if (!view || !view.nativeViewProtected) {
		return;
	}

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
