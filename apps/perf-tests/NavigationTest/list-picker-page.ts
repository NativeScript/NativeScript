import {Page, ShownModallyData, ListPicker} from "ui";

var closeCallback: Function;
var page: Page;
var listPicker: ListPicker;

export function onLoaded(args) {
    page = <Page>args.object;
    listPicker = page.getViewById<ListPicker>("listPicker");
}

export function onShownModally(args) {
    closeCallback = args.closeCallback;

    listPicker.items = args.context.items;
    listPicker.selectedIndex = args.context.selectedIndex || 0;
}

export function onButtonTap() {
    closeCallback(listPicker.selectedIndex);
}