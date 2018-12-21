import { EventData } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { isAndroid } from "tns-core-modules/platform";

export function onNavigate(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("some-page/some-page");
}

export function onNavigateNone(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate({
        moduleName: "some-page/some-page",
        animated: false
    });
}

export function onNavigateSlide(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate({
        moduleName: "some-page/some-page",
        animated: true,
        transition: {
            // TODO: restore "slide" when https://github.com/NativeScript/NativeScript/issues/6728 is fixed
            name: isAndroid ? "slide" : "slideRight",
            duration: 300,
            curve: "easeIn"
        }
    });
}

export function onNavigateFlip(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate({
        moduleName: "some-page/some-page",
        animated: true,
        transition: {
            name: "flip",
            duration: 300,
            curve: "easeIn"
        }
    });
}

export function onBackButtonTap(args: EventData): void {
    const button = <Button>args.object;
    button.page.frame.goBack();
}
