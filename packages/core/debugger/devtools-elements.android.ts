// Types
import { InspectorEvents, InspectorCommands } from './devtools-elements-interfaces';

// Requires
import { getDocument, getComputedStylesForNode, removeNode, setAttributeAsText } from './devtools-elements.common';
import { registerInspectorEvents, DOMNode } from './dom-node';

export * from './devtools-elements-interfaces';

export function attachDOMInspectorEventCallbacks(DOMDomainFrontend: InspectorEvents) {
	registerInspectorEvents(DOMDomainFrontend);

	const originalChildNodeInserted: (parentId: number, lastId: number, node: string | DOMNode) => void = DOMDomainFrontend.childNodeInserted;

	DOMDomainFrontend.childNodeInserted = (parentId: number, lastId: number, node: DOMNode) => {
		originalChildNodeInserted(parentId, lastId, JSON.stringify(node.toObject()));
	};
}

export function attachDOMInspectorCommandCallbacks(DOMDomainBackend: InspectorCommands) {
	DOMDomainBackend.getDocument = () => {
		return JSON.stringify(getDocument());
	};

	DOMDomainBackend.getComputedStylesForNode = (nodeId) => {
		return JSON.stringify(getComputedStylesForNode(nodeId));
	};

	DOMDomainBackend.removeNode = removeNode;
	DOMDomainBackend.setAttributeAsText = setAttributeAsText;
}

export function attachCSSInspectorCommandCallbacks(CSSDomainFrontend: InspectorCommands) {
	// no op
}
