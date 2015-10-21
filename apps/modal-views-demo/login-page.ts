import observable = require("data/observable");
import pages = require("ui/page");
import textField = require("ui/text-field");
import frame = require("ui/frame");

var context: any;
var closeCallback: Function;

var page: pages.Page;
var usernameTextField: textField.TextField;
var passwordTextField: textField.TextField;

export function onShownModally(args: pages.ShownModallyData) {
    console.log("login-page.onShownModally, context: " + args.context);
    context = args.context;
    closeCallback = args.closeCallback;
    var modalPage = <pages.Page>args.object;

    if (frame.topmost().currentPage.modal !== args.object) {
        throw new Error(`frame.topmost().currentPage.modal.id: ${frame.topmost().currentPage.modal.id}; modalPage.id: ${modalPage.id}`);
    }
}

export function onLoaded(args: observable.EventData) {
    console.log("login-page.onLoaded");
    page = <pages.Page>args.object;
    usernameTextField = page.getViewById<textField.TextField>("username");
    passwordTextField = page.getViewById<textField.TextField>("password");
}

export function onUnloaded() {
    console.log("login-page.onUnloaded");
}

export function onLoginButtonTap() {
    console.log("login-page.onLoginButtonTap");
    closeCallback(usernameTextField.text, passwordTextField.text);
}