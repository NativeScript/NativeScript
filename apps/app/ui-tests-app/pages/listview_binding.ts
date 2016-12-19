import * as pageModule from "ui/page";
import * as gridLayoutModule from "ui/layouts/grid-layout";
import * as listViewModule from "ui/list-view";
import * as observable from "data/observable";
import * as observableArr from "data/observable-array";

var arr = new observableArr.ObservableArray();
for (var i = 0; i < 100; i++) {
    arr.push("item " + i);
}

export function createPage() {
    var page: pageModule.Page = new pageModule.Page();
    var grid: gridLayoutModule.GridLayout = new gridLayoutModule.GridLayout();
    var listView: listViewModule.ListView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.loadedEvent, function (args: observable.EventData) {
        (<any>args.object).items = arr;
    });
    grid.addChild(listView);
    page.content = grid;

    return page;
}