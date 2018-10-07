// Types.
import { View } from "../core/view";
import { Color } from "../../color";
import { Page } from "../page";
import { isIOS } from "../../platform";
import * as frameModule from "../frame";

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
