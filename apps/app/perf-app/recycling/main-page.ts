import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { TextView } from "tns-core-modules/ui/text-view";
import { Button } from "tns-core-modules/ui/button";

import * as tests from "./tests";

let runner;

function getStack(stack: StackLayout): StackLayout {
    let p = new StackLayout();
    stack.removeChildren();
    stack.addChild(p);
    return p;
}

export function onNavigatingFrom() {
    clearInterval(runner);
}

export function onTap(args) {
    let btn = <Button>args.object;
    const p = btn.page.getViewById<StackLayout>("placeholder");
    btn.text = "Start tests...";

    let result = btn.page.getViewById<TextView>("result");

    result.text = "";

    function track(line: string) {
        console.log(line);
        result.fontSize = 10;
        result.text += line + "\n";
    }

    let text = '';//"Count";
    // c.forEach(e => {
    //     text += `\t${e}`;
    // });
    track(text);

    let tasks = [
        () => track(tests.testAll(p)),
        () => track("Complete!")
    ];
    let i = 0;
    runner = setInterval(nextTask, 1);
    function nextTask() {
        if (i < tasks.length) {
            tasks[i]();
            i++;
        } else {
            clearInterval(runner);
        }
    }
}