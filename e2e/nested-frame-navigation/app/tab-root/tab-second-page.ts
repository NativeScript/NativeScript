import * as application from "tns-core-modules/application";
import { EventData } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";

export function onNavigate(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("other-page/other-page");
}

export function onReset() {
    application._resetRootView({ moduleName: "app-root" });
}
