import { EventData, View, TextBase } from "ui/text-base";
import { LayoutBase } from "ui/layouts/layout-base";

let cssClassNames = [
    "", 
    "padding", 
    "border", 
    "background-color",
    "padding border",
    "padding background-color",
    "border background-color",
    "padding border background-color"
];

let currentIndex = 0;

export function onChangeCSS(args: EventData){
    let page = (<View>args.object).page;
    let container = <LayoutBase>page.getViewById<LayoutBase>("container");
    currentIndex++;
    let newClassName = cssClassNames[currentIndex % cssClassNames.length];
    for(let i = 0, length = container.getChildrenCount(); i < length; i++){
        let child = container.getChildAt(i);
        child.className = newClassName;
    }
    (<TextBase>page.getViewById<TextBase>("info")).text = newClassName || "none";
}