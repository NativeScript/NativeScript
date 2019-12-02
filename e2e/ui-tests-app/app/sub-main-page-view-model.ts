import { TestPageMainViewModel } from "./test-page-main-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";

export class SubMainPageViewModel extends TestPageMainViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}
