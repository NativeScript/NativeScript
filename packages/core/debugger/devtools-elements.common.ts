// Types
import { ViewBase } from '../ui/core/view-base';

//Requires
import { getNodeById } from './dom-node';
import { mainThreadify } from '../utils';

// Use lazy requires for core modules
const getAppRootView = () => require('../application').getRootView();

let unsetValue;
function unsetViewValue(view, name) {
	if (!unsetValue) {
		unsetValue = require('../ui/core/properties').unsetValue;
	}

	view[name] = unsetValue;
}

function getViewById(nodeId: number): ViewBase {
	const node = getNodeById(nodeId);
	let view;
	if (node) {
		view = node.viewRef.deref();
	}

	return view;
}

export function getDocument() {
	const appRoot = getAppRootView();
	if (!appRoot) {
		return undefined;
	}

	try {
		appRoot.ensureDomNode();
	} catch (e) {
		console.log('ERROR in getDocument(): ' + e);
	}

	return appRoot.domNode.toObject();
}

export function getComputedStylesForNode(nodeId): Array<{ name: string; value: string }> {
	const view = getViewById(nodeId);
	if (view) {
		return view.domNode.getComputedProperties();
	}

	return [];
}

export const removeNode = mainThreadify(function removeNode(nodeId) {
	const view = getViewById(nodeId);
	if (view) {
		// Avoid importing layout and content view
		const parent = <any>view.parent;
		if (parent.removeChild) {
			parent.removeChild(view);
		} else if (parent.content === view) {
			parent.content = null;
		} else {
			console.log("Can't remove child from " + parent);
		}
	}
});

export const setAttributeAsText = mainThreadify(function setAttributeAsText(nodeId, text, name) {
	const view = getViewById(nodeId);
	if (view) {
		// attribute is registered for the view instance
		const hasOriginalAttribute = !!name.trim();

		if (text) {
			const textParts = text.split('=');

			if (textParts.length === 2) {
				const attrName = textParts[0];
				const attrValue = textParts[1].replace(/['"]+/g, '');

				// if attr name is being replaced with another
				if (name !== attrName && hasOriginalAttribute) {
					unsetViewValue(view, name);
					view[attrName] = attrValue;
				} else {
					view[hasOriginalAttribute ? name : attrName] = attrValue;
				}
			}
		} else {
			// delete attribute
			unsetViewValue(view, name);
		}

		view.domNode.loadAttributes();
	}
});
