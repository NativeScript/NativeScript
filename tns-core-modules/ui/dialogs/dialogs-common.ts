// Deifinitions.
import { View } from "ui/core/view";
import { Color } from "color";
import { Page } from "ui/page";
import * as frameModule from "ui/frame";

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
let buttonBackgroundColor: Color;

function getButtonColors(): void {
    const Button = require("ui/button").Button;
    const btn = new Button();
    applySelectors(btn);
    buttonColor = btn.color;
    buttonBackgroundColor = btn.backgroundColor;
    btn.onUnloaded();
}

// NOTE: This will fail if app.css is changed.
export function getButtonColor(): Color {
    if (!buttonColor) {
        getButtonColors();
    }

    return buttonColor;
}

// NOTE: This will fail if app.css is changed.
export function getButtonBackgroundColor(): Color {
    if (!buttonBackgroundColor) {
        getButtonColors();
    }

    return buttonBackgroundColor;
}

let textFieldColor: Color;
export function getTextFieldColor(): Color {
    if (!textFieldColor) {
        const TextField = require("ui/text-field").TextField;
        const tf = new TextField();
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
        const Label = require("ui/label").Label;
        let lbl = new Label();
        applySelectors(lbl);
        labelColor = lbl.color;
        lbl.onUnloaded();
    }

    return labelColor;
}

export function isDialogOptions(arg): boolean {
    return arg && (arg.message || arg.title);
}