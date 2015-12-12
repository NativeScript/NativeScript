import observable = require("data/observable");
import pages = require("ui/page");
import textField = require("ui/text-field");
import frame = require("ui/frame");

var closeCallback: Function;

var page: pages.Page;
var usernameTextField: textField.TextField;
var passwordTextField: textField.TextField;

export function onShowingModally(args: observable.EventData) {
    console.log(">>> login-page.onShowingModally");
    var modalPage = <pages.Page>args.object;
    if (modalPage.ios && modalPage.ios.modalPresentationStyle === UIModalPresentationStyle.UIModalPresentationFullScreen) {
        console.log(">>> Setting modalPage.ios.modalPresentationStyle to UIModalPresentationStyle.UIModalPresentationOverFullScreen");
        modalPage.ios.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationOverFullScreen;
    }
}

export function onShownModally(args: pages.ShownModallyData) {
    console.log(">>> login-page.onShownModally, context: " + args.context);

    closeCallback = args.closeCallback;
    var modalPage = <pages.Page>args.object;

    if (frame.topmost().currentPage.modal !== args.object) {
        throw new Error(`frame.topmost().currentPage.modal.id: ${frame.topmost().currentPage.modal.id}; modalPage.id: ${modalPage.id}`);
    }
}

export function onNavigatingTo(args: observable.EventData) {
    console.log(">>> login-page.onNavigatingTo");
}

export function onLoaded(args: observable.EventData) {
    console.log(">>> login-page.onLoaded");
    page = <pages.Page>args.object;
    usernameTextField = page.getViewById<textField.TextField>("username");
    passwordTextField = page.getViewById<textField.TextField>("password");
}

export function onNavigatedTo(args: pages.NavigatedData) {
    console.log(">>> login-page.onNavigatedTo, context: " + args.context);
}

export function onNavigatingFrom(args: observable.EventData) {
    console.log(">>> login-page.onNavigatingFrom");
}

export function onNavigatedFrom(args: observable.EventData) {
    console.log(">>> login-page.onNavigatedFrom");
}

export function onUnloaded() {
    console.log(">>> login-page.onUnloaded");
}

export function onLoginButtonTap() {
    console.log(">>> login-page.onLoginButtonTap");

    if (closeCallback) {
        closeCallback(usernameTextField.text, passwordTextField.text);
    }
    else {
        frame.topmost().goBack();
    }
}