import type { CoreTypes } from '../core-types';
import { getActiveWindow } from './helpers-common';

type WindowLike = {
	Content?: Microsoft.UI.Xaml.UIElement | null;
	Bounds?: { Width?: number; Height?: number } | null;
	Activate?: () => void;
	Title?: string;
};

type FrameworkElementLike = Microsoft.UI.Xaml.FrameworkElement & {
	XamlRoot?: {
		Size?: { Width?: number; Height?: number } | null;
		RasterizationScale?: number | null;
	} | null;
};

function getPositiveNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function getBoundsFromSize(size: { Width?: number; Height?: number } | null | undefined): { Width: number; Height: number } | null {
	const width = getPositiveNumber(size?.Width);
	const height = getPositiveNumber(size?.Height);
	if (width == null || height == null) {
		return null;
	}

	return { Width: width, Height: height };
}

let _ownedWindow: WindowLike | null = (globalThis as any).__nsOwnedWindow ?? null;

// Follows the primary role when another window takes it over.
let _primaryWindow: WindowLike | null = null;

// Never adopt the host's Window: closing it ends the runtime.
function resolveCurrentWindow(): WindowLike | null {
	return _primaryWindow || _ownedWindow;
}

/**
 * The primary window, without creating one.
 */
export function findCurrentWindow(): Microsoft.UI.Xaml.Window | null {
	return resolveCurrentWindow() as unknown as Microsoft.UI.Xaml.Window;
}

export function getCurrentWindow(): WindowLike | null {
	const found = resolveCurrentWindow();
	if (found) {
		return found;
	}

	try {
		_ownedWindow = new Microsoft.UI.Xaml.Window() as unknown as WindowLike;
		(globalThis as any).__nsOwnedWindow = _ownedWindow;
	} catch (_e) {
		_ownedWindow = null;
	}
	return _ownedWindow;
}

/**
 * Points screen metrics and density at the primary window.
 */
export function setPrimaryWindow(window: Microsoft.UI.Xaml.Window | null): void {
	const target = window as unknown as WindowLike;
	if (_primaryWindow === target) {
		return;
	}
	_primaryWindow = target;
	resetScaleWatch();
}

/**
 * Forgets a closed window so lookups never return it.
 */
export function releaseWindow(window: Microsoft.UI.Xaml.Window): void {
	const target = window as unknown as WindowLike;
	if (_primaryWindow === target) {
		_primaryWindow = null;
		resetScaleWatch();
	}
	if (_ownedWindow === target) {
		_ownedWindow = null;
		(globalThis as any).__nsOwnedWindow = null;
	}
}

export function getCurrentWindowContent<T = Microsoft.UI.Xaml.UIElement>(): T | null {
	return (resolveCurrentWindow()?.Content as T) ?? null;
}

// The active window, falling back to the primary.
function resolveActiveWindow(): WindowLike | null {
	return (getActiveWindow()?.windows?.window as unknown as WindowLike) ?? resolveCurrentWindow();
}

export function getActiveWindowContent<T = Microsoft.UI.Xaml.UIElement>(): T | null {
	return (resolveActiveWindow()?.Content as T) ?? null;
}

export function getActiveWindowBounds(): { Width: number; Height: number } | null {
	return getWindowBounds(resolveActiveWindow() as unknown as Microsoft.UI.Xaml.Window);
}

/**
 * Captions a window with the package display name, which WinUI doesn't inherit.
 */
export function applyDefaultWindowTitle(window: Microsoft.UI.Xaml.Window): void {
	let title = '';
	try {
		title = Windows.ApplicationModel.Package.Current.DisplayName || '';
	} catch (_e) { }
	if (title) {
		window.Title = title;
	}
}

const TITLE_BAR_COLORS = {
	light: {
		background: { A: 255, R: 243, G: 243, B: 243 },
		foreground: { A: 255, R: 0, G: 0, B: 0 },
		inactiveForeground: { A: 255, R: 145, G: 145, B: 145 },
		hoverBackground: { A: 255, R: 234, G: 234, B: 234 },
		pressedBackground: { A: 255, R: 237, G: 237, B: 237 },
	},
	dark: {
		background: { A: 255, R: 32, G: 32, B: 32 },
		foreground: { A: 255, R: 255, G: 255, B: 255 },
		inactiveForeground: { A: 255, R: 150, G: 150, B: 150 },
		hoverBackground: { A: 255, R: 45, G: 45, B: 45 },
		pressedBackground: { A: 255, R: 41, G: 41, B: 41 },
	},
};

/**
 * The system title bar stays light whatever the app's appearance. Windows App SDK 1.7+ themes it
 * with PreferredTheme; earlier versions take the system's light or dark caption colors.
 */
export function setWindowTitleBarAppearance(window: Microsoft.UI.Xaml.Window, appearance: 'dark' | 'light'): boolean {
	const bar = (window as any)?.AppWindow?.TitleBar;
	if (!bar) {
		return false;
	}
	try {
		const TitleBarTheme = (Microsoft.UI.Windowing as any).TitleBarTheme;
		if (TitleBarTheme?.Dark !== undefined) {
			bar.PreferredTheme = appearance === 'dark' ? TitleBarTheme.Dark : TitleBarTheme.Light;
			return true;
		}
	} catch (_e) {}
	try {
		const colors = TITLE_BAR_COLORS[appearance];
		bar.BackgroundColor = colors.background;
		bar.ForegroundColor = colors.foreground;
		bar.InactiveBackgroundColor = colors.background;
		bar.InactiveForegroundColor = colors.inactiveForeground;
		bar.ButtonBackgroundColor = colors.background;
		bar.ButtonForegroundColor = colors.foreground;
		bar.ButtonInactiveBackgroundColor = colors.background;
		bar.ButtonInactiveForegroundColor = colors.inactiveForeground;
		bar.ButtonHoverBackgroundColor = colors.hoverBackground;
		bar.ButtonHoverForegroundColor = colors.foreground;
		bar.ButtonPressedBackgroundColor = colors.pressedBackground;
		bar.ButtonPressedForegroundColor = colors.foreground;
		return true;
	} catch (_e) {
		return false;
	}
}

/**
 * The window content's theme, falling back to app and system settings.
 */
export function getWindowSystemAppearance(window: Microsoft.UI.Xaml.Window | null): 'dark' | 'light' | null {
	try {
		const content: any = (window as unknown as WindowLike)?.Content;

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

export function getWindowLayoutDirection(window: Microsoft.UI.Xaml.Window | null): CoreTypes.LayoutDirectionType | null {
	const content = (window as unknown as WindowLike)?.Content as Microsoft.UI.Xaml.FrameworkElement;
	if (!content) {
		return null;
	}

	return content.FlowDirection === Microsoft.UI.Xaml.FlowDirection.RightToLeft ? 'rtl' : 'ltr';
}

export function getWindowOrientation(window: Microsoft.UI.Xaml.Window | null): 'portrait' | 'landscape' | 'unknown' {
	const bounds = getWindowBounds(window);
	if (!bounds || bounds.Width === bounds.Height) {
		return 'unknown';
	}

	return bounds.Width >= bounds.Height ? 'landscape' : 'portrait';
}


let _cachedScale: number | null = null;
let _scaleWatchWired = false;
// Stops a previous window's XamlRoot.Changed from writing the cache.
let _scaleWatchGeneration = 0;

function resetScaleWatch(): void {
	_cachedScale = null;
	_scaleWatchWired = false;
	_scaleWatchGeneration++;
}

export function invalidateWindowScaleCache(): void {
	_cachedScale = null;
}

function _ensureScaleWatch(xamlRoot: any): boolean {
	if (_scaleWatchWired) {
		return true;
	}
	const generation = _scaleWatchGeneration;
	try {
		const del = NSWinRT.asDelegate('Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.XamlRoot,Microsoft.UI.Xaml.XamlRootChangedEventArgs>', (sender: { RasterizationScale?: number | null }) => {
			if (generation !== _scaleWatchGeneration) {
				return;
			}
			const s = sender?.RasterizationScale;
			_cachedScale = typeof s === 'number' && Number.isFinite(s) && s > 0 ? s : null;
		});
		(xamlRoot as { Changed?: unknown }).Changed = del;
		_scaleWatchWired = true;
		return true;
	} catch (_e) {
		return false;
	}
}

/**
 * @internal - re-reads the scale after the primary content changes.
 */
export function onPrimaryWindowContentChanged(): void {
	resetScaleWatch();
}

export function getCurrentWindowScale(preferredElement?: FrameworkElementLike | null): number {
	if (_cachedScale !== null) {
		return _cachedScale;
	}
	const window = resolveCurrentWindow();
	const content = ((window?.Content as FrameworkElementLike | null | undefined) ?? preferredElement) as FrameworkElementLike | null;
	const xamlRoot = content?.XamlRoot;
	const scale = xamlRoot?.RasterizationScale;
	if (typeof scale === 'number' && Number.isFinite(scale) && scale > 0) {
		if (xamlRoot && _ensureScaleWatch(xamlRoot)) {
			_cachedScale = scale;
		}
		return scale;
	}
	return 1;
}

export function getCurrentWindowBounds(preferredElement?: FrameworkElementLike | null): { Width: number; Height: number } | null {
	return getWindowBounds(resolveCurrentWindow() as unknown as Microsoft.UI.Xaml.Window, preferredElement);
}

export function getWindowBounds(xamlWindow: Microsoft.UI.Xaml.Window | null, preferredElement?: FrameworkElementLike | null): { Width: number; Height: number } | null {
	const window = xamlWindow as unknown as WindowLike;
	const windowBounds = getBoundsFromSize(window?.Bounds);
	if (windowBounds) {
		return windowBounds;
	}

	const content = ((window?.Content as FrameworkElementLike | null | undefined) ?? preferredElement) as FrameworkElementLike | null;
	const contentXamlRootBounds = getBoundsFromSize(content?.XamlRoot?.Size);
	if (contentXamlRootBounds) {
		return contentXamlRootBounds;
	}

	const xamlRootBounds = getBoundsFromSize(preferredElement?.XamlRoot?.Size);
	if (xamlRootBounds) {
		return xamlRootBounds;
	}

	const measured = (content ?? window?.Content) as any;
	const width = getPositiveNumber(measured?.ActualWidth ?? measured?.Width);
	const height = getPositiveNumber(measured?.ActualHeight ?? measured?.Height);
	if (width == null || height == null) {
		return null;
	}

	return { Width: width, Height: height };
}
