import { getRootView, on, orientationChangedEvent } from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button";
import { ShowModalOptions } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";

import { HelloWorldModel } from "./main-view-model";

const modalView = "./modal-page";

let rootView;

export function loaded() {
    rootView = getRootView();
    console.log("---> rootView.cssClasses");
    rootView.cssClasses.forEach(console.log);
    const rootViewClassName = rootView.className;
    console.log("---> rootViewClassName", rootViewClassName);
}

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new HelloWorldModel();
}

on(orientationChangedEvent, (args) => {
    rootView = getRootView();
    console.log("---> args", args.newValue);
    rootView.cssClasses.forEach(console.log);
});

export function onTap(args) {
    const button: Button = <Button>args.object;
    const options: ShowModalOptions = {
        context: { username: "username", password: "password" },
        closeCallback: (username, password) => {
            console.log(`Username: ${username}, Password: ${password}`);
        },
        fullscreen: true
    };
    button.showModal(modalView, options);
}
