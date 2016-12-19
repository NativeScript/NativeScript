import * as view from "ui/core/view";
import * as pages from "ui/page";
import { EventData } from "data/observable";
import * as button from "ui/button";

var cssPercentage = " Page { margin:5% 10% 15% 8%; background-color: orange; font-size:8; } GridLayout { margin:3%; background-color: lightgreen; font-size:8; } StackLayout { border-color:red; border-width:1px; } StackLayout * { border-color:blue; border-width:1px; } GridLayout { border-color:green;border-width:1px; } .test1 { padding:10%; } .test2 { padding:10%; background-color:lightblue; } .test3 { margin:1% 2% 3% 4%; } WrapLayout { orientation:vertical; width:75%; height:45% } Button { color:black }"
var cssWithouPercentage = " Page { margin:15 10 15 30; background-color: orange; font-size:8; } GridLayout { margin:3; background-color: lightgreen; font-size:8; } StackLayout { border-color:red; border-width:1px; } StackLayout * { border-color:blue; border-width:1px; } GridLayout { border-color:green;border-width:1px; } .test1 { padding:10; } .test2 { padding:10; background-color:lightblue; } .test3 { margin:10 20 30 40; } WrapLayout { orientation:vertical; width:100; height:120 } Button { color:black }"

var isSCCWithPercentage = true;

export function pageLoaded(args: EventData) {
    let page = <pages.Page>args.object;
    page.css = cssPercentage;
    getBtnText(args);
}

export function applyTap(args: EventData) {
    let page = <pages.Page>(<view.View>args.object).page;
    let css = isSCCWithPercentage ? cssWithouPercentage : cssPercentage;
    isSCCWithPercentage = !isSCCWithPercentage;
    console.log(css);
    page.css = css;
    getBtnText(args);
}

function getBtnText(args: EventData) {
    var parent = (<view.View>args.object).parent;
    if (parent) {
        var btn = <button.Button>view.getViewById(parent, "button");
        if (btn) {
            if (isSCCWithPercentage) {
                btn.text = "css with %";
            } else {
                btn.text = "css without %";
            }

            console.log(btn.text);
        }
    }
}