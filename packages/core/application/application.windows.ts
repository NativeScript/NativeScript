import { ApplicationCommon } from './application-common';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { setAppMainEntry, setToggleApplicationEventListenersCallback, setApplicationPropertiesCallback, setA11yUpdatePropertiesCallback } from './helpers-common';
import type { View } from '../ui/core/view';
import { setRootView } from './helpers-common';
import { CoreTypes } from 'index';
import { activateCurrentWindow, getCurrentWindowContent, setCurrentWindowContent, getCurrentWindowBounds, setCurrentWindowTitle } from './window-helper.windows';
import { windows } from '../ui/styling/font';
import { resolveModuleName, ModuleNameResolver } from '../module-name-resolver';
import { _setResolver } from '../module-name-resolver/helpers';
import { Screen, Device } from '../platform';


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

	get windows() {
		return this;
	}

	run(entry?: string | NavigationEntry): void {
		if (this.started) {
			throw new Error('Application is already started.');
		}

		this.setupLifecycleEvents();

		this.started = true;
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		windows.triggerFontScan();
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
		activateCurrentWindow();
		this.setupOrientationTracking(rootView.nativeViewProtected);
		this._applyWindowTitle();

		this.initRootView(rootView);
		rootView.callLoaded();
	}

	// A code-created WinUI3 Window starts with an empty Title and
	// does NOT inherit the package DisplayName, so the caption otherwise shows the host exe name.
	private _applyWindowTitle(): void {
		try {
			let title = '';
			try {
				title = Windows.ApplicationModel.Package.Current.DisplayName || '';
			} catch (_e) { }
			if (title) {
				setCurrentWindowTitle(title);
			}
		} catch (_e) {  }
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

	private _orientationDelegate: Microsoft.UI.Xaml.SizeChangedEventHandler | null = null;
	private _resizeDebounceId: any = null;
	private _lastResizeW = NaN;
	private _lastResizeH = NaN;
	private setupOrientationTracking(content: Microsoft.UI.Xaml.UIElement): void {
		const element = content as Microsoft.UI.Xaml.FrameworkElement;
		if (!element) return;
		const bounds = getCurrentWindowBounds();
		this._lastResizeW = bounds?.Width ?? NaN;
		this._lastResizeH = bounds?.Height ?? NaN;
		try {
			this._orientationDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.SizeChangedEventHandler', () => this._onWindowResized());
			element.SizeChanged = this._orientationDelegate;
		} catch (_e) { }
	}

	
	private _onWindowResized(): void {
		if (this._resizeDebounceId) {
			clearTimeout(this._resizeDebounceId);
		}
		this._resizeDebounceId = setTimeout(() => {
			this._resizeDebounceId = null;
			this._applyResize();
		}, 80);
	}

	// Desktop windows resize continuously, so width-based @media rules and matchMedia listeners must
	// re-evaluate on resize — not just on portrait/landscape flips. setOrientation() short-circuits
	// when the orientation value is unchanged, so we additionally force a CSS/media re-evaluation
	// when only the dimensions changed.
	private _applyResize(): void {
		const bounds = getCurrentWindowBounds();
		const w = bounds?.Width ?? NaN;
		const h = bounds?.Height ?? NaN;
		if (!(w > 0) || !(h > 0)) {
			return;
		}
		if (Math.abs(w - this._lastResizeW) < 1 && Math.abs(h - this._lastResizeH) < 1) {
			return; // size unchanged
		}
		this._lastResizeW = w;
		this._lastResizeH = h;

		// Capture the page variant currently on screen BEFORE the orientation handling below — the
		// framework resets the module resolver on orientationChanged (application-common), so reading
		// it afterwards would already reflect the NEW metrics, hiding the change.
		const displayed = this._currentPageVariant();

		const newOrientation = this.getOrientation();
		const orientationChanged = newOrientation !== this.orientation();
		// Real portrait/landscape flip: updates the cached value, re-applies the ns-portrait/
		// ns-landscape class, re-styles, and fires orientationChangedEvent.
		this.setOrientation(newOrientation);

		if (!orientationChanged) {
			// Same orientation but dimensions changed — re-match @media against the (live) Screen
			// metrics and notify matchMedia listeners (which key off orientationChangedEvent).
			const rootView = this.getRootView();
			if (rootView) {
				this.orientationChanged(rootView, newOrientation);
			}
			this.notify({
				eventName: this.orientationChangedEvent,
				object: this,
				windows: this.windows,
				newValue: newOrientation,
			} as never);
		}

		// File-name screen qualifiers (main-page.minWH360.xml, .land/.port, etc.) are resolved at
		// navigation time. On desktop the window resizes continuously, so re-resolve the current
		// page's variant against the new metrics and hot-swap it when it crosses a qualifier
		// threshold. (Mobile never resizes continuously, so this is desktop specific.)
		this._swapQualifiedPageIfChanged(displayed);
	}

	// Resolves the current page's on-screen variant using the (pre-orientation-reset) global resolver.
	private _currentPageVariant(): { frame: any; moduleName: string; xml: string; js: string } | null {
		// Find the current frame from the root view.
		// Descends through nested frames to the deepest active one.
		let frame: any = this.getRootView();
		let guard = 0;
		while (frame && guard++ < 10) {
			const child = frame.currentPage?.content;
			if (child && typeof child.replacePage === 'function') {
				frame = child;
			} else {
				break;
			}
		}
		if (!frame || typeof frame.replacePage !== 'function') {
			return null;
		}
		const moduleName: string = frame?._currentEntry?.entry?.moduleName;
		if (!moduleName) {
			return null;
		}
		try {
			return { frame, moduleName, xml: resolveModuleName(moduleName, 'xml'), js: resolveModuleName(moduleName, '') };
		} catch (_e) {
			return null;
		}
	}

	private _swapQualifiedPageIfChanged(displayed: { frame: any; moduleName: string; xml: string; js: string } | null): void {
		if (!displayed) {
			return;
		}
		const { frame, moduleName } = displayed;
		// Resolve against the CURRENT (resized) metrics via a throwaway resolver — independent of the
		// global resolver's state (which the orientation handler may or may not have reset).
		const ctx = {
			width: Screen.mainScreen.widthDIPs,
			height: Screen.mainScreen.heightDIPs,
			os: Device.os,
			deviceType: Device.deviceType,
		};
		let candidateXml: string, candidateJs: string;
		try {
			const probe = new ModuleNameResolver(ctx);
			candidateXml = probe.resolveModuleName(moduleName, 'xml');
			candidateJs = probe.resolveModuleName(moduleName, '');
		} catch (_e) {
			return;
		}
		if (candidateXml === displayed.xml && candidateJs === displayed.js) {
			return; // no qualifier boundary crossed — keep the current page
		}

		// Variant changed: point the global resolver at the new metrics so Builder resolves the new
		// variant, flush the Windows page cache (keyed by base module name) so the freshly-built
		// variant isn't overridden by a stale cached page, then swap.
		try {
			_setResolver(new ModuleNameResolver(ctx));
		} catch (_e) {
			return;
		}
		try {
			frame._flushPageCache?.();
		} catch (_e) { }
		try {
			frame.replacePage({ moduleName });
		} catch (_e) { }
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
