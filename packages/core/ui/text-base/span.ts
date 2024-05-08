import { Color } from '../../color';
import { Span as SpanDefinition } from './span';
import { ViewBase } from '../core/view-base';
import { FontStyleType, FontVariationSettingsType, FontWeightType } from '../styling/font';
import { CoreTypes } from '../../core-types';
import { EventData } from '../../data/observable';
import { isNullOrUndefined, isString } from '../../utils/types';

export class Span extends ViewBase implements SpanDefinition {
	static linkTapEvent = 'linkTap';
	private _text: string;
	private _tappable = false;

	get fontFamily(): string {
		return this.style.fontFamily;
	}
	set fontFamily(value: string) {
		this.style.fontFamily = value;
	}

	get fontSize(): number {
		return this.style.fontSize;
	}
	set fontSize(value: number) {
		this.style.fontSize = value;
	}

	// Italic
	get fontStyle(): FontStyleType {
		return this.style.fontStyle;
	}
	set fontStyle(value: FontStyleType) {
		this.style.fontStyle = value;
	}

	// Bold
	get fontWeight(): FontWeightType {
		return this.style.fontWeight;
	}
	set fontWeight(value: FontWeightType) {
		this.style.fontWeight = value;
	}

	get fontVariationSettings(): FontVariationSettingsType[] {
		return this.style.fontVariationSettings;
	}
	set fontVariationSettings(value: FontVariationSettingsType[]) {
		this.style.fontVariationSettings = value;
	}

	get textDecoration(): CoreTypes.TextDecorationType {
		return this.style.textDecoration;
	}
	set textDecoration(value: CoreTypes.TextDecorationType) {
		this.style.textDecoration = value;
	}

	get color(): Color {
		return this.style.color;
	}
	set color(value: Color) {
		this.style.color = value;
	}

	get backgroundColor(): Color {
		return this.style.backgroundColor;
	}
	set backgroundColor(value: Color) {
		this.style.backgroundColor = value;
	}

	get iosAccessibilityAdjustsFontSize(): boolean {
		return this.style.iosAccessibilityAdjustsFontSize;
	}
	set iosAccessibilityAdjustsFontSize(value: boolean) {
		this.style.iosAccessibilityAdjustsFontSize = value;
	}

	get iosAccessibilityMinFontScale(): number {
		return this.style.iosAccessibilityMinFontScale;
	}
	set iosAccessibilityMinFontScale(value: number) {
		this.style.iosAccessibilityMinFontScale = value;
	}

	get iosAccessibilityMaxFontScale(): number {
		return this.style.iosAccessibilityMaxFontScale;
	}
	set iosAccessibilityMaxFontScale(value: number) {
		this.style.iosAccessibilityMaxFontScale = value;
	}

	get text(): string {
		return this._text;
	}
	set text(value: string) {
		if (this._text !== value) {
			if (isNullOrUndefined(value)) {
				this._text = '';
			} else {
				// value can be a number
				this._text = isString(value) ? `${value}`.replace('\\n', '\n').replace('\\t', '\t') : `${value}`;
			}
			this.notifyPropertyChange('text', this._text);
		}
	}

	get tappable(): boolean {
		return this._tappable;
	}

	addEventListener(arg: string, callback: (data: EventData) => void, options?: AddEventListenerOptions | boolean, thisArg?: any): void {
		super.addEventListener(arg, callback, options, thisArg);
		this._setTappable(this.hasListeners(Span.linkTapEvent));
	}

	removeEventListener(arg: string, callback?: (data: EventData) => void, options?: EventListenerOptions | boolean, thisArg?: any): void {
		super.removeEventListener(arg, callback, options, thisArg);
		this._setTappable(this.hasListeners(Span.linkTapEvent));
	}

	_setTextInternal(value: string): void {
		this._text = value;
	}

	private _setTappable(value: boolean): void {
		if (this._tappable !== value) {
			this._tappable = value;
			this.notifyPropertyChange('tappable', value);
		}
	}
}
