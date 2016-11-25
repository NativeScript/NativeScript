import { Color } from "color";
import { EventData } from "data/observable";
import { Page } from "ui/page";

var page: Page;
var borderColor : Color = new Color("#ff0000");
export function navigatingTo(args: EventData) {
    page = <Page>args.object;
}

export function onSetBorderWidthTo0() {
    let buttonElement = page.getViewById("button1");
    buttonElement.borderColor = borderColor;
    buttonElement.borderWidth = 0;

    let labelElement = page.getViewById("label1");
    labelElement.borderColor = borderColor;
    labelElement.borderWidth = 0;
}

export function onSetBorderWidthTo3() {
    let buttonElement = page.getViewById("button1");
    buttonElement.borderColor = borderColor;
    buttonElement.borderWidth = 3;

    let labelElement = page.getViewById("label1");
    labelElement.borderColor = borderColor;
    labelElement.borderWidth = 3;
}