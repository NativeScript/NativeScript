import { EventData } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";

export function onBackButtonTap(args: EventData): void {
    const button = <Button>args.object;
    button.page.frame.goBack();
}
