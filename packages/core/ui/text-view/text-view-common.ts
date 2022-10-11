import { TextView as TextViewDefinition } from '.';
import { EditableTextBase } from '../editable-text-base';

export class TextViewBase extends EditableTextBase implements TextViewDefinition {
	public static returnPressEvent = 'returnPress';
	public maxLines: number;
}
