import {Page} from "ui/page";

export function onTap(args: any) {
    global.startTime = global.time();
    let page = <Page>args.object.page;
    page.frame.navigate("css-perf-test/main-page");
}