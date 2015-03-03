import observable = require("data/observable");
import listViewDef = require("ui/list-view");
import labelDef = require("ui/label");

export function listViewLoaded(args: observable.EventData) {
    var listView = <listViewDef.ListView>args.object;
    listView.items = new Array(1000);
}

export function listViewItemLoading(args: listViewDef.ItemEventData) {
    var label = <labelDef.Label>args.view;
    if (!label) {
        label = new labelDef.Label();
        args.view = label;
    }

    label.text = "News " + args.index;
}