import { Property, LayoutBase, Builder } from '@nativescript/core';

Builder.knownTemplates.add('template');

export class TemplateView extends LayoutBase {
	public template: string;

	public static testEvent: string = 'test';

	public parseTemplate() {
		this.addChild(Builder.parse(this.template));
	}
}

export const templateProperty = new Property<TemplateView, string>({
	name: 'template',
	affectsLayout: true,
});
templateProperty.register(TemplateView);
