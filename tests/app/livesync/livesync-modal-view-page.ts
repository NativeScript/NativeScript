import { View, ShowModalOptions } from "@nativescript/core/ui/core/view";
const LIVESYNC_FOLDER = "livesync/";
const buttonPageModuleName = `${LIVESYNC_FOLDER}livesync-button-page`;

export function onLoaded(args) {
    const view = args.object as View;

    let options: ShowModalOptions = {
        context: "context",
        closeCallback: () => console.log("modal view closeCallback raised."),
        animated: false
    };

    view.showModal(buttonPageModuleName, options);
}
