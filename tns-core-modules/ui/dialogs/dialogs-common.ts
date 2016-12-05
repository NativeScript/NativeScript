import color = require("color");
import frame = require("ui/frame");
import page = require("ui/page");
import button = require("ui/button");
import textField = require("ui/text-field");
import label = require("ui/label");
import types = require("utils/types");

export var STRING = "string",
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
    export var text: string = "text";

    /**
     * Password input type.
     */
    export var password: string = "password";
}

export function getCurrentPage(): page.Page {
    var topMostFrame = frame.topmost();
    if (topMostFrame) {
        return topMostFrame.currentPage;
    }

    return undefined;
}

function applySelectors(view) {
    var currentPage = getCurrentPage();
    if (currentPage) {
        var styleScope = currentPage._getStyleScope();
        if (styleScope) {
            styleScope.applySelectors(view);
        }
    }
}

var buttonColor: color.Color;
export function getButtonColor(): color.Color {
    if (!buttonColor) {
        var btn = new button.Button();
        applySelectors(btn);
        buttonColor = btn.color;
        btn.onUnloaded();
    }

    return buttonColor;
}

var buttonBackgroundColor: color.Color;
export function getButtonBackgroundColor(): color.Color {
    if (!buttonBackgroundColor) {
        var btn = new button.Button();
        applySelectors(btn);
        buttonBackgroundColor = btn.backgroundColor;
        btn.onUnloaded();
    }

    return buttonBackgroundColor;
}

var textFieldColor: color.Color;
export function getTextFieldColor(): color.Color {
    if (!textFieldColor) {
        var tf = new textField.TextField();
        applySelectors(tf);
        textFieldColor = tf.color;
    }

    return textFieldColor;
}

var labelColor: color.Color;
export function getLabelColor(): color.Color {
    if (!labelColor) {
        var lbl = new label.Label();
        applySelectors(lbl);
        labelColor = lbl.color;
    }

    return labelColor;
}

export function isDialogOptions(arg): boolean {
    return !types.isNullOrUndefined(arg) && (arg.message || arg.title);
}