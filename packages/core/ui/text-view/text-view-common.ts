import { TextView as TextViewDefinition } from '.';
import { EditableTextBase } from '../editable-text-base';
import { Property } from '../core/properties';

export class TextViewBase extends EditableTextBase implements TextViewDefinition {
	public maxLines: number;
}

export const maxLinesProperty = new Property<EditableTextBase, number>({
	name: 'maxLines',
	valueConverter: parseInt,
});
maxLinesProperty.register(EditableTextBase);
