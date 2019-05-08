import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { Frame, ShownModallyData } from "tns-core-modules/ui/frame";
import { fromObject } from "tns-core-modules/data/observable";
import { confirm } from "tns-core-modules/ui/dialogs";

export function onLoaded(args) {
    console.log("modal-no-page loaded");
}

export function closeModal(args: EventData) {
    (args.object as View).closeModal();
}

export function showDialog(args: EventData) {
    let options = {
        title: "Dialog",
        message: "Message",
        okButtonText: "Yes",
        cancelButtonText: "No"

    }

    confirm(options).then((result: boolean) => {
        console.log(result);
    })
}