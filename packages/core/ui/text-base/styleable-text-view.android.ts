import { Length } from '../styling/style-properties';
import type { Style } from '../styling/style';
import { layout } from '../../utils';
import type { View } from '../core/view';

/**
 * (Android only) For custom styling via onDraw
 */
@NativeClass()
export class StyleableTextView extends android.widget.TextView {
	owner: WeakRef<View>;

	constructor(context: android.content.Context) {
		super(context);

		return global.__native(this);
	}

	onDraw(canvas: android.graphics.Canvas): void {
		const owner = this.owner.get();
		const style = owner?.style;
		if (style?.textStroke) {
			this._applyStroke(canvas, style);
		}
		super.onDraw(canvas);
	}

	private _applyStroke(canvas: android.graphics.Canvas, style: Style) {
		// set paint to fill mode
		const p = this.getPaint();
		p.setStyle(android.text.TextPaint.Style.FILL);
		// draw the fill part of text
		super.onDraw(canvas);
		// stroke color and width
		p.setStyle(android.text.TextPaint.Style.STROKE);
		p.setStrokeWidth(layout.toDevicePixels(Length.toDevicePixels(style.textStroke.width)));
		this.setTextColor(style.textStroke.color.android);
		// draw stroke
		super.onDraw(canvas);
		// draw original text color fill back (fallback to white)
		p.setStyle(android.text.TextPaint.Style.FILL);
		this.setTextColor(style.color ? style.color.android : 0xffffffff);
	}
}
