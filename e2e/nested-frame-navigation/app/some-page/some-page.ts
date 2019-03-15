import { EventData } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";

export function onBackButtonTap(args: EventData): void {
    const button = <Button>args.object;
    button.page.frame.goBack();
}

export function onNavigateSlide(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate({
        moduleName: "still-other-page/still-other-page",
        animated: true,
        transition: {
            name: "slide",
            duration: 300,
            curve: "easeIn"
        }
    });
}
