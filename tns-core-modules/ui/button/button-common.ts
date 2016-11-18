import { Button as ButtonDefinition } from "ui/button";
import { TextBase } from "ui/text-base";
import { WhiteSpace } from "ui/enums";

export abstract class ButtonBase extends TextBase implements ButtonDefinition {
    public static tapEvent = "tap";

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.normal;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.normal : WhiteSpace.nowrap;
    }

    get whiteSpace(): string {
        return this.style.whiteSpace;
    }
    set whiteSpace(value: string) {
        this.style.whiteSpace = value;
    }
}