import { Color } from '../../color';
import { ViewBase } from '../core/view-base';
import { FontStyleType, FontVariationSettingsType, FontWeightType } from '../styling/font';
import { CoreTypes } from '../../core-types';

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
	public fontStyle: FontStyleType;

	/**
	 * Gets or sets the font weight of the span.
	 */
	public fontWeight: FontWeightType;

	/**
	 * Gets or sets the font variation settings of the span.
	 */
	public fontVariationSettings: FontVariationSettingsType[];

	/**
	 * Gets or sets text decorations for the span.
	 */
	public textDecoration: CoreTypes.TextDecorationType;

	/**
	 * Gets or sets the font foreground color of the span.
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color of the span.
	 */
	public backgroundColor: Color;

	/**
	 * Defines whether accessibility font scale should affect font size.
	 */
	iosAccessibilityAdjustsFontSize: boolean;

	/**
	 * Gets or sets the minimum accessibility font scale.
	 */
	iosAccessibilityMinFontScale: number;

	/**
	 * Gets or sets the maximum accessibility font scale.
	 */
	iosAccessibilityMaxFontScale: number;

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
