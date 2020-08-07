import { Color } from '../../color';
import { ViewBase } from '../core/view-base';
import { FontStyle, FontWeight } from '../styling/font';
import { TextDecoration } from '../text-base';

/**
 * A class used to create a single part of formatted string with a common text properties.
 */
export class Span extends ViewBase {
	/**
	 * Gets or sets the font family of the span.
	 */
	public fontFamily: string;

	/**
	 * Gets or sets the font size of the span.
	 */
	public fontSize: number;

	/**
	 * Gets or sets the font style of the span.
	 */
	public fontStyle: FontStyle;

	/**
	 * Gets or sets the font weight of the span.
	 */
	public fontWeight: FontWeight;

	/**
	 * Gets or sets text decorations for the span.
	 */
	public textDecoration: TextDecoration;

	/**
	 * Gets or sets the font foreground color of the span.
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color of the span.
	 */
	public backgroundColor: Color;

	/**
	 * Gets or sets the text for the span.
	 */
	public text: string;
	/**
	 * String value used when hooking to linkTap event.
	 */
	public static linkTapEvent: string;

	/**
	 * Gets if the span is tappable or not.
	 */
	public readonly tappable: boolean;

	//@private
	/**
	 * @private
	 */
	_setTextInternal(value: string): void;
	//@endprivate
}
