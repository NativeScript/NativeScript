// >> border-require
import { Border } from "tns-core-modules/ui/border";
// << border-require
import * as helper from "../helper";

export function test_recycling() {
    helper.nativeView_recycling_test(() => new Border());
}