import { EventData } from "tns-core-modules/data/observable";
import { GestureEventData } from "tns-core-modules/ui/gestures";
import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label/label";

export function pageLoaded(args: EventData) {
    var page = <Page>args.object;
    page.bindingContext = { tapAction: tapAction, doubleTapAction: doubleTapAction, cleanResult: cleanResult };
}

export function tapAction(args: GestureEventData) {
    setResult(args, "tapAction");
}

export function doubleTapAction(args: GestureEventData) {
    setResult(args, "doubleTapAction");
}

export function cleanResult(args: GestureEventData) {
    setResult(args, "");
}

const setResult = (args: GestureEventData, text: string) => {
    console.log(text);
    const resultPanel: Label = (<Page>((<any>args.object).page)).getViewById("resultContainer");
    resultPanel.text = text;
};
