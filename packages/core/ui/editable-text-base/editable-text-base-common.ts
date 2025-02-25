﻿import { EditableTextBase as EditableTextBaseDefinition } from '.';
import { TextBase } from '../text-base';
import { Property, CssProperty, makeValidator, makeParser } from '../core/properties';
import { PseudoClassHandler } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Style } from '../styling/style';
import { Color } from '../../color';
import { CoreTypes } from '../../core-types';
import { EventData } from '../../data/observable';

function focusChangeHandler(args: EventData): void {
	const view = args.object as EditableTextBase;

	if (args.eventName === 'focus') {
		view._addVisualState('focus');
		view._removeVisualState('blur');
	} else {
		view._addVisualState('blur');
		view._removeVisualState('focus');
	}
}

export abstract class EditableTextBase extends TextBase implements EditableTextBaseDefinition {
	public static blurEvent = 'blur';
	public static focusEvent = 'focus';
	public static textChangeEvent = 'textChange';

	public keyboardType: CoreTypes.KeyboardInputType;
	public returnKeyType: CoreTypes.ReturnKeyButtonType;
	public updateTextTrigger: CoreTypes.UpdateTextTriggerType;
	public autocapitalizationType: CoreTypes.AutocapitalizationInputType;
	public autofillType: CoreTypes.AutofillType;
	public editable: boolean;
	public autocorrect: boolean;
	public hint: string;
	public maxLength: number;
	public placeholderColor: Color;
	public valueFormatter: (value: string) => string;

	public abstract dismissSoftInput();
	public abstract _setInputType(inputType: number): void;
	public abstract setSelection(start: number, stop?: number);

	@PseudoClassHandler('focus', 'blur')
	_updateTextBaseFocusStateHandler(subscribe: boolean) {
		if (subscribe) {
			this.on('focus', focusChangeHandler);
			this.on('blur', focusChangeHandler);
		} else {
			this.off('focus', focusChangeHandler);
			this.off('blur', focusChangeHandler);

			this._removeVisualState('focus');
			this._removeVisualState('blur');
		}
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

const keyboardTypeConverter = makeParser<CoreTypes.KeyboardInputType>(makeValidator<CoreTypes.KeyboardInputType>(CoreTypes.KeyboardType.datetime, CoreTypes.KeyboardType.phone, CoreTypes.KeyboardType.number, CoreTypes.KeyboardType.url, CoreTypes.KeyboardType.email, CoreTypes.KeyboardType.integer), true);

export const autofillTypeProperty = new Property<EditableTextBase, CoreTypes.AutofillType>({ name: 'autofillType' });
autofillTypeProperty.register(EditableTextBase);

export const keyboardTypeProperty = new Property<EditableTextBase, CoreTypes.KeyboardInputType>({ name: 'keyboardType', valueConverter: keyboardTypeConverter });
keyboardTypeProperty.register(EditableTextBase);

const returnKeyTypeConverter = makeParser<CoreTypes.ReturnKeyButtonType>(makeValidator<CoreTypes.ReturnKeyButtonType>(CoreTypes.ReturnKeyType.done, CoreTypes.ReturnKeyType.next, CoreTypes.ReturnKeyType.go, CoreTypes.ReturnKeyType.search, CoreTypes.ReturnKeyType.send), true);

export const returnKeyTypeProperty = new Property<EditableTextBase, CoreTypes.ReturnKeyButtonType>({ name: 'returnKeyType', valueConverter: returnKeyTypeConverter });
returnKeyTypeProperty.register(EditableTextBase);

export const editableProperty = new Property<EditableTextBase, boolean>({
	name: 'editable',
	defaultValue: true,
	valueConverter: booleanConverter,
});
editableProperty.register(EditableTextBase);

export const updateTextTriggerProperty = new Property<EditableTextBase, CoreTypes.UpdateTextTriggerType>({ name: 'updateTextTrigger', defaultValue: CoreTypes.UpdateTextTrigger.textChanged });
updateTextTriggerProperty.register(EditableTextBase);

const autocapitalizationTypeConverter = makeParser<CoreTypes.AutocapitalizationInputType>(makeValidator<CoreTypes.AutocapitalizationInputType>(CoreTypes.AutocapitalizationType.none, CoreTypes.AutocapitalizationType.words, CoreTypes.AutocapitalizationType.sentences, CoreTypes.AutocapitalizationType.allCharacters), true);

export const autocapitalizationTypeProperty = new Property<EditableTextBase, CoreTypes.AutocapitalizationInputType>({
	name: 'autocapitalizationType',
	defaultValue: CoreTypes.AutocapitalizationType.sentences,
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
