import { Page } from "ui/page";
import { TextView } from "ui/text-view";
import { Color } from "color";

export function changeTextAndColor(args) {
    const page = <Page>args.object.page;
    const tv1Hint = <TextView>page.getViewById("tv1Hint");
    const tv2Hint = <TextView>page.getViewById("tv2Hint");
    const tv3Hint = <TextView>page.getViewById("tv3Hint");
    tv1Hint.text = "chnaged text + color";
    tv1Hint.color = new Color("blue");
    tv2Hint.text = "changed text only";
    tv3Hint.color = new Color("green");
}