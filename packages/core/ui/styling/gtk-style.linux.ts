/**
 * Per-widget CSS: each NativeScript style property writes its declarations into
 * a named slot, and the widget's own GtkCssProvider is reloaded from the slots.
 */
import { addressOf } from '../../utils/gtk.linux';

// above themes and the app's user CSS
const PRIORITY = 800;

interface WidgetStyle {
	provider: any;
	slots: Map<string, string>;
	scheduled: boolean;
}

const styles = new Map<number, WidgetStyle>();

function flush(widget: any, style: WidgetStyle) {
	style.scheduled = false;
	let body = '';
	for (const value of style.slots.values()) {
		body += value;
	}
	gtk_css_provider_load_from_data(style.provider, `* {${body}}`, -1);
}

/**
 * Sets the CSS declarations of `slot` (e.g. "background") for `widget`; empty removes them.
 * Updates are batched to one reload per turn.
 */
export function setWidgetCss(widget: any, slot: string, declarations: string): void {
	if (!widget) {
		return;
	}
	const key = addressOf(widget);
	let style = styles.get(key);
	if (!style) {
		if (!declarations) {
			return;
		}
		style = { provider: gtk_css_provider_new(), slots: new Map(), scheduled: false };
		gtk_style_context_add_provider(gtk_widget_get_style_context(widget), style.provider, PRIORITY);
		styles.set(key, style);
	}
	if (declarations) {
		style.slots.set(slot, declarations);
	} else {
		style.slots.delete(slot);
	}
	if (!style.scheduled) {
		style.scheduled = true;
		const target = widget;
		const current = style;
		queueMicrotask(() => flush(target, current));
	}
}

/** Drops the widget's provider (native view disposed). */
export function releaseWidgetCss(widget: any): void {
	const key = addressOf(widget);
	const style = styles.get(key);
	if (style) {
		styles.delete(key);
		gtk_style_context_remove_provider(gtk_widget_get_style_context(widget), style.provider);
		g_object_unref(style.provider);
	}
}

export function px(value: number): string {
	return `${Math.round(value * 100) / 100}px`;
}
