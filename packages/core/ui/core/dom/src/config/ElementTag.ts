import { HTMLArrayPropElement, HTMLKeyPropElement } from '../nodes/html-prop-element/HTMLPropElement';
import HTMLSlotElement from '../nodes/html-slot-element/HTMLSlotElement';
import HTMLTemplateElement from '../nodes/html-template-element/HTMLTemplateElement';
import { HTMLItemTemplateElement } from '../nodes/html-item-template-element/HTMLItemTemplateElement';

export default {
	template: HTMLTemplateElement,
	itemtemplate: HTMLItemTemplateElement,
	slot: HTMLSlotElement,
	keyprop: HTMLKeyPropElement,
	arrayprop: HTMLArrayPropElement,
};
