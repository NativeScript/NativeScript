import { Label } from "tns-core-modules/ui/label";
import { Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";

export function loaded(args) {
    (<Observable>(<Label>args.object).page.bindingContext).set("testPassed", true);
}

export function onNavigatingTo(args) {
    (<Page>args.object).bindingContext = args.context; 
}
