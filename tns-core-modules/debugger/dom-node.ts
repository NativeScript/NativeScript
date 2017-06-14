import { getSetProperties, getComputedCssValues } from "../ui/core/properties";
import { PercentLength } from "../ui/styling/style-properties";
import { ViewBase } from "../ui/core/view";
import { Color } from "../color";
import { CSSComputedStyleProperty } from "./css-agent";
import { Inspector } from "./devtools-elements";

const registeredDomNodes = {};
const ELEMENT_NODE_TYPE = 1;
const ROOT_NODE_TYPE = 9;
const propertyBlacklist = [
    "effectivePaddingLeft",
    "effectivePaddingBottom",
    "effectivePaddingRight",
    "effectivePaddingTop",
    "effectiveBorderTopWidth",
    "effectiveBorderRightWidth",
    "effectiveBorderBottomWidth",
    "effectiveBorderLeftWidth",
    "effectiveMinWidth",
    "effectiveMinHeight",
    "nodeName",
    "nodeType",
    "decodeWidth",
    "decodeHeight",
    "ng-reflect-items",
    "domNode",
    "touchListenerIsSet",
    "bindingContext"
];

function notifyInspector(callback: (inspector: Inspector) => void) {
    const ins = (<any>global).__inspector;
    if (ins) {
        callback(ins);
    }
}

function valueToString(value: any): string {
    if (typeof value === "undefined" || value === null) {
        return "";
    } else if (value instanceof Color) {
        return value.toString();
    } else if (typeof value === "object" && value.unit) {
        return PercentLength.convertToString(value);
    } else {
        return value + "";
    }
}

function propertyFilter([name, value]: [string, any]): boolean {
    if (name[0] === "_") {
        return false;
    }

    if (value !== null && typeof value === "object") {
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
    nodeValue = "";
    attributes: string[] = [];
    viewRef: WeakRef<ViewBase>;

    constructor(view: ViewBase) {
        this.viewRef = new WeakRef(view);
        this.nodeType = view.typeName === "Frame" ? ROOT_NODE_TYPE : ELEMENT_NODE_TYPE;
        this.nodeId = view._domId;
        this.nodeName = view.typeName;
        this.localName = this.nodeName;

        // Load all attributes
        this.loadAttributes();

        registerNode(this);
    }

    public loadAttributes() {
        this.attributes = [];
        getSetProperties(this.viewRef.get())
            .filter(propertyFilter)
            .forEach(pair => this.attributes.push(pair[0], pair[1] + ""));

    }

    get children(): DOMNode[] {
        const view = this.viewRef.get();
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
            const view = this.viewRef.get();

            let previousChild: ViewBase;
            view.eachChild((child) => {
                if (child === childView) {
                    return false;
                }

                previousChild = child;

                return true;
            });
            const index = !!previousChild ? previousChild._domId : 0;

            childView.ensureDomNode();
            ins.childNodeInserted(this.nodeId, index, childView.domNode.toJSON());
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
        const view = this.viewRef.get();
        if (!view) {
            return [];
        }

        const result = getComputedCssValues(view)
            .filter(pair => pair[0][0] !== "_")
            .map((pair) => {
                return {
                    name: pair[0],
                    value: valueToString(pair[1])
                };
            });
        return result;
    }

    dispose() {
        unregisterNode(this);
        this.viewRef.clear();
    }

    public toJSON() {
        return JSON.stringify(this.toObject());
    }

    private toObject() {
        return {
            nodeId: this.nodeId,
            nodeType: this.nodeType,
            nodeName: this.nodeName,
            localName: this.localName,
            nodeValue: this.nodeValue,
            children: this.children.map(c => c.toObject()),
            attributes: this.attributes
        };
    }
}
