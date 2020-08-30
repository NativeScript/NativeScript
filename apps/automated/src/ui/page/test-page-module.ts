import * as PageModule from '@nativescript/core/ui/page';
import * as LabelModule from '@nativescript/core/ui/label';

export class TestPageModule extends PageModule.Page {
	constructor() {
		super();

		var label = new LabelModule.Label();
		label.text = 'Label created within a page module.';

		this.content = label;
	}
}

export function createPage() {
	return new TestPageModule();
}

//export var Page = new TestPageModule();
