import {Page} from "ui/page";

export function onTap(args: any) {
    (<any>global).startTime = (<any>global).time();
    let page = <Page>args.object.page;
    page.frame.navigate("css-perf-test/main-page");
}
