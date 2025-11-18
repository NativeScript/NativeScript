import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';
import { colorConverter } from '../styling/style-properties';
import { Color } from '../../color';
import { HtmlView as HtmlViewDefinition } from '.';

@CSSType('HtmlView')
export class HtmlViewBase extends View implements HtmlViewDefinition {
	public html: string;
	public selectable: boolean;
	public linkColor: Color;
}

HtmlViewBase.prototype.recycleNativeView = 'auto';

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({
	name: 'html',
	defaultValue: '',
	affectsLayout: true,
});
htmlProperty.register(HtmlViewBase);

export const selectableProperty = new Property<HtmlViewBase, boolean>({
	name: 'selectable',
	defaultValue: true,
	valueConverter: booleanConverter,
});
selectableProperty.register(HtmlViewBase);

export const linkColorProperty = new Property<HtmlViewBase, Color>({
	name: 'linkColor',
	equalityComparer: Color.equals,
	valueConverter: colorConverter,
});
linkColorProperty.register(HtmlViewBase);
