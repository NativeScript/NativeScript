import { getNodeById } from "./dom-node";

// Needed for typings only
import { ViewBase } from "../ui/core/view-base";

// Use lazy requires for core modules
const frameTopmost = () => { return require("../ui/frame").topmost(); };

let unsetValue;
function unsetViewValue(view, name) {
    if (!unsetValue) {
        unsetValue = require("../ui/core/properties").unsetValue;
    }
    
    view[name] = unsetValue;
}

function getViewById(nodeId: number): ViewBase {
    const node = getNodeById(nodeId);
    let view;
    if (node) {
        view = node.viewRef.get();
    }

    return view;
}

export function getDocument() {
    const topMostFrame = frameTopmost();
    try {
        topMostFrame.ensureDomNode();
        
    } catch (e) {
        console.log("ERROR in getDocument(): " + e);
    }
    return topMostFrame.domNode.toObject();
}

export function getComputedStylesForNode(nodeId): Array<{ name: string, value: string }> {
    const view = getViewById(nodeId);
    if (view) {
        return view.domNode.getComputedProperties();
    }

    return [];
}

export function removeNode(nodeId) {
    const view = getViewById(nodeId);
    if (view) {
        // Avoid importing layout and content view
        let parent = <any>view.parent;
        if (parent.removeChild) {
            parent.removeChild(view);
        } else if (parent.content === view) {
            parent.content = null;
        }
        else {
            console.log("Can't remove child from " + parent);
        }
    }
}

export function setAttributeAsText(nodeId, text, name) {
    const view = getViewById(nodeId);
    if (view) {
        // attribute is registered for the view instance
        let hasOriginalAttribute = !!name.trim();

        if (text) {
            let textParts = text.split("=");

            if (textParts.length === 2) {
                let attrName = textParts[0];
                let attrValue = textParts[1].replace(/['"]+/g, '');

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
}
