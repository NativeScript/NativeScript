import * as model from "~/ui-tests-app/layouts/myview";
import { Page } from "tns-core-modules/ui/page";

export function onLoaded(args: { eventName: string, object: any }) {
    var page = <Page>args.object;
    page.bindingContext = new model.ViewModel();
}
