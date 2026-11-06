import { outPointer } from '../utils/gtk.linux';
import { CoreTypes } from '../core-types';

let primaryWindow: any = null;

export function setPrimaryWindow(window: any): void {
	primaryWindow = window;
}

export function getPrimaryWindow(): any {
	return primaryWindow;
}

let initialized = false;

/** gtk_init once, before the first widget. */
export function ensureGtk(): void {
	if (!initialized) {
		initialized = true;
		gtk_init();
	}
}

export interface Size {
	width: number;
	height: number;
}

export function getWindowSize(window: any): Size | null {
	if (!window) {
		return null;
	}
	const width = gtk_widget_get_width(window);
	const height = gtk_widget_get_height(window);
	if (width > 0 && height > 0) {
		return { width, height };
	}
	const w = new interop.Reference(interop.types.int32, 0);
	const h = new interop.Reference(interop.types.int32, 0);
	gtk_window_get_default_size(window, w, h);
	return w.value > 0 && h.value > 0 ? { width: w.value, height: h.value } : null;
}

/** Geometry of the first monitor, for metrics before any window is mapped. */
export function getMonitorSize(): Size {
	ensureGtk();
	const display = gdk_display_get_default();
	const monitors = display && gdk_display_get_monitors(display);
	const monitor: any = monitors && g_list_model_get_item(monitors, 0);
	if (!monitor) {
		return { width: 1920, height: 1080 };
	}
	const rect = new cairo_rectangle_int_t();
	gdk_monitor_get_geometry(monitor, rect as any);
	g_object_unref(monitor);
	return { width: rect.width, height: rect.height };
}

export function getWindowScale(window: any): number {
	return window ? gtk_widget_get_scale_factor(window) : 1;
}

export function getWindowOrientation(window: any): 'portrait' | 'landscape' | 'unknown' {
	const size = getWindowSize(window) ?? getMonitorSize();
	if (size.width === size.height) {
		return 'unknown';
	}
	return size.width > size.height ? 'landscape' : 'portrait';
}

function stringSetting(name: string): string | null {
	const settings = gtk_settings_get_default();
	if (!settings) {
		return null;
	}
	const value = outPointer();
	g_object_get(settings, name, value, null);
	if (!value.value) {
		return null;
	}
	const text = interop.stringFromCString(value.value);
	g_free(value.value);
	return text;
}

export function getWindowSystemAppearance(_window: any): 'dark' | 'light' {
	const settings = gtk_settings_get_default();
	if (settings) {
		const dark = new interop.Reference(interop.types.int32, 0);
		g_object_get(settings, 'gtk-application-prefer-dark-theme', dark, null);
		if (dark.value) {
			return 'dark';
		}
	}
	return /dark/i.test(stringSetting('gtk-theme-name') ?? '') ? 'dark' : 'light';
}

export function getWindowLayoutDirection(_window: any): CoreTypes.LayoutDirectionType {
	return gtk_widget_get_default_direction() === GtkTextDirection.RTL ? CoreTypes.LayoutDirection.rtl : CoreTypes.LayoutDirection.ltr;
}
