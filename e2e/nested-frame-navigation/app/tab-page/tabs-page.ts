import { EventData } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";

export function onNavigate(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("some-page/some-page");
}

export function onBackButtonTap(args: EventData): void {
    const button = <Button>args.object;
    button.page.frame.goBack();
}
