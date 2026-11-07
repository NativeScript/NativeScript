export * from './text-view-common';

import { TextViewBase } from './text-view-common';
import { editableProperty, hintProperty, maxLengthProperty } from '../editable-text-base';
import type { LinuxEditable } from '../editable-text-base/index.linux';
import { textAlignmentProperty } from '../text-base';
import { CoreTypes } from '../../core-types';
import { View } from '../core/view';
import { layout } from '../../utils';
import { connect } from '../../utils/gtk.linux';

/** GtkTextView in a GtkScrolledWindow that grows with its text until it is given a size. */
export class TextView extends TextViewBase {
	private _textView: any;
	private _buffer: any;
	private _start = new _GtkTextIter();
	private _end = new _GtkTextIter();

	createNativeView() {
		const scroll: any = gtk_scrolled_window_new();
		this._textView = gtk_text_view_new();
		this._buffer = gtk_text_view_get_buffer(this._textView);
		gtk_text_view_set_wrap_mode(this._textView, GtkWrapMode.WORD_CHAR);
		gtk_scrolled_window_set_policy(scroll, GtkPolicyType.NEVER, GtkPolicyType.AUTOMATIC);
		gtk_scrolled_window_set_propagate_natural_height(scroll, 1);
		gtk_scrolled_window_set_child(scroll, this._textView);
		return scroll;
	}

	get linux(): any {
		return this._textView;
	}

	get _editableWidget(): any {
		return this._textView;
	}

	public initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		(this as unknown as LinuxEditable)._disconnect.push(
			connect(this._buffer, 'changed', () => (owner.deref() as unknown as LinuxEditable)?._onNativeTextChanged()),
			// GtkTextView knows its real height only once its lines are validated (idle, after map):
			// re-measure when the content height (the vertical adjustment) changes
			connect(gtk_scrolled_window_get_vadjustment(this.nativeViewProtected), 'changed', () => {
				const view = owner.deref();
				if (view && (view.height === 'auto' || view.height == null)) {
					view.requestLayout();
				}
			}),
		);
		this._applyInputHints();
	}

	public disposeNativeView(): void {
		super.disposeNativeView();
		this._textView = this._buffer = null;
	}

	_getNativeText(): string {
		if (!this._buffer) {
			return '';
		}
		gtk_text_buffer_get_bounds(this._buffer, this._start as any, this._end as any);
		const text: any = gtk_text_buffer_get_text(this._buffer, this._start as any, this._end as any, 0);
		const value = interop.stringFromCString(text);
		g_free(text);
		return value;
	}

	_setNativeTextValue(text: string): void {
		gtk_text_buffer_set_text(this._buffer, text, -1);
	}

	_applyInputHints(): void {
		if (this._textView) {
			gtk_text_view_set_input_purpose(this._textView, (this as unknown as LinuxEditable)._inputPurpose());
			gtk_text_view_set_input_hints(this._textView, (this as unknown as LinuxEditable)._inputHints());
		}
	}

	public setSelection(start: number, stop?: number) {
		gtk_text_buffer_get_iter_at_offset(this._buffer, this._start as any, start);
		gtk_text_buffer_get_iter_at_offset(this._buffer, this._end as any, stop ?? start);
		gtk_text_buffer_select_range(this._buffer, this._start as any, this._end as any);
	}

	// the scrolled window's natural height isn't the text's: measure the text view
	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
		const size = this._textView ? layout.measureNativeView(this._textView, width, widthMode, height, heightMode) : { width: 0, height: 0 };
		const measureWidth = Math.min(Math.max(size.width, this.effectiveMinWidth), this.effectiveMaxWidth);
		const measureHeight = Math.min(Math.max(size.height, this.effectiveMinHeight), this.effectiveMaxHeight);
		this.setMeasuredDimension(View.resolveSizeAndState(measureWidth, width, widthMode, 0), View.resolveSizeAndState(measureHeight, height, heightMode, 0));
	}

	[editableProperty.setNative](value: boolean) {
		gtk_text_view_set_editable(this._textView, value ? 1 : 0);
		gtk_text_view_set_cursor_visible(this._textView, value ? 1 : 0);
	}

	// TODO(linux): GTK 4.6 text views have no placeholder
	[hintProperty.setNative](value: string) {}

	[maxLengthProperty.setNative](value: number) {}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		gtk_text_view_set_justification(this._textView, value === 'center' ? GtkJustification.CENTER : value === 'right' ? GtkJustification.RIGHT : GtkJustification.LEFT);
	}
}
