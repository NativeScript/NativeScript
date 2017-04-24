import * as frame from "tns-core-modules/ui/frame";
import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import * as application from "tns-core-modules/application";

var indexCounter = 0;
var navCounter = 0;
var images = ["gravatar", "gravatar2", "red"];

export function onLoad(args: EventData) {
    let index = indexCounter++ % 3;
    let page = <Page>args.object;
    page.backgroundImage = '~/ui-tests-app/image-view/' + images[index] + '.png';
    setLabelText(args.object.page, navCounter, "countInfo");
    getMemoryUsage(args);
}

export function navigate(args: EventData) {
    navCounter++;
    frame.topmost().navigate("ui-tests-app/perf/memory-leaks/background-image");
}

export function navigateBack(args: EventData) {
    navCounter--;
    frame.topmost().goBack();
}

function setLabelText(page: Page, text: number, id: string) {
    let label = page.getViewById(id);
    label.text = text + '';
}

function getMemoryUsage(args: EventData) {
    var mi = new android.app.ActivityManager.MemoryInfo();
    var activityManager = application.android.context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
    activityManager.getMemoryInfo(mi);
    let usedMemory = mi.totalMem - mi.availMem;
    
    setLabelText(args.object, usedMemory, "usedMemory");

    console.log("availMem in bytes: " + mi.availMem);
    console.log("Percentage usage: " + (mi.availMem / mi.totalMem));
    console.log("Available memory (megabytes): " + mi.availMem);
    console.log("Used memory (megabytes): " + usedMemory);
}
