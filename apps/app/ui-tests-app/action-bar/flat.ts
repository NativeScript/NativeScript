import { Label } from "tns-core-modules/ui/Label";
import { Page } from "tns-core-modules/ui/Page";

export function onNavigateTo(args) {
    const actionBar = (<Page>args.object).actionBar;
    args.object.flatPropertyValue = <Label>args.object.getViewById("flatPropertyValue");
    actionBar.flat = true;
    args.object.flatPropertyValue.text = "Action bar flat property is set to: " + actionBar.flat;
}

export function changeFlatPropertyValue(args) {
    const actionBar = (<Page>args.object.page).actionBar;
    actionBar.flat = !actionBar.flat;
    args.object.page.flatPropertyValue.text = "Action bar flat property is set to: " + actionBar.flat;
}