import { fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";

let closeCallback;

export function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const modalPage: Page = <Page>args.object;
    modalPage.bindingContext = fromObject(context);

    console.log("---> modalPage.cssClasses");
    modalPage.cssClasses.forEach(console.log);
    const modalPageClassName = modalPage.className;
    console.log("---> modalPageClassName", modalPageClassName);
}

export function onTap(args) {
    const page: Page = <Page>args.object.page;
    const bindingContext = page.bindingContext;
    const username = bindingContext.get("username");
    const password = bindingContext.get("password");
    closeCallback(username, password);
}
