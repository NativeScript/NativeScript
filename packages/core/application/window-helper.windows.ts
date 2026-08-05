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


let _ownedWindow: WindowLike | null = (globalThis as any).__nsOwnedWindow ?? null;

export function getCurrentWindow(): WindowLike | null {
	const found = getApplicationWindow() || getLegacyCurrentWindow();
	if (found) {
		return found;
	}

	if (!_ownedWindow) {
		try {
			_ownedWindow = new Microsoft.UI.Xaml.Window() as unknown as WindowLike;
			(globalThis as any).__nsOwnedWindow = _ownedWindow;
		} catch (_e) {
			_ownedWindow = null;
		}
	}
	return _ownedWindow;
}

export function getCurrentWindowContent<T = Microsoft.UI.Xaml.UIElement>(): T | null {
	const window = getApplicationWindow() || getLegacyCurrentWindow() || _ownedWindow;
	return (window?.Content as T) ?? null;
}

export function setCurrentWindowContent(content: Microsoft.UI.Xaml.UIElement): boolean {
	const window = getCurrentWindow();
	if (!window) {
		return false;
	}

	window.Content = content;
	_cachedScale = null;
	_scaleWatchWired = false;
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


let _cachedScale: number | null = null;
let _scaleWatchWired = false;


export function invalidateWindowScaleCache(): void {
	_cachedScale = null;
}

function _ensureScaleWatch(xamlRoot: any): boolean {
	if (_scaleWatchWired) {
		return true;
	}
	try {
		const del = NSWinRT.asDelegate('Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.XamlRoot,Microsoft.UI.Xaml.XamlRootChangedEventArgs>', (sender: { RasterizationScale?: number | null }) => {
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

export function getCurrentWindowScale(preferredElement?: FrameworkElementLike | null): number {
	if (_cachedScale !== null) {
		return _cachedScale;
	}
	const window = getApplicationWindow() || getLegacyCurrentWindow() || _ownedWindow;
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
	const window = getApplicationWindow() || getLegacyCurrentWindow() || _ownedWindow;
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