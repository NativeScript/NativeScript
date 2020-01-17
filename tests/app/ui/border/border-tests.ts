// >> border-require
import { Border } from "@nativescript/core/ui/border";
// << border-require
import * as helper from "../../ui-helper";

export function test_recycling() {
    helper.nativeView_recycling_test(() => new Border());
}
