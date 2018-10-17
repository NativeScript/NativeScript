// Types.
import { View } from "../core/view";
import { Color } from "../../color";
import { Page } from "../page";
import { isIOS } from "../../platform";
import * as frameModule from "../frame";
import { LoginOptions } from "./dialogs";

export const STRING = "string";
export const PROMPT = "Prompt";
export const CONFIRM = "Confirm";
export const ALERT = "Alert";
export const LOGIN = "Login";
export const OK = "OK";
export const CANCEL = "Cancel";

/**
 * Defines the input type for prompt dialog.
 */
export module inputType {
    /**
     * Plain text input type.
     */
    export const text: string = "text";

    /**
     * Password input type.
     */
    export const password: string = "password";

    /**
     * Email input type.
     */
    export const email: string = "email";
}

/**
 * Defines the capitalization type for prompt dialog.
 */
export module capitalizationType {
    /**
     * No automatic capitalization.
     */
    export const none: string = "none";

    /**
     * Capitalizes every character.
     */
    export const all: string = "all";

    /**
     * Capitalize the first word of each sentence.
     */
    export const sentences: string = "sentences";

    /**
     * Capitalize the first letter of every word.
     */
    export const words: string = "words";
}

let frame: typeof frameModule;
export function getCurrentPage(): Page {
    if (!frame) {
        frame = require("ui/frame");
    }

    let topmostFrame = frame.topmost();
    if (topmostFrame) {
        return topmostFrame.currentPage;
    }

    return undefined;
}

function applySelectors<T extends View>(view: T, callback: (view: T) => void) {
    let currentPage = getCurrentPage();
    if (currentPage) {
        let styleScope = currentPage._styleScope;
        if (styleScope) {
            view._inheritStyleScope(styleScope);
            view.onLoaded();
            callback(view);
            view.onUnloaded();
        }
    }
}

let button: View;
let label: View;
let textField: View;

export function getButtonColors(): { color: Color, backgroundColor: Color } {
    if (!button) {
        const Button = require("ui/button").Button;
        button = new Button;
        if (isIOS) {
            button._setupUI({});
        }
    }

    let buttonColor: Color;
    let buttonBackgroundColor: Color;
    applySelectors(button, (btn) => {
        buttonColor = btn.color;
        buttonBackgroundColor = <Color>btn.backgroundColor;
    });
    return { color: buttonColor, backgroundColor: buttonBackgroundColor };
}

export function getLabelColor(): Color {
    if (!label) {
        const Label = require("ui/label").Label;
        label = new Label;
        if (isIOS) {
            label._setupUI({});
        }
    }

    let labelColor: Color;
    applySelectors(label, (lbl) => {
        labelColor = lbl.color;
    });
    return labelColor;
}

export function getTextFieldColor(): Color {
    if (!textField) {
        const TextField = require("ui/text-field").TextField;
        textField = new TextField();
        if (isIOS) {
            textField._setupUI({});
        }
    }

    let textFieldColor: Color;
    applySelectors(textField, (tf) => {
        textFieldColor = tf.color;
    });
    return textFieldColor;
}

export function isDialogOptions(arg): boolean {
    return arg && (arg.message || arg.title);
}

export function parseLoginOptions(args: any): LoginOptions {
    let options: LoginOptions;

    let optionsDictionary = {
        optionsLenght1 : { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL, message: args[0] },
        optionsLenght2 : { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL, message: args[0], userNameHint: args[1] },
        optionsLenght3 : { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL, message: args[0], userNameHint: args[1], passwordHint: args[2] },
        optionsLenght4 : { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL, message: args[0], userNameHint: args[1], passwordHint: args[2], userName: args[3] },
        optionsLenght5 : { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL, message: args[0], userNameHint: args[1], passwordHint: args[2], userName: args[3], password: args[4] }
    }

    switch (args.length) {
        case 1:
            isString(args[0]) ? options = optionsDictionary.optionsLenght1 : options = args[0];
            break;
        case 2:
            if (isString(args[0]) && isString(args[1])) {
                options = optionsDictionary.optionsLenght2;
            }
            break;
        case 3:
            if (isString(args[0]) && isString(args[1]) && isString(args[2])) {
                options = optionsDictionary.optionsLenght3;
            }
            break;
        case 4:
            if (isString(args[0]) && isString(args[1]) && isString(args[2]) && isString(args[3])) {
                options = optionsDictionary.optionsLenght4;
            }
            break;
        case 5:
            if (isString(args[0]) && isString(args[1]) && isString(args[2]) && isString(args[3]) && isString(args[4])) {
                options = optionsDictionary.optionsLenght5;
            }
            break;
        default:
            break;
    }

    return options;
}

function isString(value): value is string {
    return typeof value === "string";
}