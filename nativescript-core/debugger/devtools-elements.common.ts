import { getNodeById, DOMNode } from "./dom-node";
import { Color } from "../color";

// Needed for typings only
import { View, ViewBase } from "../ui/core/view";



import { isIOS, isAndroid } from "../platform";

import { mainThreadify, layout } from "../utils/utils";
import { TouchGestureEventData, GestureTypes } from "../ui/gestures";

// Use lazy requires for core modules
const getAppRootView: () => View = () => require("../application").getRootView();

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
    const appRoot = getAppRootView();
    if (!appRoot) {
        return undefined;
    }

    try {
        appRoot.ensureDomNode();

    } catch (e) {
        console.log("ERROR in getDocument(): " + e);
    }

    return appRoot.domNode.toObject();
}

export function getComputedStylesForNode(nodeId): Array<{ name: string, value: string }> {
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
});

export const setAttributeAsText = mainThreadify(function setAttributeAsText(nodeId, text, name) {
    const view = getViewById(nodeId);
    if (view) {
        // attribute is registered for the view instance
        let hasOriginalAttribute = !!name.trim();

        if (text) {
            let textParts = text.split("=");

            if (textParts.length === 2) {
                let attrName = textParts[0];
                let attrValue = textParts[1].replace(/['"]+/g, "");

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

interface HighlightedView {
    view: ViewBase;
    cachedValue: any;
};


const highlightColor = new Color("#A86FA8DC");
const highlightedViews: HighlightedView[] = [];

export const highlightNode = mainThreadify((nodeId: number, selector?) => {
    console.log("[overlay]: highlightNode", nodeId, selector);

    hideHighlight();

    const view = getViewById(nodeId);
    if (!view) {
        return;
    }

    const adView = view.android;
    if (adView && adView.setForeground) {
        const highlightForeground = new android.graphics.drawable.ColorDrawable(highlightColor.android);
        highlightedViews.push({
            view: view,
            cachedValue: adView.getForeground()
        });
        adView.setForeground(highlightForeground);
    }

    const iosView: UIView = view.ios;
    if (iosView && iosView.addSubview) {
        const maskView = UIView.alloc().initWithFrame(iosView.bounds);
        maskView.backgroundColor = highlightColor.ios;
        maskView.userInteractionEnabled = false;
        iosView.addSubview(maskView);

        highlightedViews.push({
            view: view,
            cachedValue: maskView
        });
    }

});

export const hideHighlight = mainThreadify(() => {
    console.log("[overlay]: hideHighlight");

    while (highlightedViews.length > 0) {
        const hv = highlightedViews.pop();

        const adView = hv.view.android;
        if (adView && adView.setForeground) {
            adView.setForeground(hv.cachedValue);
        }

        const iosView = hv.view.ios;
        if (iosView && hv.cachedValue) {
            (<UIView>hv.cachedValue).removeFromSuperview();
        }
    }
})


function eachDescendant(view: View, callback: (child: View) => boolean) {
    if (!callback || !view) {
        return;
    }

    let traverseChildren: boolean;
    let localCallback = function (child: View): boolean {
        traverseChildren = callback(child);
        if (traverseChildren) {
            child.eachChildView(localCallback);
        }

        return true;
    };

    view.eachChildView(localCallback);
}

function rootViewTouched(event: TouchGestureEventData) {
    if (event.action === "up" || event.action === "cancel") {
        DOMNode.requestCancelInspect();
    } else {
        handleSearch(event.view, event.getX(), event.getY());
    }
}

function handleSearch(root: View, x: number, y: number) {
    console.log("rootViewTouched", x, y);

    const stack: View[] = [];
    eachDescendant(root, (child: View) => {
        const point = child.getLocationInWindow();
        const size = child.getActualSize();

        // console.log("Child: ", child, point, size)

        if (point && size &&
            point.x < x && x < (point.x + size.width) &&
            point.y < y && y < (point.y + size.height)) {

            stack.push(child);
            return true;
        }
        return false;
    })

    console.log(stack.join(", "));

    if (stack.length) {
        const topView = stack[stack.length - 1];
        const domNode = topView.domNode

        highlightNode(domNode.nodeId);
        domNode.requestHighligh();
    }

}


let overlayContentView: org.nativescript.widgets.ContentLayout;
export const setInspectMode = mainThreadify((mode: "none" | "searchForNode") => {
    console.log("[overlay]: setInspectMode", mode)

    const root = getAppRootView();
    if (root) {
        if (isIOS) {
            if (mode === "searchForNode") {
                console.log("start listening for root view touches");
                root.on(GestureTypes.touch, rootViewTouched);
                root.eachChildView(cv => {
                    cv.isUserInteractionEnabled = false;
                    return true;
                })
            } else {
                console.log("stop listening for root view touches");
                root.off(GestureTypes.touch, rootViewTouched);
                root.eachChildView(cv => {
                    cv.isUserInteractionEnabled = true;
                    return true;
                })
            }
        }

        if (isAndroid) {
            if (mode === "searchForNode") {
                const activity: android.app.Activity = root._context;
                if (!overlayContentView) {
                    overlayContentView = new org.nativescript.widgets.ContentLayout(activity);

                    overlayContentView.setOnTouchListener(new android.view.View.OnTouchListener({
                        onTouch: (v: android.view.View, event: android.view.MotionEvent): boolean => {
                            if (event.getAction() == android.view.MotionEvent.ACTION_UP) {
                                console.log("Canceling touch listener");

                                DOMNode.requestCancelInspect();
                            } else {
                                handleSearch(root, event.getX() / layout.getDisplayDensity(), event.getY() / layout.getDisplayDensity())
                            }
                            return true;
                        }
                    }))
                }
                activity.addContentView(overlayContentView, new org.nativescript.widgets.CommonLayoutParams());
            } else {
                if (overlayContentView) {
                    (<android.view.ViewGroup>overlayContentView.getParent()).removeView(overlayContentView);
                }
            }
        }
    }
})