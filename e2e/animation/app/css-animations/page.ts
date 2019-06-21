import { EventData, Page } from "tns-core-modules/ui/page";
import { Frame } from "tns-core-modules/ui/frame";
import { Button } from "tns-core-modules/ui/button";

let currentFrame: Frame;

export function pageLoaded(args: EventData) {
    currentFrame = (<Page>args.object).frame;
}

export function onButtonTap(args: EventData) {
    const clickedButton = <Button>args.object;

    const destination =  clickedButton.text + "/page";
    currentFrame.navigate(destination);
}
