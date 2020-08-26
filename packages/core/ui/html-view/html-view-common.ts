import { CssProperty } from '../core/properties';
import { View, CSSType } from '../core/view';
import { Property } from '../core/properties';
import { Style } from '../styling/style';
import { Color } from '../../color';
import { HtmlView as HtmlViewDefinition } from '.';

@CSSType('HtmlView')
export class HtmlViewBase extends View implements HtmlViewDefinition {
	public html: string;
}

HtmlViewBase.prototype.recycleNativeView = 'auto';

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({
	name: 'html',
	defaultValue: '',
	affectsLayout: true,
});
htmlProperty.register(HtmlViewBase);

export const linkColorProperty = new CssProperty<Style, Color>({
	name: 'linkColor',
	cssName: 'link-color',
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
linkColorProperty.register(Style);
