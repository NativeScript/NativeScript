import { Button as ButtonDefinition } from "ui/button";
import { TextBase } from "ui/text-base";

export * from "ui/text-base";

export abstract class ButtonBase extends TextBase implements ButtonDefinition {
    public static tapEvent = "tap";

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? "normal" : "nowrap";
    }
}