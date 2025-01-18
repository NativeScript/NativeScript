import { Property } from '../core/properties';
import { booleanConverter } from '../core/view-base';
import { TextView as TextViewDefinition } from '.';
import { EditableTextBase } from '../editable-text-base';

export class TextViewBase extends EditableTextBase implements TextViewDefinition {
	public static returnPressEvent = 'returnPress';

	public maxLines: number;
	public isWritingToolsActive: boolean;
	public enableWritingToolsEvents: boolean;
}

/**
 * (iOS Only) Behavior for Apple Intelligence Writing Tools
 * @since 8.9
 */
export enum WritingToolsBehavior {
	Complete,
	Default,
	Limited,
	None,
}
export const iosWritingToolsBehaviorProperty = new Property<TextViewBase, WritingToolsBehavior>({
	name: 'iosWritingToolsBehavior',
	defaultValue: WritingToolsBehavior.Default,
});
iosWritingToolsBehaviorProperty.register(TextViewBase);

/**
 * (iOS Only) Allowed input for Apple Intelligence Writing Tools
 * @since 8.9
 */
export enum WritingToolsAllowedInput {
	Default,
	List,
	PlainText,
	RichText,
	Table,
}
export const iosWritingToolsAllowedInputProperty = new Property<TextViewBase, Array<WritingToolsAllowedInput>>({
	name: 'iosWritingToolsAllowedInput',
	defaultValue: [WritingToolsAllowedInput.Default],
});
iosWritingToolsAllowedInputProperty.register(TextViewBase);
