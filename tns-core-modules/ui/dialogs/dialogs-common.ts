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

function isString(value): value is string {
    return typeof value === "string";
}
export function parseLoginOptions(args: any): LoginOptions {
    let options: LoginOptions;
    let defaultOptions = { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL };

    if (arguments.length === 1) {
        if (isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        } else {
            options = arguments[0];
        }
    } else if (arguments.length === 2) {
        if (isString(arguments[0]) && isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userNameHint = arguments[1];
        }
    } else if (arguments.length === 3) {
        if (isString(arguments[0]) && isString(arguments[1]) && isString(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userNameHint = arguments[1];
            options.passwordHint = arguments[2];
        }
    } else if (arguments.length === 4) {
        if (isString(arguments[0]) && isString(arguments[1]) && isString(arguments[2]) && isString(arguments[3])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userNameHint = arguments[1];
            options.passwordHint = arguments[2];
            options.userName = arguments[3];
        }
    } else if (arguments.length === 5) {
        if (isString(arguments[0]) && isString(arguments[1]) && isString(arguments[2]) && isString(arguments[3]) && isString(arguments[4])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userNameHint = arguments[1];
            options.passwordHint = arguments[2];
            options.userName = arguments[3];
            options.password = arguments[4];
        }
    }

    return options;
}