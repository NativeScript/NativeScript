import { unsetValue } from "../ui/core/properties";
import { ViewBase } from "../ui/core/view-base";
import { topmost } from "../ui/frame";
import { getNodeById } from "./dom-node";

function getViewById(nodeId: number): ViewBase {
    const node = getNodeById(nodeId);
    let view;
    if (node) {
        view = node.viewRef.get();
    }

    return view;
}

export function getDocument() {
    const topMostFrame = topmost();
    topMostFrame.ensureDomNode();

    return topMostFrame.domNode.toObject();
}

export function getComputedStylesForNode(nodeId): Array<{ name: string, value: string}> {
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
                    view[name] = unsetValue;
                    view[attrName] = attrValue;
                } else {
                    view[hasOriginalAttribute ? name : attrName] = attrValue;
                }
            }
        } else {
            // delete attribute
            view[name] = unsetValue;
        }

        view.domNode.loadAttributes();
    }
}
