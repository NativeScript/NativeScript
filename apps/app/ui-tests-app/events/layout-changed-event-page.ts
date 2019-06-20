import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { Button } from "tns-core-modules/ui/button";
import { TextView } from "tns-core-modules/ui/text-view";
import { View } from "tns-core-modules/ui/core/view";
import { EventData } from "tns-core-modules/data/observable";
let buttonsCount = 1;

export function onLayoutChanged(args) {
    let msg = "StackLayout layout changed - width:" + args.object.getActualSize().width;
    (<TextView>args.object.page.getViewById("output")).text += msg + "\n";
}

export function addChild(args) {
    let button = new Button();
    button.text = "Button" + buttonsCount;
    button.margin = 10;
    button.backgroundColor = "lightgreen";
    
    (<StackLayout>args.object.page.getViewById("target")).addChild(button);
    buttonsCount++;
}

export function clear(args) {
    (<StackLayout>args.object.page.getViewById("target")).removeChildren();
    args.object.page.getViewById("output").text = "";
}
