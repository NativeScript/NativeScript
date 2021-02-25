import { EditableTextBase as EditableTextBaseDefinition } from '.';
import { TextBase } from '../text-base';
import { Property, CssProperty, makeValidator, makeParser } from '../core/properties';
import { PseudoClassHandler } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Style } from '../styling/style';
import { Color } from '../../color';
import { Enums } from '../enums';

export abstract class EditableTextBase extends TextBase implements EditableTextBaseDefinition {
	public static blurEvent = 'blur';
	public static focusEvent = 'focus';
	public static textChangeEvent = 'textChange';

	public keyboardType: Enums.KeyboardInputType;
	public returnKeyType: Enums.ReturnKeyButtonType;
	public updateTextTrigger: Enums.UpdateTextTriggerType;
	public autocapitalizationType: Enums.AutocapitalizationInputType;
	public editable: boolean;
	public autocorrect: boolean;
	public hint: string;
	public maxLength: number;

	public abstract dismissSoftInput();
	public abstract _setInputType(inputType: number): void;
	public abstract setSelection(start: number, stop?: number);

	private _focusHandler = () => this._goToVisualState('focus');
	private _blurHandler = () => this._goToVisualState('blur');

	@PseudoClassHandler('focus', 'blur')
	_updateTextBaseFocusStateHandler(subscribe) {
		const method = subscribe ? 'on' : 'off';

		this[method]('focus', this._focusHandler);
		this[method]('blur', this._blurHandler);
	}
}

// TODO: Why not name it - hintColor property??
// TODO: Or rename hintProperty to 'placeholder' and make it CSSProperty??
// https://developer.mozilla.org/en-US/docs/Web/CSS/:-moz-placeholder
export const placeholderColorProperty = new CssProperty<Style, Color>({
	name: 'placeholderColor',
	cssName: 'placeholder-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
placeholderColorProperty.register(Style);

const keyboardTypeConverter = makeParser<Enums.KeyboardInputType>(makeValidator<Enums.KeyboardInputType>(Enums.KeyboardType.datetime, Enums.KeyboardType.phone, Enums.KeyboardType.number, Enums.KeyboardType.url, Enums.KeyboardType.email, Enums.KeyboardType.integer));

export const keyboardTypeProperty = new Property<EditableTextBase, Enums.KeyboardInputType>({ name: 'keyboardType', valueConverter: keyboardTypeConverter });
keyboardTypeProperty.register(EditableTextBase);

const returnKeyTypeConverter = makeParser<Enums.ReturnKeyButtonType>(makeValidator<Enums.ReturnKeyButtonType>(Enums.ReturnKeyType.done, Enums.ReturnKeyType.next, Enums.ReturnKeyType.go, Enums.ReturnKeyType.search, Enums.ReturnKeyType.send));

export const returnKeyTypeProperty = new Property<EditableTextBase, Enums.ReturnKeyButtonType>({ name: 'returnKeyType', valueConverter: returnKeyTypeConverter });
returnKeyTypeProperty.register(EditableTextBase);

export const editableProperty = new Property<EditableTextBase, boolean>({
	name: 'editable',
	defaultValue: true,
	valueConverter: booleanConverter,
});
editableProperty.register(EditableTextBase);

export const updateTextTriggerProperty = new Property<EditableTextBase, Enums.UpdateTextTriggerType>({ name: 'updateTextTrigger', defaultValue: Enums.UpdateTextTrigger.textChanged });
updateTextTriggerProperty.register(EditableTextBase);

const autocapitalizationTypeConverter = makeParser<Enums.AutocapitalizationInputType>(makeValidator<Enums.AutocapitalizationInputType>(Enums.AutocapitalizationType.none, Enums.AutocapitalizationType.words, Enums.AutocapitalizationType.sentences, Enums.AutocapitalizationType.allCharacters));

export const autocapitalizationTypeProperty = new Property<EditableTextBase, Enums.AutocapitalizationInputType>({
	name: 'autocapitalizationType',
	defaultValue: Enums.AutocapitalizationType.sentences,
	valueConverter: autocapitalizationTypeConverter,
});
autocapitalizationTypeProperty.register(EditableTextBase);

export const autocorrectProperty = new Property<EditableTextBase, boolean>({
	name: 'autocorrect',
	valueConverter: booleanConverter,
});
autocorrectProperty.register(EditableTextBase);

export const hintProperty = new Property<EditableTextBase, string>({
	name: 'hint',
	defaultValue: '',
});
hintProperty.register(EditableTextBase);

export const maxLengthProperty = new Property<EditableTextBase, number>({
	name: 'maxLength',
	defaultValue: Number.POSITIVE_INFINITY,
	valueConverter: parseInt,
});
maxLengthProperty.register(EditableTextBase);
