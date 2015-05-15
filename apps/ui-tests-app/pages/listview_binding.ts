import pageModule = require("ui/page");
import gridLayoutModule = require("ui/layouts/grid-layout");
import listViewModule = require("ui/list-view");
import observable = require("data/observable");
import observableArr = require("data/observable-array");

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