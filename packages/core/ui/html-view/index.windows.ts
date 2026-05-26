export * from './html-view-common';

import { Color } from '../../color';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { HtmlViewBase, htmlProperty, selectableProperty, linkColorProperty } from './html-view-common';

type HtmlToken =
	| { kind: 'text'; text: string }
	| { kind: 'open'; tag: string; attrs: Record<string, string> }
	| { kind: 'close'; tag: string }
	| { kind: 'void'; tag: string };

const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);

function tokenize(html: string): HtmlToken[] {
	const tokens: HtmlToken[] = [];
	const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?)\s*>/g;
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		if (m.index > last) {
			tokens.push({ kind: 'text', text: html.slice(last, m.index) });
		}
		const [, closing, rawTag, attrStr, selfClose] = m;
		const tag = rawTag.toLowerCase();
		if (closing) {
			tokens.push({ kind: 'close', tag });
		} else if (selfClose || VOID_TAGS.has(tag)) {
			tokens.push({ kind: 'void', tag });
		} else {
			tokens.push({ kind: 'open', tag, attrs: parseAttrs(attrStr) });
		}
		last = re.lastIndex;
	}
	if (last < html.length) {
		tokens.push({ kind: 'text', text: html.slice(last) });
	}
	return tokens;
}

function parseAttrs(s: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	const re = /([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(s)) !== null) {
		attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
	}
	return attrs;
}

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
		.replace(/&nbsp;/g, ' ');
}

type InlineParent = Windows.UI.Xaml.Documents.Paragraph | Windows.UI.Xaml.Documents.Span;

function buildParagraphs(html: string, linkColor?: Color): Windows.UI.Xaml.Documents.Paragraph[] {
	const tokens = tokenize(html);
	const paragraphs: Windows.UI.Xaml.Documents.Paragraph[] = [];
	let para = new Windows.UI.Xaml.Documents.Paragraph();
	paragraphs.push(para);
	const stack: InlineParent[] = [para];

	const top = () => stack[stack.length - 1];

	function appendInline(inline: Windows.UI.Xaml.Documents.Inline): void {
		top().Inlines.Append(inline);
	}

	function pushSpan(span: Windows.UI.Xaml.Documents.Span): void {
		appendInline(span as unknown as Windows.UI.Xaml.Documents.Inline);
		stack.push(span);
	}

	for (const token of tokens) {
		switch (token.kind) {
			case 'text': {
				const text = decodeEntities(token.text);
				if (text) {
					const run = new Windows.UI.Xaml.Documents.Run();
					run.Text = text;
					appendInline(run);
				}
				break;
			}
			case 'void':
				if (token.tag === 'br') {
					appendInline(new Windows.UI.Xaml.Documents.LineBreak());
				}
				break;
			case 'open':
				switch (token.tag) {
					case 'p': {
						para = new Windows.UI.Xaml.Documents.Paragraph();
						paragraphs.push(para);
						stack.length = 1;
						stack[0] = para;
						break;
					}
					case 'b':
					case 'strong':
						pushSpan(new Windows.UI.Xaml.Documents.Bold());
						break;
					case 'i':
					case 'em':
						pushSpan(new Windows.UI.Xaml.Documents.Italic());
						break;
					case 'u':
						pushSpan(new Windows.UI.Xaml.Documents.Underline());
						break;
					case 'a': {
						const link = new Windows.UI.Xaml.Documents.Hyperlink();
						const href = (token as { kind: 'open'; tag: string; attrs: Record<string, string> }).attrs['href'];
						if (href) {
							try { link.NavigateUri = new Windows.Foundation.Uri(href); } catch (_) { }
						}
						if (linkColor) {
							link.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(linkColor.windows);
						}
						pushSpan(link);
						break;
					}
					case 'span':
						pushSpan(new Windows.UI.Xaml.Documents.Span());
						break;
				}
				break;
			case 'close':
				switch (token.tag) {
					case 'p': {
						para = new Windows.UI.Xaml.Documents.Paragraph();
						paragraphs.push(para);
						stack.length = 1;
						stack[0] = para;
						break;
					}
					case 'b':
					case 'strong':
					case 'i':
					case 'em':
					case 'u':
					case 'a':
					case 'span':
						if (stack.length > 1) stack.pop();
						break;
				}
				break;
		}
	}

	const nonEmpty = paragraphs.filter(p => p.Inlines.Size > 0);
	return nonEmpty.length > 0 ? nonEmpty : [paragraphs[0]];
}

export class HtmlView extends HtmlViewBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.RichTextBlock;

	public createNativeView() {
		const nativeView = new Windows.UI.Xaml.Controls.RichTextBlock();
		nativeView.IsTextSelectionEnabled = true;
		return nativeView;
	}

	get windows(): Windows.UI.Xaml.Controls.RichTextBlock {
		return this.nativeViewProtected;
	}

	private _rebuildBlocks(): void {
		const native = this.nativeViewProtected;
		native.Blocks.Clear();
		for (const p of buildParagraphs(this.html ?? '', this.linkColor)) {
			native.Blocks.Append(p);
		}
	}

	[htmlProperty.getDefault](): string {
		return '';
	}
	[htmlProperty.setNative](_value: string) {
		this._rebuildBlocks();
	}

	[selectableProperty.getDefault](): boolean {
		return true;
	}
	[selectableProperty.setNative](value: boolean) {
		this.nativeViewProtected.IsTextSelectionEnabled = value;
	}

	[colorProperty.getDefault](): Windows.UI.Xaml.Media.Brush {
		return this.nativeViewProtected.Foreground;
	}
	[colorProperty.setNative](value: Color | Windows.UI.Xaml.Media.Brush) {
		this.nativeViewProtected.Foreground = value instanceof Color
			? new Windows.UI.Xaml.Media.SolidColorBrush(value.windows)
			: value;
	}

	[linkColorProperty.setNative](_value: Color) {
		this._rebuildBlocks();
	}

	[fontInternalProperty.setNative](value: any) {
		const native = this.nativeViewProtected as any;
		value?.applyWindowsFont?.(native);
	}
}
