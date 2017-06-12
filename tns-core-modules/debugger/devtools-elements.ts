import { unsetValue } from "../ui/core/properties";
import { ViewBase } from "../ui/core/view-base";
import { topmost } from "../ui/frame";
import { getNodeById } from "./dom-node";

export interface Inspector {
    // DevTools -> Application communication. Methods that devtools calls when needed.
    getDocument(): string;
    removeNode(nodeId: number): void;
    getComputedStylesForNode(nodeId: number): string;
    setAttributeAsText(nodeId: number, text: string, name: string): void;

    // Application -> DevTools communication. Methods that the app should call when needed.
    childNodeInserted(parentId: number, lastId: number, nodeStr: string): void;
    childNodeRemoved(parentId: number, nodeId: number): void;
    attributeModified(nodeId: number, attrName: string, attrValue: string): void;
    attributeRemoved(nodeId: number, attrName: string): void;
}

function getViewById(nodeId: number): ViewBase {
    const node = getNodeById(nodeId);
    let view;
    if (node) {
        view = node.viewRef.get();
    }

    return view;
}

export function attachInspectorCallbacks(inspector: Inspector) {
    inspector.getDocument = function () {
        const topMostFrame = topmost();
        topMostFrame.ensureDomNode();

        return topMostFrame.domNode.toJSON();
    }

    inspector.getComputedStylesForNode = function (nodeId) {
        const view = getViewById(nodeId);
        if (view) {
            return JSON.stringify(view.domNode.getComputedProperties());
        }

        return "[]";
    }

    inspector.removeNode = function (nodeId) {
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

    inspector.setAttributeAsText = function (nodeId, text, name) {
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
}

// Automatically attach callbacks if there is __inspector
if (global && global.__inspector) {
    attachInspectorCallbacks(global.__inspector)
}