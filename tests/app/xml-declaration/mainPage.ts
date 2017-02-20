import * as observable from "data/observable";
import * as view from "ui/core/view";
import * as label from "ui/label";
import * as pages from "ui/page";
import * as http from "http";

var obj = new observable.Observable();
obj.set("id", 0);
obj.set("text", "Button with event binding");
obj.set("myFunction", (args: observable.EventData) => {
    console.log("Button with event binding: " + args.object)
});

//obj.set("someItems", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
obj.set("someItems", ["One", "Two", "Three", "Four", "Five", "Six", "Seven"])

var subObj = new observable.Observable();
subObj.set("subId", 0);

obj.set("subObj", subObj);

var count = 0;
export function buttonTap(args: observable.EventData) {
    count++;

    obj.set("id", obj.get("id") + 1);

    subObj.set("subId", subObj.get("subId") + 1);

    var parent = (<view.View>args.object).parent;
    if (parent) {
        var lbl = parent.getViewById<label.Label>("Label1");
        if (lbl) {
            lbl.text = "You clicked " + count + " times!";
        }
    }

    http.getString("http://it-ebooks-api.info/v1/book/1615005640").then(r => {
        console.log("R: " + r)
    });

    http.getString("http://www.telerik.com").then(r => {
        console.log("R: " + r)
    });
}

export function MyPageLoaded(args: observable.EventData) {
    console.log("Page is loaded!");
    var page = <pages.Page>args.object;

    page.bindingContext = obj;
}

export function setPicture(args: observable.EventData) {
    // 
}