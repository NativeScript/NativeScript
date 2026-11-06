export * from './editable-text-base-common';

import { EditableTextBase as EditableTextBaseCommon } from './editable-text-base-common';

// TODO(linux): GtkEditable wiring (text changes, hints, keyboard types).
export abstract class EditableTextBase extends EditableTextBaseCommon {
	public dismissSoftInput() {}

	public _setInputType(inputType: number): void {}

	public setSelection(start: number, stop?: number) {}
}
