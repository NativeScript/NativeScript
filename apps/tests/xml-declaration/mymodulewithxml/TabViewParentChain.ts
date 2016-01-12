import {Label} from "ui/label";
import {Observable} from "data/observable";
import {Page} from "ui/page";

export function loaded(args) {
    (<Observable>(<Label>args.object).page.bindingContext).set("testPassed", true);
}

export function onNavigatingTo(args) {
    (<Page>args.object).bindingContext = args.context; 
}