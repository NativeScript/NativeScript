import { CssProperty } from '../core/properties';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';
import { Style } from '../styling/style';
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

export const linkColorProperty = new CssProperty<Style, Color>({
	name: 'linkColor',
	cssName: 'link-color',
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
linkColorProperty.register(Style);
