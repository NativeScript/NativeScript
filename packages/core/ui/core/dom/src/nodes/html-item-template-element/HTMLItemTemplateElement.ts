import { View } from './../../../../view/index';
import { ContentView } from '../../../../../content-view';
import { DOMUtils } from '../../utils';
import HTMLElement from '../html-element/HTMLElement';
import { HTMLPropBaseElement } from '../html-prop-element/HTMLPropElement';
import NodeTypeEnum from '../node/NodeTypeEnum';

export class ItemTemplate extends ContentView {
	itemTemplateElement: HTMLItemTemplateElement;
	constructor(template: HTMLItemTemplateElement) {
		super();
		this.style.padding = '0, 0, 0, 0';
		this.style.margin = '0, 0, 0, 0';
		this.itemTemplateElement = template;
	}
}

class CreateViewEvent extends Event {
	public view: HTMLElement = undefined;
	constructor(eventInit?: EventInit) {
		super('createView', eventInit);
	}
}

class ItemLoadingEvent extends Event {
	public view: HTMLElement = undefined;
	public index: number = 0;
	public data: unknown = undefined;
	public item: unknown = undefined;
	constructor(eventInit?: EventInit) {
		super('itemLoading', eventInit);
	}
}

const hydrate = (source: HTMLElement, target: HTMLElement) => {
	if (process.env.NODE_ENV !== 'production') {
		if (!source.isNode || target.isNode) throw new TypeError('[DOM] Can only patch undom nodes!');
		if (target && source.constructor !== target.constructor) throw new TypeError('[DOM] Cannot patch different type of nodes!');
	}

	if (source.isElement) {
		let sourceNode = source.firstChild;
		let targetNode = target.firstChild;
		while (sourceNode) {
			if (!targetNode || targetNode.constructor !== sourceNode.constructor) {
				const clonedNode = hydrate(sourceNode as HTMLElement, sourceNode.cloneNode() as HTMLElement);
				if (targetNode) targetNode.replaceWith(clonedNode);
				else target.appendChild(clonedNode);
			} else {
				hydrate(sourceNode as HTMLElement, targetNode as HTMLElement);
			}

			sourceNode = sourceNode.nextSibling;
			if (targetNode) targetNode = targetNode.nextSibling;
		}

		while (targetNode) {
			targetNode.remove();
			targetNode = targetNode.nextSibling;
		}
	} else if (source.nodeType === NodeTypeEnum.textNode || source.nodeType === NodeTypeEnum.commentNode) {
		target._nodeValue = source._nodeValue;
	}

	DOMUtils.reassignObjectProperties((target as any)._observers, (source as any)._observers);
	DOMUtils.reassignObjectProperties((target as any)._captureObservers, (source as any)._captureObservers);
	return target;
};

const defaultCreateView = (self: HTMLItemTemplateElement) => {
	if (!self._content) return null;
	return hydrate(self._content, self._content.cloneNode() as HTMLElement);
};

export class HTMLItemTemplateElement extends HTMLPropBaseElement {
	_content: HTMLElement;
	_loadingEvents = new Map();
	constructor(key = 'itemTemplate') {
		super(key);
		this._type = 'key';
		this._value = () => this.createView();
	}

	set type(value: string) {
		if (process.env.NODE_ENV !== 'production') console.warn('[DOM] Cannot set type of a Template.');
		return;
	}

	set value(value: string) {
		if (process.env.NODE_ENV !== 'production') console.warn('[DOM] Cannot set value of a Template.');
		return;
	}

	get content() {
		return this._content;
	}
	set content(value: HTMLElement) {
		this._content = value;
	}
	private getLoadingEvent(view: HTMLElement) {
		if (this._loadingEvents.has(view)) return this._loadingEvents.get(view);
		const event = new ItemLoadingEvent();
		event.view = view;
		this._loadingEvents.set(view, event);
		return event;
	}

	patch({ view, index, item, data }: { view: HTMLElement; index: number; item: unknown; data: unknown }) {
		if (view.nodeType !== NodeTypeEnum.elementNode) return;
		if (this._content) return hydrate(this._content, view);

		const event = this.getLoadingEvent(view);
		event.index = index;
		event.item = item;
		event.data = data;
		this.dispatchEvent(event);

		return event.view || null;
	}

	createView() {
		const wrapper = new ItemTemplate(this);
		if (this._content) wrapper.content = defaultCreateView(this) as View;
		else {
			const event = new CreateViewEvent();
			this.dispatchEvent(event);
			wrapper.content = (event.view as never) || null;
		}
		return wrapper;
	}

	public setProp(): void {
		if (!(this.parentNode instanceof HTMLPropBaseElement)) return super.setProp();
	}

	insertBefore(newNode: HTMLElement, referenceNode: HTMLElement): HTMLElement {
		super.insertBefore(newNode, referenceNode);
		this._content = newNode;
		return newNode;
	}

	removeChild(node: any) {
		super.removeChild(node);
		if (this._content === node) this._content = null;
	}
}
