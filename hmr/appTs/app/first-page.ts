import { Button } from "tns-core-modules/ui/button";
import { Page } from "tns-core-modules/ui/page";

export function onLoaded() {
    console.log("---> first loaded");
}

export function onTap(args) {
    console.log("---> first onTap");

    const button: Button = args.object;
    const page: Page = button.page;
    const frame = page.frame;

    frame.navigate({
        moduleName: "second-page",
        animated: true,
        transition: {
            name: "slide",
            duration: 800,
            curve: "easeIn"
        }
    });
}
