import {Page} from "ui/page";

export function onTap(args: any) {
    global.startTime = global.time();
    let page = <Page>args.object.page;
    __startCPUProfiler("alabala");
    page.frame.navigate("css-perf-test/main-page");
}