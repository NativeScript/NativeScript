import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { TextView } from "tns-core-modules/ui/text-view";
import { Button } from "tns-core-modules/ui/button";
import * as platform from "tns-core-modules/platform";
import * as application from "tns-core-modules/application";

import * as tests from "./tests";

let runner;

function getStack(stack: StackLayout): StackLayout {
    let p = new StackLayout();
    stack.removeChildren();
    stack.addChild(p);
    return p;
}

export function navigatingTo(args) {
    // Request permission to write test-results.xml file for API >= 23
    if (platform.isAndroid && parseInt(platform.device.sdkVersion) >= 23) {
        let handler = (args: application.AndroidActivityRequestPermissionsEventData) => {
            application.android.off(application.AndroidApplication.activityRequestPermissionsEvent, handler);
            if (args.requestCode === 1234 && args.grantResults.length > 0 && args.grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED) {
                console.log("Permission for write to external storage GRANTED!")
            } else {
                console.log("Permission for write to external storage not granted!");
            }
        };

        application.android.on(application.AndroidApplication.activityRequestPermissionsEvent, handler);

        if ((<any>android.support.v4.content.ContextCompat).checkSelfPermission(application.android.currentContext, (<any>android).Manifest.permission.WRITE_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
            (<any>android.support.v4.app.ActivityCompat).requestPermissions(application.android.currentContext, [(<any>android).Manifest.permission.WRITE_EXTERNAL_STORAGE], 1234);
        }
    } else {
        console.log("Permission for write to external storage GRANTED!")
    }
}

export function onNavigatingFrom() {
    clearInterval(runner);
}

export function onTap(args) {
    let btn = <Button>args.object;
    const p = btn.page.getViewById<StackLayout>("placeholder");
    btn.text = "Start tests...";

    let result = btn.page.getViewById<TextView>("result");

    result.text = "";

    function track(line: string) {
        console.log(line);
        result.fontSize = 10;
        result.text += line + "\n";
    }

    let text = '';//"Count";
    // c.forEach(e => {
    //     text += `\t${e}`;
    // });
    track(text);

    let tasks = [
        () => track(tests.testSetup(p)),
        () => track(tests.testFlexboxLayout(p)),
        () => track(tests.testDockLayout(p)),
        () => track(tests.testGridLayout(p)),
        () => track(tests.testStackLayout(p)),
        () => track(tests.testWrapLayout(p)),
        () => track(tests.testAbsoluteLayout(p)),
        () => track(tests.testButton(p)),
        () => track(tests.testActionBar(p)),
        () => track(tests.testActivityIndicator(p)),
        () => track(tests.testBorder(p)),
        () => track(tests.testContentView(p)),
        () => track(tests.testDatePicker(p)),
        () => track(tests.testHtmlView(p)),
        () => track(tests.testImage(p)),
        () => track(tests.testLabel(p)),
        () => track(tests.testListPicker(p)),
        () => track(tests.testListView(p)),
        () => track(tests.testPage(p)),
        () => track(tests.testProgress(p)),
        () => track(tests.testRepeater(p)),
        () => track(tests.testSwitch(p)),
        () => track(tests.testTextField(p)),
        () => track(tests.testTextView(p)),
        () => track("Complete!")
    ];
    let i = 0;
    runner = setInterval(nextTask, 1);
    function nextTask() {
        if (i < tasks.length) {
            tasks[i]();
            i++;
        } else {
            clearInterval(runner);
        }
    }
}