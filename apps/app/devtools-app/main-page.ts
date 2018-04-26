import * as frame from "tns-core-modules/ui/frame";
import { Label } from "tns-core-modules/ui/label";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
// import { DOMNode } from "tns-core-modules/debugger/dom-node";

export function print(args) {
    // const node = new DOMNode(frame.topmost());
    // console.dir(node.toJSON());

    // const btn = args.object.page.getViewById("btn");
    // btn.ensureDomNode();
    // console.dir(btn.domNode.getComputedProperties());
}

let i = 0;
export function add(args) {
    const container = args.object.page.getViewById("container");
    const lbl = new Label();
    lbl.text = "label " + i++;
    container.addChild(lbl);
}

export function remove(args) {
    const container = <StackLayout>args.object.page.getViewById("container");
    const lbl = container.getChildAt(container.getChildrenCount() - 1);
    container.removeChild(lbl);
}

export function navigate() {
    frame.topmost().navigate("gallery-app/main-page");
}

export function change(args) {
    args.object.text = "hi " + Math.random();

}