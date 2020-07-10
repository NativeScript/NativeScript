import { TextField as TextFieldDefinition } from '.';
import { EditableTextBase } from '../editable-text-base';
import { Property } from '../core/properties';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

@CSSType('TextField')
export class TextFieldBase extends EditableTextBase implements TextFieldDefinition {
	public static returnPressEvent = 'returnPress';
	public secure: boolean;
	public closeOnReturn: boolean;
	// iOS only (to avoid 12+ suggested strong password handling)
	public secureWithoutAutofill: boolean;
}

TextFieldBase.prototype.recycleNativeView = 'auto';

export const secureProperty = new Property<TextFieldBase, boolean>({
	name: 'secure',
	defaultValue: false,
	valueConverter: booleanConverter,
});
secureProperty.register(TextFieldBase);

export const closeOnReturnProperty = new Property<TextFieldBase, boolean>({
	name: 'closeOnReturn',
	defaultValue: true,
	valueConverter: booleanConverter,
});
closeOnReturnProperty.register(TextFieldBase);
