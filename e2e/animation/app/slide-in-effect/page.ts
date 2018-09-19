import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Layout } from "tns-core-modules/ui/layouts/layout";
import { Image } from "tns-core-modules/ui/image";

let wrapLayout: Layout;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    wrapLayout = page.getViewById<Layout>("wrapLayout");
}

export function onAddItem(args: EventData) {
    var item = new Image();
    item.src = "~/res/icon_100x100.png";
    item.width = 90;
    item.height = 90;
    item.style.margin = "5,5,5,5";
    item.translateX = -300;
    item.opacity = 0;
    item.on("loaded", (args: EventData) => {
        (<View>args.object).animate({translate: { x: 0, y: 0 }, opacity: 1});
    });
    wrapLayout.addChild(item);
}

export function onClear(args: EventData) {
    var i = wrapLayout.getChildrenCount() - 1;
    while (i >= 0) {
        wrapLayout.removeChild(wrapLayout.getChildAt(i--));
    }
}
