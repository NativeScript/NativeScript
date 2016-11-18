import { Color } from "color";
import { topmost } from "ui/frame";
import { Page } from "ui/page";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { Label } from "ui/label";
import { View } from "ui/core/view";
import * as types from "utils/types";

export let STRING = "string",
    PROMPT = "Prompt",
    CONFIRM = "Confirm",
    ALERT = "Alert",
    LOGIN = "Login",
    OK = "OK",
    CANCEL = "Cancel";

/**
 * Defines the input type for prompt dialog.
 */
export module inputType {
    /**
     * Plain text input type.
     */
    export let text: string = "text";

    /**
     * Password input type.
     */
    export let password: string = "password";
}

export function getCurrentPage(): Page {
    let topmostFrame = topmost();
    if (topmostFrame) {
        return topmostFrame.currentPage;
    }

    return undefined;
}

function applySelectors(view: View) {
    let currentPage = getCurrentPage();
    if (currentPage) {
        let styleScope = currentPage._getStyleScope();
        if (styleScope) {
            styleScope.applySelectors(view);
        }
    }
}

let buttonColor: Color;
// NOTE: This will fail if app.css is changed.
export function getButtonColor(): Color {
    if (!buttonColor) {
        let btn = new Button();
        applySelectors(btn);
        buttonColor = btn.color;
        btn.onUnloaded();
    }

    return buttonColor;
}

let buttonBackgroundColor: Color;
// NOTE: This will fail if app.css is changed.
export function getButtonBackgroundColor(): Color {
    if (!buttonBackgroundColor) {
        let btn = new button.Button();
        applySelectors(btn);
        buttonBackgroundColor = btn.backgroundColor;
        btn.onUnloaded();
    }

    return buttonBackgroundColor;
}

let textFieldColor: Color;
export function getTextFieldColor(): Color {
    if (!textFieldColor) {
        let tf = new TextField();
        applySelectors(tf);
        textFieldColor = tf.color;
        tf.onUnloaded();
    }

    return textFieldColor;
}

let labelColor: Color;
// NOTE: This will fail if app.css is changed.
export function getLabelColor(): Color {
    if (!labelColor) {
        let lbl = new Label();
        applySelectors(lbl);
        labelColor = lbl.color;
        lbl.onUnloaded();
    }

    return labelColor;
}

export function isDialogOptions(arg): boolean {
    return !types.isNullOrUndefined(arg) && (arg.message || arg.title);
}
