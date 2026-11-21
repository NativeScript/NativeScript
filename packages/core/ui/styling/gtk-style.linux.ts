/**
 * Per-widget CSS: each NativeScript style property writes its declarations into
 * a named slot, and the widget's own GtkCssProvider is reloaded from the slots.
 */
import { addressOf } from '../../utils/gtk.linux';
import { viewForWidget } from '../core/view/gtk-layout.linux';

// above themes and the app's user CSS
const PRIORITY = GTK_STYLE_PROVIDER_PRIORITY_USER;

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
	// sizes may have changed (padding, fonts): re-measure the owning view
	for (let w = widget; w; w = gtk_widget_get_parent(w)) {
		const view: any = viewForWidget(w);
		if (view) {
			view.requestLayout();
			break;
		}
	}
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

interface ScopedStyle {
	provider: any;
	className: string;
	slots: Map<string, string>;
}

const scoped = new Map<number, ScopedStyle>();

/**
 * Rules for a widget's sub-parts, which GTK 4 renders as child widgets (a switch's
 * slider, a scale's highlight). `&` stands for the widget: `& slider { color: red; }`.
 */
export function setWidgetScopedCss(widget: any, slot: string, rules: string): void {
	if (!widget) {
		return;
	}
	const key = addressOf(widget);
	let style = scoped.get(key);
	if (!style) {
		if (!rules) {
			return;
		}
		style = { provider: gtk_css_provider_new(), className: `ns-w${key.toString(36)}`, slots: new Map() };
		gtk_widget_add_css_class(widget, style.className);
		gtk_style_context_add_provider_for_display(gdk_display_get_default(), style.provider, PRIORITY);
		scoped.set(key, style);
	}
	if (rules) {
		style.slots.set(slot, rules);
	} else {
		style.slots.delete(slot);
	}
	const selector = `.${style.className}`;
	let css = '';
	for (const value of style.slots.values()) {
		css += value.split('&').join(selector);
	}
	gtk_css_provider_load_from_data(style.provider, css, -1);
}

/** Drops the widget's providers (native view disposed). */
export function releaseWidgetCss(widget: any): void {
	const key = addressOf(widget);
	const style = styles.get(key);
	if (style) {
		styles.delete(key);
		gtk_style_context_remove_provider(gtk_widget_get_style_context(widget), style.provider);
		g_object_unref(style.provider);
	}
	const scopedStyle = scoped.get(key);
	if (scopedStyle) {
		scoped.delete(key);
		gtk_style_context_remove_provider_for_display(gdk_display_get_default(), scopedStyle.provider);
		g_object_unref(scopedStyle.provider);
	}
}

export function px(value: number): string {
	return `${Math.round(value * 100) / 100}px`;
}
