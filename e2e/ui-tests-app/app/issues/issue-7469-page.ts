import { EventData } from "tns-core-modules/data/observable";
import { Page, Color } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { removeCallback, start, stop, addCallback } from "tns-core-modules/fps-meter";

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

export function toggle(args: EventData) {
    const page = <Page>((<any>args.object).page);

    const getElementById = id => page.getViewById(id);

    const toggleBtn = <Button>getElementById("toggleUserInteraction");
    const isEnabled = toggleBtn.text === "disable" ? true : false;
    toggleBtn.text = !isEnabled ? "disable" : "enable";

    (<Button>getElementById("testBtn")).isUserInteractionEnabled = !isEnabled;
    (<Button>getElementById("testLabel")).isUserInteractionEnabled = !isEnabled;
    (<StackLayout>getElementById("testStackLayout")).isUserInteractionEnabled = !isEnabled;
}

let timeouts = [];
let intervals = [];

let label;
let loaded = false;
let isIn1 = false;

export function pageLoaded(args) {
    startFPSMeter();
    if (loaded) {
        fpsLabel = null;
        // stopFPSMeter();
        timeouts.forEach((v) => clearTimeout(v));
        intervals.forEach((v) => clearInterval(v));
        label._tearDownUI(true);
    }
    loaded = true;
    label = args.object.getViewById("removelabel");
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
    // console.log("making reusable");
    (args.object as any).reusable = true;
}

export function test(args: any) {
    const page = args.object.page;
    label = page.getViewById("removelabel");
    const stack1: StackLayout = page.getViewById("stack1");
    const stack2: StackLayout = page.getViewById("stack2");
    label.parent.removeChild(label);
    // console.log(label.nativeView);
    if (isIn1) {
        isIn1 = false;
        stack2.addChild(label);
    } else {
        isIn1 = true;
        stack1.addChild(label);
    }
    // console.log("onTap");
    // alert("onTap");
}
