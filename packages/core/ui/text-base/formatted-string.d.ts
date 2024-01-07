/**
 * Contains the FormattedString and Span classes, which are used to create a formatted (rich text) strings.
 */

import { Span } from './span';
import { ObservableArray } from '../../data/observable-array';
import { ViewBase } from '../core/view-base';
import { Color } from '../../color';
import { FontStyleType, FontVariationSettingsType, FontWeightType } from '../styling/font';
import { CoreTypes } from '../../core-types';

/**
 * A class used to create a formatted (rich text) string.
 */
export class FormattedString extends ViewBase {
	/**
	 * An observable collection of Span objects used to define common text properties.
	 */
	public spans: ObservableArray<Span>;

	/**
	 * A human readable representation of the formatted string.
	 */
	public toString(): string;

	/**
	 * Gets or sets the font family which will be used for all spans that doesn't have a specific value.
	 */
	public fontFamily: string;

	/**
	 * Gets or sets the font size which will be used for all spans that doesn't have a specific value.
	 */
	public fontSize: number;

	/**
	 * Gets or sets the font style which will be used for all spans that doesn't have a specific value.
	 */
	public fontStyle: FontStyleType;

	/**
	 * Gets or sets the font weight which will be used for all spans that doesn't have a specific value.
	 */
	public fontWeight: FontWeightType;

	/**
	 * Gets or sets the font variation settings which will be used for all spans that doesn't have a specific value.
	 */
	public fontVariationSettings: FontVariationSettingsType[];

	/**
	 * Gets or sets text decorations which will be used for all spans that doesn't have a specific value.
	 */
	public textDecoration: CoreTypes.TextDecorationType;

	/**
	 * Gets or sets the font foreground color which will be used for all spans that doesn't have a specific value.
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color which will be used for all spans that doesn't have a specific value.
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
}
