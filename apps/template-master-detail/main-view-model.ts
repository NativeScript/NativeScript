import observable = require("data/observable");
import observableArray = require("data/observable-array");

export class ViewModelItem {
    constructor(public title: string, public info: string) {
    }
}

var items = new observableArray.ObservableArray<ViewModelItem>();
for (var i = 0; i < 20; i++) {
    items.push(new ViewModelItem("Item " + i, "This is the item with number " + i + "."));
}

export var mainViewModel = new observable.Observable();
mainViewModel.set("items", items);