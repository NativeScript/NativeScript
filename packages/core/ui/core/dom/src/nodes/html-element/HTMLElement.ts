import { Style } from '../../../../../styling/style';
import Element from '../element/Element';

export default class HTMLElement extends Element {
	isElement: boolean = true;

	get style(): Style {
		return this['_style'] || (this['_style'] = new Style(new WeakRef(this) as any));
	}
	/**
	 * Determines if an element needs to be added to the native
	 * view hierarchy.
	 */
	isNativeElement: boolean = false;
	constructor() {
		super();
	}
}
