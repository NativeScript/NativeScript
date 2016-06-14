import definition = require("ui/label");
import textBase = require("ui/text-base");
import {WhiteSpace} from "ui/enums";

export class Label extends textBase.TextBase implements definition.Label {

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.normal;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.normal : WhiteSpace.nowrap;
    }
}