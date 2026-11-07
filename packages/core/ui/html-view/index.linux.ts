export * from './html-view-common';

import { HtmlViewBase, htmlProperty, selectableProperty, linkColorProperty } from './html-view-common';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Font } from '../styling/font';
import { openUrl } from '../../utils';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss, setWidgetScopedCss } from '../styling/gtk-style.linux';

const TAGS: Record<string, [string, string]> = {
	b: ['<b>', '</b>'],
	strong: ['<b>', '</b>'],
	i: ['<i>', '</i>'],
	em: ['<i>', '</i>'],
	u: ['<u>', '</u>'],
	s: ['<s>', '</s>'],
	strike: ['<s>', '</s>'],
	del: ['<s>', '</s>'],
	sub: ['<sub>', '</sub>'],
	sup: ['<sup>', '</sup>'],
	small: ['<small>', '</small>'],
	big: ['<big>', '</big>'],
	code: ['<tt>', '</tt>'],
	tt: ['<tt>', '</tt>'],
	h1: ['<span size="xx-large" weight="bold">', '</span>\n'],
	h2: ['<span size="x-large" weight="bold">', '</span>\n'],
	h3: ['<span size="large" weight="bold">', '</span>\n'],
};

/** Basic HTML to Pango markup (inline formatting, links, paragraphs, lists). */
export function htmlToMarkup(html: string): string {
	const escape = (text: string) =>
		text
			.replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	const closeTag = (tag: string) => (tag === 'a' ? '</a>' : TAGS[tag][1]);
	// tags still open, so the markup stays balanced whatever the HTML (GTK drops invalid markup)
	const open: string[] = [];
	let out = '';
	const re = /<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
	let m: RegExpExecArray;
	while ((m = re.exec(html || ''))) {
		if (m[4] !== undefined) {
			out += escape(m[4].replace(/\s+/g, ' '));
			continue;
		}
		const closing = !!m[1];
		const tag = m[2].toLowerCase();
		if (tag === 'br') {
			out += '\n';
		} else if (tag === 'p' || tag === 'div') {
			out += closing ? '\n\n' : '';
		} else if (tag === 'li') {
			out += closing ? '\n' : '• ';
		} else if (tag === 'a' || TAGS[tag]) {
			if (closing) {
				const i = open.lastIndexOf(tag);
				while (i >= 0 && open.length > i) {
					out += closeTag(open.pop());
				}
			} else if (tag === 'a') {
				// links don't nest
				if (!open.includes('a')) {
					const href = /href\s*=\s*["']([^"']*)["']/i.exec(m[3])?.[1];
					out += `<a href="${escape(href ?? '')}">`;
					open.push(tag);
				}
			} else {
				out += TAGS[tag][0];
				open.push(tag);
			}
		}
	}
	while (open.length) {
		out += closeTag(open.pop());
	}
	return out.trim();
}

// HTML content may be untrusted: no file://, custom schemes or .desktop launchers
const LINK_SCHEMES = /^(https?|mailto):/i;

/** GtkLabel with Pango markup; links open with the desktop's handler. */
export class HtmlView extends HtmlViewBase {
	private _disconnect: () => void;

	createNativeView() {
		const label: any = gtk_label_new(null);
		gtk_label_set_wrap(label, 1);
		gtk_label_set_xalign(label, 0);
		return label;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		this._disconnect = connect(
			this.nativeViewProtected,
			'activate-link',
			(_label: any, uri: any) => {
				const href = interop.stringFromCString(uri).trim();
				if (LINK_SCHEMES.test(href)) {
					openUrl(href);
				}
				return true;
			},
			{ args: 1, returnsBool: true },
		);
	}

	disposeNativeView(): void {
		this._disconnect?.();
		super.disposeNativeView();
	}

	[htmlProperty.setNative](value: string) {
		gtk_label_set_markup(this.nativeViewProtected, htmlToMarkup(value));
		this.requestLayout();
	}

	[selectableProperty.setNative](value: boolean) {
		gtk_label_set_selectable(this.nativeViewProtected, value ? 1 : 0);
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}

	[linkColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'links', value instanceof Color ? `& link{color:${value.linux};}` : '');
	}

	[fontInternalProperty.setNative](value: Font) {
		setWidgetCss(this.nativeViewProtected, 'font', value instanceof Font ? (value as any).linuxCss : '');
	}
}
