import frame = require("ui/frame");
import observableArray = require("data/observable-array");

var loaded = 0;
var unloaded = 0;

var listView;
var textField;

export function onNavigatedTo(args) {
    print();
}

export function onTextFieldLoaded(args) {
    textField = args.object;
}

export function onListViewLoaded(args) {
    listView = args.object;
    console.log("ListView LOADED.");
    print();
    onBind();
}

export function onListViewUnloaded(args) {
    console.log("ListView UNLOADED.");
    print();
}

export function onBind() {
    var length = textField.text;
    console.log("Bind to " + length + " items");
    var items = new observableArray.ObservableArray<string>();
    var i = 0;
    for (; i < length; i++) {
        items.push("Item " + i);
    }
    listView.items = items;
    print();
}

export function onAdd() {
    var length = textField.text;
    console.log("Add " + length + " items");
    var i = 0;
    for (; i < length; i++) {
        var newItem = "Item " + (<observableArray.ObservableArray<string>>listView.items).length;
        (<observableArray.ObservableArray<string>>listView.items).push(newItem);
    }
    print();
}

export function onRemove(s) {
    var length = textField.text;
    console.log("Remove " + length + " items");
    var i = 0;
    for (; i < length; i++) {
        (<observableArray.ObservableArray<string>>listView.items).splice((<observableArray.ObservableArray<string>>listView.items).length - 1);
    }
    print();
}

export function onRefresh() {
    console.log("Refresh");
    listView.refresh();
    print();
}

export function onNavigate() {
    console.log("Navigate");
    frame.topmost().navigate({ moduleName: "./another-page" });
    print();
}

export function onViewLoaded(args) {
    loaded++;
    console.log(args.object.id + args.object._domId + " LOADED");
}

export function onViewUnloaded(args) {
    unloaded++;
    console.log(args.object.id + args.object._domId + " UNLOADED");
}

export function print() {
    console.log("L/U: " + loaded + "/" + unloaded);
}