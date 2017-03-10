import { Button as ButtonDefinition } from ".";
import { TextBase, WhiteSpace } from "../text-base";

export * from "../text-base";

export abstract class ButtonBase extends TextBase implements ButtonDefinition {
    public static tapEvent = "tap";

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.NORMAL;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.NORMAL : WhiteSpace.NO_WRAP;
    }
}
