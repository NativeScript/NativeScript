import { Button as ButtonDefinition } from "ui/button";
import { TextBaseCommon } from "../text-base/text-base-common";
import { WhiteSpace } from "ui/enums";

export abstract class ButtonBase extends TextBaseCommon implements ButtonDefinition {
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