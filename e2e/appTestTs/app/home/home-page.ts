import { EventData } from "tns-core-modules/data/observable";
import { Page, View } from "tns-core-modules/ui/page";

import { HomeViewModel } from "./home-view-model";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";

import * as TKUnit from "./tk-unit";
import { Frame } from "@nativescript/core/ui/frame/frame";

export function onPageLoaded(args: EventData) {
    console.log("---> Page Loaded!");
    // let page = <Page>args.object;
    // let listView = <ListView>page.getViewById("list-view");
    // let indexes = {};
    // let completed = false;

    // listView.on(ListView.itemLoadingEvent, function (args: ItemEventData) {
    //     if (!args.view) {
    //         // args.view = new Label();
    //         console.log("---> Fail!!!");
    //     }
    //     // (<Label>args.view).text = "item " + args.index;

    //     indexes[args.index] = indexes[args.index] ? indexes[args.index] + 1 : 1;
    //     completed = args.index === (listView.items.length - 1);
    // });

    // let expected = 1;
    // TKUnit.waitUntilReady(() => completed);
    // console.log("---> Yeah!");
}

export function onItemLoading(args: EventData) {
    console.log("--->", args.object);
}

export function onListViewLoaded(args: EventData) {
    console.log("---> onListViewLoaded");
}

export function onTemplateLoaded(args: EventData) {
    console.log("---> Template Loaded!");
}

export function onGridLoaded(args: EventData) {
    console.log("---> Grid Loaded!");
}

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;

    page.bindingContext = new HomeViewModel();
}

export function selectItemTemplate(item, index, items) {
    return item.featured ? "featured" : "regular";
}


function waitUntilNavigatedTo(page: Page, action: Function) {
    let completed = false;
    function navigatedTo(args) {
        args.object.page.off("navigatedTo", navigatedTo);
        completed = true;
    }

    page.on("navigatedTo", navigatedTo);
    action();
    TKUnit.waitUntilReady(() => completed, 5);
}

function waitUntilNavigatedFrom(action: Function, topFrame?: Frame) {
    const currentPage = topFrame ? topFrame.currentPage : Frame.topmost().currentPage;
    let completed = false;
    function navigatedFrom(args) {
        args.object.page.off("navigatedFrom", navigatedFrom);
        completed = true;
    }

    currentPage.on("navigatedFrom", navigatedFrom);
    action();
    TKUnit.waitUntilReady(() => completed);
}

export function waitUntilLayoutReady(view: View): void {
    TKUnit.waitUntilReady(() => view.isLayoutValid);
}
