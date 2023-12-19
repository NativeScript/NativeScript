import { CSSComputedStyleProperty } from './css-agent';
import { InspectorEvents } from './devtools-elements-interfaces';

// Needed for typings only
import { ViewBase } from '../ui/core/view-base';

const registeredDomNodes = {};
const ELEMENT_NODE_TYPE = 1;
const ROOT_NODE_TYPE = 9;
const propertyBlacklist = ['effectivePaddingLeft', 'effectivePaddingBottom', 'effectivePaddingRight', 'effectivePaddingTop', 'effectiveBorderTopWidth', 'effectiveBorderRightWidth', 'effectiveBorderBottomWidth', 'effectiveBorderLeftWidth', 'effectiveMinWidth', 'effectiveMinHeight', 'effectiveWidth', 'effectiveHeight', 'effectiveMarginLeft', 'effectiveMarginTop', 'effectiveMarginRight', 'effectiveMarginBottom', 'nodeName', 'nodeType', 'decodeWidth', 'decodeHeight', 'ng-reflect-items', 'domNode', 'touchListenerIsSet', 'bindingContext', 'nativeView'];

function lazy<T>(action: () => T): () => T {
	let _value: T;

	return () => _value || (_value = action());
}
const percentLengthToStringLazy = lazy<(length) => string>(() => require('../ui/styling/style-properties').PercentLength.convertToString);
const getSetPropertiesLazy = lazy<(view: ViewBase) => [string, any][]>(() => require('../ui/core/properties').getSetProperties);
const getComputedCssValuesLazy = lazy<(view: ViewBase) => [string, any][]>(() => require('../ui/core/properties').getComputedCssValues);

export function registerInspectorEvents(inspector: InspectorEvents) {
	inspectorFrontendInstance = inspector;
}

let inspectorFrontendInstance: any;
function notifyInspector(callback: (inspector: InspectorEvents) => void) {
	if (inspectorFrontendInstance) {
		callback(inspectorFrontendInstance);
	}
}

function valueToString(value: any): string {
	if (typeof value === 'undefined' || value === null) {
		return '';
	} else if (typeof value === 'object' && value.unit) {
		return percentLengthToStringLazy()(value);
	} else {
		return value + '';
	}
}

function propertyFilter([name, value]: [string, any]): boolean {
	if (name[0] === '_') {
		return false;
	}

	if (value !== null && typeof value === 'object') {
		return false;
	}

	if (propertyBlacklist.indexOf(name) >= 0) {
		return false;
	}

	return true;
}

function registerNode(domNode: DOMNode) {
	registeredDomNodes[domNode.nodeId] = domNode;
}

function unregisterNode(domNode: DOMNode) {
	delete registeredDomNodes[domNode.nodeId];
}

export function getNodeById(id: number): DOMNode {
	return registeredDomNodes[id];
}

export class DOMNode {
	nodeId;
	nodeType;
	nodeName;
	localName;
	nodeValue = '';
	attributes: string[] = [];
	viewRef: WeakRef<ViewBase>;

	constructor(view: ViewBase) {
		this.viewRef = new WeakRef(view);
		this.nodeType = view.typeName === 'Frame' ? ROOT_NODE_TYPE : ELEMENT_NODE_TYPE;
		this.nodeId = view._domId;
		this.nodeName = view.typeName;
		this.localName = this.nodeName;

		// Load all attributes
		this.loadAttributes();

		registerNode(this);
	}

	public loadAttributes() {
		this.attributes = [];
		getSetPropertiesLazy()(this.viewRef.deref())
			.filter(propertyFilter)
			.forEach((pair) => this.attributes.push(pair[0], pair[1] + ''));
	}

	get children(): DOMNode[] {
		const view = this.viewRef.deref();
		if (!view) {
			return [];
		}

		const res = [];

		view.eachChild((child) => {
			child.ensureDomNode();
			res.push(child.domNode);

			return true;
		});

		return res;
	}

	onChildAdded(childView: ViewBase): void {
		notifyInspector((ins) => {
			const view = this.viewRef.deref();

			let previousChild: ViewBase;
			view.eachChild((child) => {
				if (child === childView) {
					return false;
				}

				previousChild = child;

				return true;
			});
			const index = previousChild ? previousChild._domId : 0;

			childView.ensureDomNode();
			ins.childNodeInserted(this.nodeId, index, childView.domNode);
		});
	}

	onChildRemoved(view: ViewBase): void {
		notifyInspector((ins) => {
			ins.childNodeRemoved(this.nodeId, view._domId);
		});
	}

	attributeModified(name: string, value: any) {
		notifyInspector((ins) => {
			if (propertyBlacklist.indexOf(name) < 0) {
				ins.attributeModified(this.nodeId, name, valueToString(value));
			}
		});
	}

	attributeRemoved(name: string) {
		notifyInspector((ins) => {
			ins.attributeRemoved(this.nodeId, name);
		});
	}

	getComputedProperties(): CSSComputedStyleProperty[] {
		const view = this.viewRef.deref();
		if (!view) {
			return [];
		}

		const result = getComputedCssValuesLazy()(view)
			.filter((pair) => pair[0][0] !== '_')
			.map((pair) => {
				return {
					name: pair[0],
					value: valueToString(pair[1]),
				};
			});

		return result;
	}

	dispose() {
		unregisterNode(this);
		// this.viewRef.clear();
	}

	public toObject() {
		return {
			nodeId: this.nodeId,
			nodeType: this.nodeType,
			nodeName: this.nodeName,
			localName: this.localName,
			nodeValue: this.nodeValue,
			children: this.children.map((c) => c.toObject()),
			attributes: this.attributes,
			backendNodeId: 0,
		};
	}
}
