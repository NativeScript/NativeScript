import { EventData } from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page';
import { Button } from "tns-core-modules/ui/button";
import { Label } from "tns-core-modules/ui/label";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";

const getElementById = (obj, id) => {
    return obj.getViewById(id);
}

export function toggle(args: EventData) {
    const page = <Page>((<any>args.object).page);
    const toggleBtn = <Button>getElementById(page, "toggleUserInteraction");
    const isEnabled = toggleBtn.text === "disable" ? true : false;
    toggleBtn.text = !isEnabled ? "disable" : "enable";
    const gridLayout = (<GridLayout>(getElementById(page, "layoutid")));
    (<Button>getElementById(page, "testBtn")).isUserInteractionEnabled = !isEnabled;
    (<Button>getElementById(page, "testLabel")).isUserInteractionEnabled = !isEnabled;
    (<StackLayout>getElementById(page, "testStackLayout")).isUserInteractionEnabled = !isEnabled;
}

export function test() {
    console.log("onTap");
    alert("onTap");
}