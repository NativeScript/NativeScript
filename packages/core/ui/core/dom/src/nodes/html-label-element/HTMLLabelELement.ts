import { Label } from '../../../../../label';
import HTMLElement from '../html-element/HTMLElement';

/**
 * HTML Label Element.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement.
 */
export class HTMLLabelElement extends Label {
	/**
	 * Returns a string containing the ID of the labeled control. This reflects the "for" attribute.
	 *
	 * @returns ID of the labeled control.
	 */
	public get htmlFor(): string {
		return '';
	}

	/**
	 * Sets a string containing the ID of the labeled control. This reflects the "for" attribute.
	 *
	 * @param htmlFor ID of the labeled control.
	 */
	public set htmlFor(htmlFor: string) {
		//this.setAttribute('for', htmlFor);
	}

	/**
	 * Returns an HTML element representing the control with which the label is associated.
	 *
	 * @returns Control element.
	 */
	public get control(): HTMLElement {
		return null;
	}

	/**
	 * Returns the parent form element.
	 *
	 * @returns Form.
	 */
	public get form(): any {
		return null;
	}

	/**
	 * Clones a node.
	 *
	 * @override
	 * @param [deep=false] "true" to clone deep.
	 * @returns Cloned node.
	 */
	public cloneNode(deep = false): HTMLLabelElement {
		return <HTMLLabelElement>super.cloneNode(deep);
	}
}
