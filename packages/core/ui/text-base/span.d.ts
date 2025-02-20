import { Color } from '../../color';
import { ViewBase } from '../core/view-base';
import { FontStyleType, FontVariationSettingsType, FontWeightType } from '../styling/font';
import { CoreTypes } from '../../core-types';
import { FormattedString } from './formatted-string';

/**
 * A class used to create a single part of formatted string with a common text properties.
 *
 * @nsView Span
 */
export class Span extends ViewBase {
	/**
	 * String value used when hooking to linkTap event.
	 *
	 * @nsEvent linkTap
	 */
	public static linkTapEvent: string;

	declare parent: FormattedString;

	/**
	 * Gets or sets the font family of the span.
	 *
	 * @nsProperty
	 */
	public fontFamily: string;

	/**
	 * Gets or sets the font size of the span.
	 *
	 *  @nsProperty
	 */
	public fontSize: number;

	/**
	 * Gets or sets the font style of the span.
	 *
	 *  @nsProperty
	 */
	public fontStyle: FontStyleType;

	/**
	 * Gets or sets the font weight of the span.
	 *
	 *  @nsProperty
	 */
	public fontWeight: FontWeightType;

	/**
	 * Gets or sets the font variation settings of the span.
	 *
	 *  @nsProperty
	 */
	public fontVariationSettings: FontVariationSettingsType[];

	/**
	 * Gets or sets text decorations for the span.
	 *
	 *  @nsProperty
	 */
	public textDecoration: CoreTypes.TextDecorationType;

	/**
	 * Gets or sets the font foreground color of the span.
	 *
	 *  @nsProperty
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color of the span.
	 *
	 *  @nsProperty
	 */
	public backgroundColor: Color;

	/**
	 * Defines whether accessibility font scale should affect font size.
	 *
	 *  @nsProperty
	 */
	iosAccessibilityAdjustsFontSize: boolean;

	/**
	 * Gets or sets the minimum accessibility font scale.
	 *
	 *  @nsProperty
	 */
	iosAccessibilityMinFontScale: number;

	/**
	 * Gets or sets the maximum accessibility font scale.
	 *
	 *  @nsProperty
	 */
	iosAccessibilityMaxFontScale: number;

	/**
	 * Gets or sets the text for the span.
	 *
	 *  @nsProperty
	 */
	public text: string;

	/**
	 * Gets if the span is tappable or not.
	 *
	 *  @nsProperty
	 */
	public readonly tappable: boolean;

	//@private
	/**
	 * @private
	 */
	_setTextInternal(value: string): void;
	//@endprivate
}
