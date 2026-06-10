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

function getFirstWindow(collection: any): WindowLike | null {
	if (!collection) {
		return null;
	}

	try {
		if (typeof collection.Size === 'number' && typeof collection.GetAt === 'function' && collection.Size > 0) {
			return collection.GetAt(0) as WindowLike;
		}
	} catch (_e) { }

	try {
		if (typeof collection.Length === 'number' && collection.Length > 0) {
			return collection[0] as WindowLike;
		}
	} catch (_e) { }

	try {
		if (Array.isArray(collection) && collection.length > 0) {
			return collection[0] as WindowLike;
		}
	} catch (_e) { }

	return null;
}

function getApplicationWindow(): WindowLike | null {
	try {
		const app = Microsoft.UI.Xaml.Application?.Current as any;
		if (!app) {
			return null;
		}

		// These are only visible if a host surfaces them on a projectable surface; the base
		// Microsoft.UI.Xaml.Application projection exposes none of them, so this usually yields null.
		return (app.MainWindow as WindowLike) || (app.Window as WindowLike) || getFirstWindow(app.Windows);
	} catch (_e) {
		return null;
	}
}

function getLegacyCurrentWindow(): WindowLike | null {
	try {
		return ((Microsoft.UI.Xaml.Window as any)?.Current as WindowLike) ?? null;
	} catch (_e) {
		return null;
	}
}

let _ownedWindow: WindowLike | null = null;

export function getCurrentWindow(): WindowLike | null {
	const found = getApplicationWindow() || getLegacyCurrentWindow();
	if (found) {
		return found;
	}

	// WinUI3 desktop has no Window.Current and the host's derived App.MainWindow isn't visible
	// through the base Application projection. As a last resort create (once) and own a Window.
	if (!_ownedWindow) {
		try {
			_ownedWindow = new Microsoft.UI.Xaml.Window() as unknown as WindowLike;
		} catch (_e) {
			_ownedWindow = null;
		}
	}
	return _ownedWindow;
}

export function getCurrentWindowContent<T = Microsoft.UI.Xaml.UIElement>(): T | null {
	const window = getCurrentWindow();
	return (window?.Content as T) ?? null;
}

export function setCurrentWindowContent(content: Microsoft.UI.Xaml.UIElement): boolean {
	const window = getCurrentWindow();
	if (!window) {
		return false;
	}

	window.Content = content;
	return true;
}

export function activateCurrentWindow(): boolean {
	const window = getCurrentWindow();
	if (!window?.Activate) {
		return false;
	}

	window.Activate();
	return true;
}

// A WinUI3 Window created in code (which is how the host and this helper create it) has an EMPTY
// Title by default — the package manifest's DisplayName does NOT propagate to a code-created
// window's title bar. So unless someone sets Window.Title explicitly the caption shows the host
// executable's name, which looks wrong. Set it to the provided title (the app's display name).
export function setCurrentWindowTitle(title: string): boolean {
	if (!title) {
		return false;
	}
	const window = getCurrentWindow();
	if (!window) {
		return false;
	}
	try {
		window.Title = title;
		return true;
	} catch (_e) {
		return false;
	}
}

// Per-window DPI scale from XamlRoot (WinUI3 desktop has no DisplayInformation.GetForCurrentView()).
export function getCurrentWindowScale(preferredElement?: FrameworkElementLike | null): number {
	const content = (getCurrentWindowContent<FrameworkElementLike>() ?? preferredElement) as FrameworkElementLike | null;
	const scale = content?.XamlRoot?.RasterizationScale;
	return typeof scale === 'number' && Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export function getCurrentWindowBounds(preferredElement?: FrameworkElementLike | null): { Width: number; Height: number } | null {
	const window = getCurrentWindow();
	const windowBounds = getBoundsFromSize(window?.Bounds);
	if (windowBounds) {
		return windowBounds;
	}

	const xamlRootBounds = getBoundsFromSize(preferredElement?.XamlRoot?.Size);
	if (xamlRootBounds) {
		return xamlRootBounds;
	}

	const content = (window?.Content ?? preferredElement) as any;
	const width = getPositiveNumber(content?.ActualWidth ?? content?.Width);
	const height = getPositiveNumber(content?.ActualHeight ?? content?.Height);
	if (width == null || height == null) {
		return null;
	}

	return { Width: width, Height: height };
}