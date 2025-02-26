// Types
import { PropertyChangeData } from '../../data/observable';
import { ViewBase, booleanConverter } from '../core/view-base';
import { FontStyleType, FontWeightType } from '../styling/font-interfaces';

// Requires.
import { FormattedString } from './formatted-string';
import { Span } from './span';
import { View } from '../core/view';
import { Property, CssProperty, InheritedCssProperty, makeValidator, makeParser } from '../core/properties';
import { Style } from '../styling/style';
import { Observable } from '../../data/observable';
import { CoreTypes } from '../../core-types';
import { TextBase as TextBaseDefinition } from '.';
import { ShadowCSSValues, parseCSSShadow } from '../styling/css-shadow';
import { StrokeCSSValues, parseCSSStroke } from '../styling/css-stroke';

const CHILD_SPAN = 'Span';
const CHILD_FORMATTED_TEXT = 'formattedText';
const CHILD_FORMATTED_STRING = 'FormattedString';

export abstract class TextBaseCommon extends View implements TextBaseDefinition {
	public _isSingleLine: boolean;
	public text: string;
	public formattedText: FormattedString;
	public iosTextAnimation: 'inherit' | boolean;
	static iosTextAnimationFallback = true;

	/***
	 * In the NativeScript Core; by default the nativeTextViewProtected points to the same value as nativeViewProtected.
	 * At this point no internal NS components need this indirection functionality.
	 * This indirection is used to allow support usage by third party components so they don't have to duplicate functionality.
	 *
	 * A third party component can just override the `nativeTextViewProtected` getter and return a different internal view and that view would be
	 * what all TextView/TextInput class features would be applied to.
	 *
	 * A example is the Android MaterialDesign TextInput class, it has a wrapper view of a TextInputLayout
	 *    https://developer.android.com/reference/com/google/android/material/textfield/TextInputLayout
	 * which wraps the actual TextInput.  This wrapper layout (TextInputLayout) must be assigned to the nativeViewProtected as the entire
	 * NS Core uses nativeViewProtected for everything related to layout, so that it can be measured, added to the parent view as a child, ect.
	 *
	 * However, its internal view would be the actual TextView/TextInput and to allow that sub-view to have the normal TextView/TextInput
	 * class features, which we expose and to allow them to work on it, the internal TextView/TextInput is what the needs to have the class values applied to it.
	 *
	 * So all code that works on what is expected to be a TextView/TextInput should use `nativeTextViewProtected` so that any third party
	 * components that need to have two separate components can work properly without them having to duplicate all the TextBase (and decendants) functionality
	 * by just overriding the nativeTextViewProtected getter.
	 **/
	get nativeTextViewProtected() {
		return this.nativeViewProtected;
	}

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

	get fontStyle(): FontStyleType {
		return this.style.fontStyle;
	}
	set fontStyle(value: FontStyleType) {
		this.style.fontStyle = value;
	}

	get fontWeight(): FontWeightType {
		return this.style.fontWeight;
	}
	set fontWeight(value: FontWeightType) {
		this.style.fontWeight = value;
	}

	get letterSpacing(): number {
		return this.style.letterSpacing;
	}
	set letterSpacing(value: number) {
		this.style.letterSpacing = value;
	}

	get lineHeight(): number {
		return this.style.lineHeight;
	}
	set lineHeight(value: number) {
		this.style.lineHeight = value;
	}

	get maxLines(): CoreTypes.MaxLinesType {
		return this.style.maxLines;
	}
	set maxLines(value: CoreTypes.MaxLinesType) {
		this.style.maxLines = value;
	}

	get textAlignment(): CoreTypes.TextAlignmentType {
		return this.style.textAlignment;
	}
	set textAlignment(value: CoreTypes.TextAlignmentType) {
		this.style.textAlignment = value;
	}

	get textDecoration(): CoreTypes.TextDecorationType {
		return this.style.textDecoration;
	}
	set textDecoration(value: CoreTypes.TextDecorationType) {
		this.style.textDecoration = value;
	}

	get textTransform(): CoreTypes.TextTransformType {
		return this.style.textTransform;
	}
	set textTransform(value: CoreTypes.TextTransformType) {
		this.style.textTransform = value;
	}

	get textShadow(): ShadowCSSValues {
		return this.style.textShadow;
	}
	set textShadow(value: ShadowCSSValues) {
		this.style.textShadow = value;
	}

	get textStroke(): StrokeCSSValues {
		return this.style.textStroke;
	}

	set textStroke(value: StrokeCSSValues) {
		this.style.textStroke = value;
	}

	get whiteSpace(): CoreTypes.WhiteSpaceType {
		return this.style.whiteSpace;
	}
	set whiteSpace(value: CoreTypes.WhiteSpaceType) {
		this.style.whiteSpace = value;
	}

	get textOverflow(): CoreTypes.TextOverflowType {
		return this.style.textOverflow;
	}
	set textOverflow(value: CoreTypes.TextOverflowType) {
		this.style.textOverflow = value;
	}

	get padding(): string | CoreTypes.LengthType {
		return this.style.padding;
	}
	set padding(value: string | CoreTypes.LengthType) {
		this.style.padding = value;
	}

	get paddingTop(): CoreTypes.LengthType {
		return this.style.paddingTop;
	}
	set paddingTop(value: CoreTypes.LengthType) {
		this.style.paddingTop = value;
	}

	get paddingRight(): CoreTypes.LengthType {
		return this.style.paddingRight;
	}
	set paddingRight(value: CoreTypes.LengthType) {
		this.style.paddingRight = value;
	}

	get paddingBottom(): CoreTypes.LengthType {
		return this.style.paddingBottom;
	}
	set paddingBottom(value: CoreTypes.LengthType) {
		this.style.paddingBottom = value;
	}

	get paddingLeft(): CoreTypes.LengthType {
		return this.style.paddingLeft;
	}
	set paddingLeft(value: CoreTypes.LengthType) {
		this.style.paddingLeft = value;
	}

	public _onFormattedTextContentsChanged(data: PropertyChangeData) {
		if (this.nativeViewProtected) {
			// Notifications from the FormattedString start arriving before the Android view is even created.
			this[formattedTextProperty.setNative](data.value);
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (name === CHILD_SPAN) {
			if (!this.formattedText) {
				const formattedText = new FormattedString();
				formattedText.spans.push(value);
				this.formattedText = formattedText;
			} else {
				this.formattedText.spans.push(value);
			}
		} else if (name === CHILD_FORMATTED_TEXT || name === CHILD_FORMATTED_STRING) {
			this.formattedText = value;
		}
	}

	_requestLayoutOnTextChanged(): void {
		this.requestLayout();
	}

	eachChild(callback: (child: ViewBase) => boolean): void {
		const text = this.formattedText;
		if (text) {
			callback(text);
		}
	}

	_setNativeText(reset = false): void {
		//
	}
}

TextBaseCommon.prototype._isSingleLine = false;

export const textProperty = new Property<TextBaseCommon, string>({
	name: 'text',
	defaultValue: '',
	affectsLayout: __ANDROID__,
});
textProperty.register(TextBaseCommon);

export const formattedTextProperty = new Property<TextBaseCommon, FormattedString>({
	name: 'formattedText',
	affectsLayout: true,
	valueChanged: onFormattedTextPropertyChanged,
});
formattedTextProperty.register(TextBaseCommon);

export const iosTextAnimationProperty = new Property<TextBaseCommon, 'inherit' | boolean>({
	name: 'iosTextAnimation',
	defaultValue: 'inherit',
	affectsLayout: false,
	valueConverter(value: string) {
		try {
			return booleanConverter(value);
		} catch (e) {
			return 'inherit';
		}
	},
});
iosTextAnimationProperty.register(TextBaseCommon);

function onFormattedTextPropertyChanged(textBase: TextBaseCommon, oldValue: FormattedString, newValue: FormattedString) {
	if (oldValue) {
		oldValue.off(Observable.propertyChangeEvent, textBase._onFormattedTextContentsChanged, textBase);
		textBase._removeView(oldValue);
	}

	if (newValue) {
		const oldParent = newValue.parent;
		// In case formattedString is attached to new TextBase
		if (oldParent) {
			oldParent._removeView(newValue);
		}
		textBase._addView(newValue);
		newValue.on(Observable.propertyChangeEvent, textBase._onFormattedTextContentsChanged, textBase);
	}
}

export function getClosestPropertyValue<T>(property: CssProperty<any, T>, span: Span): T {
	if (property.isSet(span.style)) {
		return span.style[property.name];
	} else if (property.isSet(span.parent.style)) {
		// parent is FormattedString
		return span.parent.style[property.name];
	} else if (property.isSet(span.parent.parent.style)) {
		// parent.parent is TextBase
		return span.parent.parent.style[property.name];
	}
}

const textAlignmentConverter = makeParser<CoreTypes.TextAlignmentType>(makeValidator<CoreTypes.TextAlignmentType>('left', 'center', 'right', 'justify'));
export const textAlignmentProperty = new InheritedCssProperty<Style, CoreTypes.TextAlignmentType>({
	name: 'textAlignment',
	cssName: 'text-align',
	defaultValue: 'initial',
	valueConverter: textAlignmentConverter,
});
textAlignmentProperty.register(Style);

const textTransformConverter = makeParser<CoreTypes.TextTransformType>(makeValidator<CoreTypes.TextTransformType>('none', 'capitalize', 'uppercase', 'lowercase'));
export const textTransformProperty = new InheritedCssProperty<Style, CoreTypes.TextTransformType>({
	name: 'textTransform',
	cssName: 'text-transform',
	defaultValue: 'initial',
	valueConverter: textTransformConverter,
});
textTransformProperty.register(Style);

export const textShadowProperty = new InheritedCssProperty<Style, string | ShadowCSSValues>({
	name: 'textShadow',
	cssName: 'text-shadow',
	affectsLayout: __APPLE__,
	valueConverter: (value) => {
		return parseCSSShadow(value);
	},
});
textShadowProperty.register(Style);

export const textStrokeProperty = new InheritedCssProperty<Style, string | StrokeCSSValues>({
	name: 'textStroke',
	cssName: 'text-stroke',
	affectsLayout: __APPLE__,
	valueConverter: (value) => {
		return parseCSSStroke(value);
	},
});
textStrokeProperty.register(Style);

const whiteSpaceConverter = makeParser<CoreTypes.WhiteSpaceType>(makeValidator<CoreTypes.WhiteSpaceType>('normal', 'nowrap'));
export const whiteSpaceProperty = new InheritedCssProperty<Style, CoreTypes.WhiteSpaceType>({
	name: 'whiteSpace',
	cssName: 'white-space',
	defaultValue: 'initial',
	affectsLayout: __APPLE__,
	valueConverter: whiteSpaceConverter,
});
whiteSpaceProperty.register(Style);

const textOverflowConverter = makeParser<CoreTypes.TextOverflowType>(makeValidator<CoreTypes.TextOverflowType>('clip', 'ellipsis'));
export const textOverflowProperty = new CssProperty<Style, CoreTypes.TextOverflowType>({
	name: 'textOverflow',
	cssName: 'text-overflow',
	defaultValue: 'initial',
	affectsLayout: __APPLE__,
	valueConverter: textOverflowConverter,
});
textOverflowProperty.register(Style);

const textDecorationConverter = makeParser<CoreTypes.TextDecorationType>(makeValidator<CoreTypes.TextDecorationType>('none', 'underline', 'line-through', 'underline line-through'));
export const textDecorationProperty = new CssProperty<Style, CoreTypes.TextDecorationType>({
	name: 'textDecoration',
	cssName: 'text-decoration',
	defaultValue: 'none',
	valueConverter: textDecorationConverter,
});
textDecorationProperty.register(Style);

export const letterSpacingProperty = new InheritedCssProperty<Style, number>({
	name: 'letterSpacing',
	cssName: 'letter-spacing',
	defaultValue: 0,
	affectsLayout: __APPLE__,
	valueConverter: (v) => parseFloat(v),
});
letterSpacingProperty.register(Style);

export const lineHeightProperty = new InheritedCssProperty<Style, number>({
	name: 'lineHeight',
	cssName: 'line-height',
	affectsLayout: __APPLE__,
	valueConverter: (v) => parseFloat(v),
});
lineHeightProperty.register(Style);

export const maxLinesProperty = new CssProperty<Style, CoreTypes.MaxLinesType>({
	name: 'maxLines',
	cssName: 'max-lines',
	valueConverter: (v) => (v === 'none' ? 0 : parseInt(v, 10)),
});
maxLinesProperty.register(Style);

export const resetSymbol = Symbol('textPropertyDefault');
