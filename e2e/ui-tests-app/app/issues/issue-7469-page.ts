import { EventData } from "tns-core-modules/data/observable";
import { Page, Color } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { removeCallback, start, stop, addCallback } from "tns-core-modules/fps-meter";
import { Label } from "tns-core-modules/ui/label/label";

let callbackId;
let fpsLabel: any;
export function startFPSMeter() {
    callbackId = addCallback((fps: number, minFps: number) => {
        // console.log(`Frames per seconds: ${fps.toFixed(2)}`);
        // console.log(minFps.toFixed(2));
        if (fpsLabel) {
            fpsLabel.text = `${fps}`;
        }

    });
    start();
}

export function stopFPSMeter() {
    removeCallback(callbackId);
    stop();
}

let timeouts = [];
let intervals = [];

let reusableItem;
let loaded = false;
let isIn1 = false;

export function pageLoaded(args) {
    startFPSMeter();
    if (loaded) {
        fpsLabel = null;
        // stopFPSMeter();
        timeouts.forEach((v) => clearTimeout(v));
        intervals.forEach((v) => clearInterval(v));
        reusableItem._tearDownUI(true);
    }
    loaded = true;
    reusableItem = args.object.getViewById("reusableItem");
    fpsLabel = args.object.getViewById("fpslabel");
    const stack1: StackLayout = args.object.getViewById("stack1");
    const stack2: StackLayout = args.object.getViewById("stack2");
    setTimeout(() => {
        // label.android.setTextColor(new Color("red").android);
        // label.android.setBackgroundColor(new Color("red").android);
        startFPSMeter();
        console.log("setRed");
    }, 1000);
    // console.log(label._context);
    // isIn1 = false;
    // timeouts.push(setTimeout(() => {
    //     intervals.push(setInterval(() => {
    //         label.parent.removeChild(label);
    //         // console.log(label.nativeView);
    //         if(isIn1) {
    //             isIn1 = false;
    //             stack2.addChild(label);
    //         } else {
    //             isIn1 = true;
    //             stack1.addChild(label);
    //         }
    //     }, 10));
    // }, 1001));
}

export function pageUnloaded(args) {
    //
}

export function makeReusable(args: EventData) {
    console.log("loaded:", args.object);
    // console.log("making reusable");
    (args.object as any).reusable = true;
}

export function onReusableUnloaded(args: EventData) {
    console.log("unloaded:", args.object);
}
var testLabel: Label;

export function test(args: any) {
    const page = args.object.page;
    reusableItem = page.getViewById("reusableItem");
    const stack1: StackLayout = page.getViewById("stack1");
    const stack2: StackLayout = page.getViewById("stack2");
    if (!testLabel) {
        testLabel = new Label();
        testLabel.text = "This label is not reusable and is dynamic";
        testLabel.on("loaded", () => { console.log("LODADED testLabel"); });
        testLabel.on("unloaded", () => { console.log("UNLODADED testLabel"); });
    }
    reusableItem.parent.removeChild(reusableItem);
    if (!reusableItem._suspendNativeUpdatesCount) {
        console.log("reusableItem SHOULD BE UNLOADED");
    }
    if (!testLabel._suspendNativeUpdatesCount) {
        console.log("testLabel SHOULD BE UNLOADED");
    }
    if (!testLabel.parent) {
        reusableItem.addChild(testLabel);
    }
    if (!testLabel.nativeView) {
        console.log("testLabel NATIVE VIEW SHOULD BE CREATED");
    }
    if (!testLabel._suspendNativeUpdatesCount) {
        console.log("testLabel SHOULD BE UNLOADED");
    }
    if (isIn1) {
        isIn1 = false;
        stack2.addChild(reusableItem);
    } else {
        isIn1 = true;
        stack1.addChild(reusableItem);
    }
    if (reusableItem._suspendNativeUpdatesCount) {
        console.log("reusableItem SHOULD BE LOADED AND RECEIVING UPDATES");
    }
    if (testLabel._suspendNativeUpdatesCount) {
        console.log("testLabel SHOULD BE LOADED AND RECEIVING UPDATES");
    }
    // console.log("onTap");
    // alert("onTap");
}
